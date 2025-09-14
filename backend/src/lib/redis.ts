import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL as string);

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export default redis;