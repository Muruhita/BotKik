import { Redis } from '@upstash/redis';
import { addToBlacklist } from './blacklist';

const redis = Redis.fromEnv();

const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 3, // Максимум 3 заявки в час
  COOLDOWN_SECONDS: 30,
  SPAM_BAN_REASON: 'Автоматический бан за превышение лимита заявок (3 в час)'
};

export async function checkSpam(userId, username) {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const keyRequests = `spam:requests:${userId}`;
  const keyLast = `spam:last:${userId}`;

  // 1. Проверка кулдауна (30 сек)
  const lastRequest = await redis.get(keyLast);
  if (lastRequest) {
    const timeSinceLast = now - parseInt(lastRequest);
    const cooldownMs = CONFIG.COOLDOWN_SECONDS * 1000;
    if (timeSinceLast < cooldownMs) {
      const timeLeft = Math.ceil((cooldownMs - timeSinceLast) / 1000);
      return {
        isSpam: false,
        isBanned: false,
        message: `⏳ Подождите ${timeLeft} сек. между заявками`,
        timeLeft
      };
    }
  }

  // 2. Очищаем старые записи и считаем количество заявок за последний час
  await redis.zremrangebyscore(keyRequests, 0, hourAgo);
  const requestsInHour = await redis.zcard(keyRequests);

  // 3. Если уже 3 или более заявок — баним
  if (requestsInHour >= CONFIG.MAX_REQUESTS_PER_HOUR) {
    await addToBlacklist(userId, username, CONFIG.SPAM_BAN_REASON);
    await redis.del(keyRequests);
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы превысили лимит заявок (${CONFIG.MAX_REQUESTS_PER_HOUR} в час). Доступ заблокирован.`
    };
  }

  // 4. Фиксируем новый запрос
  await redis.zadd(keyRequests, { score: now, member: `${now}` });
  await redis.set(keyLast, now, { ex: CONFIG.COOLDOWN_SECONDS });
  await redis.expire(keyRequests, 3600); // авто-удаление ключа через 1 час

  return {
    isSpam: false,
    isBanned: false,
    timeLeft: 0,
    requestsInHour: requestsInHour + 1,
    maxRequests: CONFIG.MAX_REQUESTS_PER_HOUR
  };
}
