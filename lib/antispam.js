import redis from './redis';

const CONFIG = {
  MAX_ATTEMPTS: 5,          // 3 заявки
  WINDOW_SECONDS: 3600,     // За 1 час (3600 секунд)
  COOLDOWN_SECONDS: 10,     // Минимальный интервал между заявками (10 сек)
  BAN_DURATION: 60 * 60 * 24 * 7 // Бан на 7 дней
};

// Проверка спама (увеличивает счётчик)
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

// Получить список всех забаненных (ключи, начинающиеся с blacklist:)
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

// Сброс счётчика заявок (для разбана)
export async function clearSpamLog(userId) {
  await redis.del(`spam:${userId}:count`, `spam:${userId}:start`, `spam:${userId}:last`);
  return true;
}

// Снятие бана
export async function removeBlacklist(userId) {
  await redis.del(`blacklist:${userId}`);
  return true;
}

// Проверка бана
export async function isBlacklisted(userId) {
  const banned = await redis.get(`blacklist:${userId}`);
  return !!banned;
}

// Остановка/возобновление подачи заявок
export async function toggleFormSubmission(status) {
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}

// Проверка, открыта ли подача заявок
export async function isFormSubmissionActive() {
  const status = await redis.get('forms:active');
  return status === null ? true : status === 'true';
}

// Получить текущий статус попыток (без увеличения счётчика) — для профиля
export async function getSpamStatus(userId) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const banKey = `blacklist:${userId}`;
  const now = Date.now();

  // Если в бане
  const isBanned = await redis.get(banKey);
  if (isBanned) {
    return { isBanned: true, attemptsLeft: 0 };
  }

  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) {
    // Нет записей – доступно максимум
    return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  }

  // Если прошло больше часа, окно сброшено
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    return { isBanned: false, attemptsLeft: CONFIG.MAX_ATTEMPTS };
  }

  attempts = parseInt(attempts);
  return {
    isBanned: false,
    attemptsLeft: Math.max(0, CONFIG.MAX_ATTEMPTS - attempts)
  };
}
