import Redis from 'ioredis';

// Подключение к Redis из переменной окружения REDIS_URL
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const CONFIG = {
  MAX_ATTEMPTS: 2,          // 3 заявки подряд
  WINDOW_SECONDS: 3600,     // за 1 час
  COOLDOWN_SECONDS: 10,     // минимальный интервал между заявками (10 сек)
  BAN_DURATION: 60 * 60 * 24 * 7 // Бан на 7 дней (в секундах)
};

// Основная проверка на спам
export async function checkSpam(userId, username) {
  const countKey = `spam:${userId}:count`;
  const startKey = `spam:${userId}:start`;
  const lastKey = `spam:${userId}:last`;
  const banKey = `blacklist:${userId}`;
  
  const now = Date.now();

  // 1. Проверяем, не в бане ли уже
  const isBanned = await redis.get(banKey);
  if (isBanned) {
    return {
      isSpam: true,
      isBanned: true,
      message: '⛔ Вы в чёрном списке. Обратитесь к администрации для разблокировки.'
    };
  }

  // 2. Проверяем кулдаун (чтобы не было мгновенного флуда)
  const lastRequest = await redis.get(lastKey);
  if (lastRequest) {
    const timeSinceLast = now - parseInt(lastRequest);
    if (timeSinceLast < CONFIG.COOLDOWN_SECONDS * 1000) {
      return {
        isSpam: true,
        isBanned: false,
        message: `⏳ Подождите ${Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - timeSinceLast) / 1000)} сек. между заявками.`,
        timeLeft: Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - timeSinceLast) / 1000)
      };
    }
  }

  // 3. Ищем текущее окно (час)
  let attempts = await redis.get(countKey);
  let startTime = await redis.get(startKey);

  if (!attempts || !startTime) {
    attempts = 0;
    startTime = now;
  }

  // Если прошло больше часа - сбрасываем счётчик
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    attempts = 0;
    startTime = now;
  }

  attempts = parseInt(attempts) + 1;

  // 4. Превышен лимит (больше 3 за час) -> БАН
  if (attempts > CONFIG.MAX_ATTEMPTS) {
    await redis.set(banKey, username, 'EX', CONFIG.BAN_DURATION);
    await redis.del(countKey, startKey, lastKey);
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы отправили ${CONFIG.MAX_ATTEMPTS} заявки за 1 час. Доступ заблокирован на 7 дней.`
    };
  }

  // 5. Сохраняем состояние (окно 1 час)
  await redis.set(countKey, attempts, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(startKey, startTime, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(lastKey, now, 'EX', CONFIG.COOLDOWN_SECONDS);

  return {
    isSpam: false,
    isBanned: false,
    attemptsLeft: CONFIG.MAX_ATTEMPTS - attempts,
    timeLeft: 0
  };
}

// Сброс счётчика заявок (для разбана)
export async function clearSpamLog(userId) {
  await redis.del(`spam:${userId}:count`);
  await redis.del(`spam:${userId}:start`);
  await redis.del(`spam:${userId}:last`);
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
