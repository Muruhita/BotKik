import Redis from 'ioredis';

let redis;

if (!global._redis) {
  global._redis = new Redis(process.env.REDIS_URL, {
    // Включаем offline queue — команды будут ждать переподключения
    enableOfflineQueue: true,
    // Таймаут подключения
    connectTimeout: 10000,
    // Пытаемся переподключиться (максимум 5 попыток)
    retryStrategy(times) {
      if (times > 5) {
        console.error('[Redis] Превышено число попыток переподключения');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    // Keep-alive, чтобы Upstash не рвал соединение
    keepAlive: 10000,
    // Отключаем lazy connect
    lazyConnect: false,
    // Не падать на 1 попытке
    maxRetriesPerRequest: null,
  });
  redis = global._redis;
} else {
  redis = global._redis;
}

redis.on('connect', () => {
  console.log('[Redis] ✅ Подключено');
});

redis.on('error', (err) => {
  console.error('[Redis] ❌ Ошибка:', err.message);
});

export default redis;
