import { db } from '../src/db';
import { plans } from '../src/models/schema';

async function seedPlans() {
  try {
    // Clear existing plans
    await db.delete(plans);
    
    // Insert default plans
    await db.insert(plans).values([
      {
        slug: 'free',
        name: 'Free Plan',
        description: 'Basic access with limited AI features',
        priceCents: 0,
        currency: 'INR',
        isUnlimited: false,
        summarizeLimitPerDay: 5,
        askLimitPerDay: 30,
      },
      {
        slug: 'citizen-pro',
        name: 'Citizen Pro',
        description: 'Enhanced AI access for citizens',
        priceCents: 29900,
        currency: 'INR',
        isUnlimited: false,
        summarizeLimitPerDay: 20,
        askLimitPerDay: 100,
      },
      {
        slug: 'lawyer-pro',
        name: 'Lawyer Pro',
        description: 'Unlimited AI access for legal professionals',
        priceCents: 99900,
        currency: 'INR',
        isUnlimited: true,
        summarizeLimitPerDay: 0,
        askLimitPerDay: 0,
      },
    ]);

    console.log('✅ Default plans seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();