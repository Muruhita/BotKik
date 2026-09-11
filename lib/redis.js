import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  connectTimeout: 5000,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 1000, 3000);
  },
});

redis.on('error', (err) => {
  console.error('[Redis] Ошибка подключения:', err.message);
});

export default redis;
