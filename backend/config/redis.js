// redis.js
require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST, // mybookstore-redis.redis.cache.windows.net
  port: process.env.REDIS_PORT || 6380,
  username: "default",
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false,
  },
  connectTimeout: 10000,
});

redis.on("connect", () => console.log("✅ Connected to Azure Redis Cache"));
redis.on("error", (err) => console.error("Redis connection error:", err));

module.exports = redis;
