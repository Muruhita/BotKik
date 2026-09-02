import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const CONFIG = {
  MAX_ATTEMPTS: 3,          // 3 заявки
  WINDOW_SECONDS: 3600,     // За 1 час (3600 секунд)
  SPAM_BAN_REASON: 'Превышение лимита заявок (3 за час)',
  COOLDOWN_SECONDS: 10      // Минимальный интервал между заявками
};

export async function checkSpam(userId, username) {
  const key = `spam:${userId}`;
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

  // 2. Проверяем кулдаун между заявками (10 сек)
  const lastRequest = await redis.get(key + ':last');
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

  // 3. Ищем текущее окно заявок (час)
  let attempts = await redis.get(key + ':count');
  let startTime = await redis.get(key + ':start');

  if (!attempts || !startTime) {
    attempts = 0;
    startTime = now;
  }

  // Если прошло больше часа - сбрасываем счетчик
  if (now - parseInt(startTime) > CONFIG.WINDOW_SECONDS * 1000) {
    attempts = 0;
    startTime = now;
  }

  attempts = parseInt(attempts) + 1;

  // 4. Если лимит превышен - бан
  if (attempts > CONFIG.MAX_ATTEMPTS) {
    // Бан на 7 дней (можно изменить)
    await redis.set(banKey, username, 'EX', 60 * 60 * 24 * 7);
    await redis.del(key + ':count');
    await redis.del(key + ':start');
    await redis.del(key + ':last');
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы отправили ${CONFIG.MAX_ATTEMPTS} заявки за 1 час. Доступ заблокирован на 7 дней.`
    };
  }

  // 5. Сохраняем состояние
  await redis.set(key + ':count', attempts, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(key + ':start', startTime, 'EX', CONFIG.WINDOW_SECONDS);
  await redis.set(key + ':last', now, 'EX', CONFIG.COOLDOWN_SECONDS);

  return {
    isSpam: false,
    isBanned: false,
    attemptsLeft: CONFIG.MAX_ATTEMPTS - attempts,
    timeLeft: 0
  };
}

export async function clearSpamLog(userId) {
  await redis.del(`spam:${userId}:count`);
  await redis.del(`spam:${userId}:start`);
  await redis.del(`spam:${userId}:last`);
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
