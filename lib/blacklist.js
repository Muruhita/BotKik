// blacklist.js (заглушка, так как логика перенесена в antispam.js)
export async function addToBlacklist(userId, username, reason) {
  const Redis = (await import('ioredis')).default;
  const redis = new Redis(process.env.REDIS_URL);
  await redis.set(`blacklist:${userId}`, username, 'EX', 60 * 60 * 24 * 7); // Бан на 7 дней
  await redis.quit();
  return true;
}
