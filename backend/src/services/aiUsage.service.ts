import { db } from '../db';
import { aiUsage } from '../models/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import redis from '../lib/redis';
import { AIUsageParams } from '../utils/types/ai.types';

export async function logAIUsage(params: AIUsageParams) {
  const { userId, ipAddress, endpoint, usageCount = 1 } = params;
  
  // Redis key for daily usage tracking
  const today = new Date().toISOString().split('T')[0];
  const redisKey = userId 
    ? `ai_usage:${userId}:${endpoint}:${today}`
    : `ai_usage:${ipAddress}:${endpoint}:${today}`;
  
  // Increment Redis counter
  await redis.incrby(redisKey, usageCount);
  // Set expiration to 48 hours to handle day boundaries
  await redis.expire(redisKey, 48 * 60 * 60);
  
  // Also log to database for persistence
  await db.insert(aiUsage).values({
    userId,
    ipAddress,
    endpoint,
    usageCount,
  });
}

export async function getUsageCount(params: { 
  userId?: string; 
  ipAddress?: string; 
  endpoint: string; 
}): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { userId, ipAddress, endpoint } = params;
  
  // Try Redis first
  const redisKey = userId 
    ? `ai_usage:${userId}:${endpoint}:${today}`
    : `ai_usage:${ipAddress}:${endpoint}:${today}`;
  
  const redisCount = await redis.get(redisKey);
  if (redisCount) {
    return parseInt(redisCount, 10);
  }
  
  // Fall back to database if Redis doesn't have the data
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const conditions = [
    eq(aiUsage.endpoint, endpoint),
    gte(aiUsage.usageDate, startOfDay),
  ];

  if (userId) {
    conditions.push(eq(aiUsage.userId, userId));
  } else if (ipAddress) {
    conditions.push(eq(aiUsage.ipAddress, ipAddress));
  } else {
    return 0;
  }

  const result = await db
    .select({ count: sql<number>`sum(${aiUsage.usageCount})` })
    .from(aiUsage)
    .where(and(...conditions));

  return result[0]?.count || 0;
}