import redis from './redis';

export async function addToBlacklist(userId, username, reason = 'Банворд') {
  const data = JSON.stringify({ username, reason, timestamp: Date.now() });
  await redis.set(`blacklist:${userId}`, data, 'EX', 60 * 60 * 24 * 7);
  return true;
}

export async function isBlacklisted(userId) {
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

export async function removeFromBlacklist(userId) {
  await redis.del(`blacklist:${userId}`);
  return true;
}