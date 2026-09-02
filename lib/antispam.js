import fs from 'fs';
import path from 'path';
import { addToBlacklist } from './blacklist';

const LOG_FILE = path.join(process.cwd(), 'data', 'spam_log.json');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const CONFIG = {
  COOLDOWN_SECONDS: 30,
  MAX_REQUESTS_PER_HOUR: 6,
  SPAM_BAN_REASON: 'Автоматический бан за спам (6+ заявок за час)'
};

function loadSpamLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка загрузки лога спама:', error);
  }
  return {};
}

function saveSpamLog(log) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения лога спама:', error);
  }
}

export function checkSpam(userId, username) {
  const log = loadSpamLog();
  const now = Date.now();
  const cooldownMs = CONFIG.COOLDOWN_SECONDS * 1000;
  const hourMs = 3600000; // 1 час
  
  if (!log[userId]) {
    log[userId] = [now];
    saveSpamLog(log);
    return { isSpam: false, isBanned: false, timeLeft: 0 };
  }
  
  // Очищаем старые записи (более 1 часа назад)
  const recentRequests = log[userId].filter(timestamp => now - timestamp < hourMs);
  
  // Проверка кулдауна (30 секунд)
  const lastRequest = recentRequests[recentRequests.length - 1];
  if (now - lastRequest < cooldownMs) {
    const timeLeft = Math.ceil((cooldownMs - (now - lastRequest)) / 1000);
    addToBlacklist(userId, username, 'Автоматический бан за нарушение кулдауна (30 секунд)');
    delete log[userId];
    saveSpamLog(log);
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы нарушили кулдаун (30 секунд между заявками). Доступ к системе заблокирован.`,
      timeLeft: timeLeft
    };
  }
  
  // Проверка: более 6 заявок за час
  if (recentRequests.length >= CONFIG.MAX_REQUESTS_PER_HOUR) {
    addToBlacklist(userId, username, CONFIG.SPAM_BAN_REASON);
    delete log[userId];
    saveSpamLog(log);
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы отправили более ${CONFIG.MAX_REQUESTS_PER_HOUR} заявок за час. Доступ к системе заблокирован.`,
      timeLeft: 0
    };
  }
  
  recentRequests.push(now);
  log[userId] = recentRequests;
  saveSpamLog(log);
  
  return { isSpam: false, isBanned: false, timeLeft: 0 };
}

export function clearSpamLog(userId) {
  const log = loadSpamLog();
  if (log[userId]) {
    delete log[userId];
    saveSpamLog(log);
    return true;
  }
  return false;
}

export function getSpamStats(userId) {
  const log = loadSpamLog();
  if (!log[userId]) return null;
  
  const now = Date.now();
  const hourMs = 3600000;
  const recentRequests = log[userId].filter(timestamp => now - timestamp < hourMs);
  
  return {
    requestsInLastHour: recentRequests.length,
    maxRequestsPerHour: CONFIG.MAX_REQUESTS_PER_HOUR,
    cooldownSeconds: CONFIG.COOLDOWN_SECONDS,
    timeLeft: recentRequests.length > 0 ? Math.max(0, Math.ceil((CONFIG.COOLDOWN_SECONDS * 1000 - (now - recentRequests[recentRequests.length - 1])) / 1000)) : 0
  };
}
