import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST, // mybookstore-redis.redis.cache.windows.net
  port: process.env.REDIS_PORT || 6380,
  username: "default", 
  password: process.env.REDIS_PASSWORD, 
  tls: {
    rejectUnauthorized: false, 
  },
  connectTimeout: 10000, 
});

redisClient.on("connect", () => {
  console.log("Connected to Azure Redis Cache");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redisClient;
