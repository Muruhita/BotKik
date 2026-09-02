import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ADMIN_IDS = ['1018113109346504744'];

export async function isBlacklisted(userId) {
  const isBanned = await redis.sismember('blacklist', userId);
  return Boolean(isBanned);
}

export async function addToBlacklist(userId, username, reason = 'Банворд') {
  await redis.sadd('blacklist', userId);
  await redis.hset(`user:${userId}`, {
    username,
    reason,
    timestamp: new Date().toISOString()
  });
  return true;
}

export async function removeFromBlacklist(userId, requesterId) {
  if (!ADMIN_IDS.includes(requesterId)) {
    return { success: false, error: 'Недостаточно прав для снятия блокировки' };
  }
  
  await redis.srem('blacklist', userId);
  await redis.del(`user:${userId}`);
  return { success: true };
}

export function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}
