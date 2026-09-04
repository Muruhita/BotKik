import redis from './redis';

const CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_SECONDS: 3600,
  COOLDOWN_SECONDS: 10,
  BAN_DURATION: 60 * 60 * 24 * 7
};

export async function checkSpam(userId, username) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const lastKey = `spam:${userId}:last`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  const isBanned = await redis.get(banKey);
  if (isBanned) return { isSpam: true, isBanned: true, message: '⛔ Вы в чёрном списке.' };

  const lastRequest = await redis.get(lastKey);
  if (lastRequest) {
    const timeSinceLast = now - parseInt(lastRequest);
    if (timeSinceLast < CONFIG.COOLDOWN_SECONDS * 1000) {
      return { isSpam: true, isBanned: false, message: `⏳ Подождите ${Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - timeSinceLast) / 1000)} сек.` };
    }
  }

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) { attempts = 0; startTime = now; }
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) { attempts = 0; startTime = now; }

  attempts = parseInt(attempts) + 1;

  if (attempts > CONFIG.MAX_ATTEMPTS) {
    await redis.set(banKey, username, 'EX', CONFIG.BAN_DURATION);
    await redis.del(countKey, startKey, lastKey);
    return { isSpam: true, isBanned: true, message: `⛔ Вы отправили ${CONFIG.MAX_ATTEMPTS} заявки за 1 час. Доступ заблокирован на 7 дней.` };
  }

  await redis.set(countKey, attempts, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(startKey, startTime, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(lastKey, now, 'EX', CONFIG.COOLDOWN_SECONDS);

  return { isSpam: false, isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS - attempts, timeLeft: 0 };
}

export async function getAllBannedUsers() {
  const keys = await redis.keys('blacklist:*');
  const users = [];
  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      users.push({ userId: key.replace('blacklist:', ''), reason: data });
    }
  }
  return users;
}

export async function clearSpamLog(userId) {
  await redis.del(`spam:${userId}:count`, `spam:${userId}:start`, `spam:${userId}:last`);
  return true;
}

export async function removeBlacklist(userId) {
  await redis.del(`blacklist:${userId}`);
  return true;
}

export async function isBlacklisted(userId) {
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

export async function toggleFormSubmission(status) {
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}

export async function isFormSubmissionActive() {
  const status = await redis.get('forms:active');
  return status === null ? true : status === 'true';
}