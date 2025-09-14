import { db } from '../db';
import { subscriptions, plans, users } from '../models/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function getUserWithRole(userId: string) {
  const result = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

export async function getActiveSubscriptionForUser(userId: string) {
  try {
    const now = new Date();
    
    const result = await db
      .select({
        subscription: subscriptions,
        plan: plans,
      })
      .from(subscriptions)
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.validUntil, now)
        )
      )
      .orderBy(sql`${subscriptions.createdAt} DESC`)
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Error fetching active subscription:', error);
    return null;
  }
}

export async function isUserUnlimited(userId: string): Promise<boolean> {
  try {
    const subscription = await getActiveSubscriptionForUser(userId);
    return subscription?.plan?.isUnlimited || false;
  } catch (error) {
    console.error('Error checking if user has unlimited access:', error);
    return false;
  }
}

export async function getUserDailyLimits(userId: string): Promise<{ 
  summarizeLimit: number; 
  askLimit: number;
  role: string;
}> {
  try {
    const [user, subscription] = await Promise.all([
      getUserWithRole(userId),
      getActiveSubscriptionForUser(userId)
    ]);
    
    // If user has an active subscription with a plan, use those limits
    if (subscription?.plan) {
      return {
        summarizeLimit: subscription.plan.summarizeLimitPerDay || 0,
        askLimit: subscription.plan.askLimitPerDay || 0,
        role: user?.role || 'citizen'
      };
    }
    
    // Return role-based limits if no subscription
    const role = user?.role || 'citizen';
    const roleLimits = {
      admin: { summarize: 100, ask: 200 },
      lawyer: { summarize: 10, ask: 50 },
      citizen: { summarize: 5, ask: 30 },
    };
    
    const limits = roleLimits[role as keyof typeof roleLimits] || roleLimits.citizen;
    
    return {
      summarizeLimit: limits.summarize,
      askLimit: limits.ask,
      role
    };
  } catch (error) {
    console.error('Error getting user daily limits:', error);
    // Return safe defaults in case of error
    return {
      summarizeLimit: 5,
      askLimit: 30,
      role: 'citizen'
    };
  }
}