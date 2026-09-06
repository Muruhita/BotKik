import redis from './redis';

const CONFIG = {
  MAX_ATTEMPTS: 3,
  WINDOW_SECONDS: 3600,
  COOLDOWN_SECONDS: 10,
  BAN_DURATION: 60 * 60 * 24 * 7
};

// ... (остальные функции без изменений: checkSpam, getAllBannedUsers, clearSpamLog, removeBlacklist, isBlacklisted, isFormSubmissionActive)

export async function toggleFormSubmission(status) {
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}

// НОВОЕ: Получить статус конкретной формы
export async function getFormStatus(type) {
  const status = await redis.get(`form_status:${type}`);
  return status === null ? true : status === 'true'; // По умолчанию включена
}

// НОВОЕ: Установить статус конкретной формы
export async function toggleFormTypeStatus(type, status) {
  await redis.set(`form_status:${type}`, status ? 'true' : 'false');
  return status;
}

// НОВОЕ: Получить список всех форм и их статусов
export async function getAllFormStatuses() {
  const types = ['promotion', 'transfer', 'report', 'highrank', 'resignation', 'reinstatement', 'transferToFib', 'weaponRequest', 'leave', 'withdrawal', 'hiring'];
  const statuses = {};
  
  for (const type of types) {
    const status = await getFormStatus(type);
    statuses[type] = status;
  }
  
  return statuses;
}

// ОБНОВЛЁННОЕ: При остановке всех форм, устанавливаем все индивидуальные флаги в false, при включении - удаляем (true)
export async function toggleFormSubmissionGlobal(status) {
  if (status === false) {
    // Останавливаем всё: выставляем флаги false для всех форм
    const types = ['promotion', 'transfer', 'report', 'highrank', 'resignation', 'reinstatement', 'transferToFib', 'weaponRequest', 'leave', 'withdrawal', 'hiring'];
    for (const type of types) {
      await redis.set(`form_status:${type}`, 'false');
    }
  } else {
    // Включаем всё: удаляем все индивидуальные флаги (по умолчанию true)
    const keys = await redis.keys('form_status:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
  await redis.set('forms:active', status ? 'true' : 'false');
  return status;
}
