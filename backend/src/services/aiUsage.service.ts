import { db } from '../db';
import { aiUsage } from '../models/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import redis from '../lib/redis';
import { AIUsageParams } from '../utils/types/ai.types';
import { hashClientIp } from '../utils/client-ip';

function redisKeys(endpoint: string, today: string, userId?: string, ipFingerprint?: string | null) {
  if (userId) {
    return { redisKey: `ai_usage:${userId}:${endpoint}:${today}` };
  }
  const ipKey = ipFingerprint || 'anon';
  return { redisKey: `ai_usage:${ipKey}:${endpoint}:${today}` };
}

export async function logAIUsage(params: AIUsageParams) {
  const { userId, ipAddress, endpoint, usageCount = 1 } = params;
  const ipFingerprint = !userId && ipAddress ? hashClientIp(ipAddress) : null;

  const today = new Date().toISOString().split('T')[0];
  const { redisKey } = redisKeys(endpoint, today, userId, ipFingerprint);

  await redis.incrby(redisKey, usageCount);
  await redis.expire(redisKey, 48 * 60 * 60);

  await db.insert(aiUsage).values({
    userId,
    ipAddress: userId ? null : ipFingerprint ?? (ipAddress ? hashClientIp(ipAddress) : null),
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
  const ipFingerprint = !userId && ipAddress ? hashClientIp(ipAddress) : null;
  const { redisKey } = redisKeys(endpoint, today, userId, ipFingerprint);

  const redisCount = await redis.get(redisKey);
  if (redisCount) {
    return parseInt(redisCount, 10);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const conditions = [eq(aiUsage.endpoint, endpoint), gte(aiUsage.usageDate, startOfDay)];

  if (userId) {
    conditions.push(eq(aiUsage.userId, userId));
  } else if (ipFingerprint) {
    conditions.push(eq(aiUsage.ipAddress, ipFingerprint));
  } else {
    return 0;
  }

  const result = await db
    .select({ count: sql<number>`sum(${aiUsage.usageCount})` })
    .from(aiUsage)
    .where(and(...conditions));

  return result[0]?.count || 0;
}
