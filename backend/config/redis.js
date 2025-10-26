const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,  // ex: mybookstore-redis.redis.cache.windows.net
  port: process.env.REDIS_PORT || 6380,
  password: process.env.REDIS_PASSWORD,  // your primary key
  tls: {}, // required for Azure Redis
});

redis.on('connect', () => console.log('Connected to Azure Redis Cache'));
redis.on('error', (err) => console.error('Redis error', err));

module.exports = redis;
