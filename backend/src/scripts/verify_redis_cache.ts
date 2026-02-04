import { AIService } from '../services/ai.service';
import redis from '../lib/redis';

async function main() {
  const aiService = new AIService();

  const text = 'This is a sample text to verify Redis caching for summarizeText.';
  const level: 'short' | 'medium' | 'long' = 'short';

  console.log('--- Verifying Redis cache for summarizeText ---');

  const startMiss = Date.now();
  const resultMiss = await aiService.summarizeText({ text, level });
  const durationMiss = Date.now() - startMiss;

  console.log('First call (expected cache miss) duration (ms):', durationMiss);
  console.log('First result summary (truncated):', resultMiss.summary.slice(0, 120));

  const startHit = Date.now();
  const resultHit = await aiService.summarizeText({ text, level });
  const durationHit = Date.now() - startHit;

  console.log('Second call (expected cache hit) duration (ms):', durationHit);
  console.log('Second result summary matches first:', resultHit.summary === resultMiss.summary);

  // Optional: list keys that match the prefix to visually confirm
  const keys = await redis.keys('summary:text:*');
  console.log('Redis summary:text:* keys:', keys);

  await redis.quit();
}

main().catch((err) => {
  console.error('Error running verify_redis_cache:', err);
  process.exit(1);
});

