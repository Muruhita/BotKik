import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Добавление в черный список (мгновенный бан)
export async function addToBlacklist(userId, username, reason = 'Банворд') {
  const data = JSON.stringify({ username, reason, timestamp: Date.now() });
  // Храним 7 дней
  await redis.set(`blacklist:${userId}`, data, 'EX', 60 * 60 * 24 * 7);
  return true;
}

// Проверка на бан
export async function isBlacklisted(userId) {
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

// Снятие бана
export async function removeFromBlacklist(userId) {
  await redis.del(`blacklist:${userId}`);
  return true;
}
