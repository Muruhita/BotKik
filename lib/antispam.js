import fs from 'fs';
import path from 'path';
import { addToBlacklist } from './blacklist';

const LOG_FILE = path.join(process.cwd(), 'data', 'spam_log.json');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const CONFIG = {
  MAX_REQUESTS_PER_HOUR: 7, // Максимум 7 заявок в час
  COOLDOWN_SECONDS: 30, // Кулдаун между заявками
  SPAM_BAN_REASON: 'Автоматический бан за превышение лимита заявок (7 в час)'
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
  const hourMs = 60 * 60 * 1000;

  if (!log[userId]) {
    log[userId] = {
      requests: [],
      lastRequest: now
    };
    saveSpamLog(log);
    return {
      isSpam: false,
      isBanned: false,
      timeLeft: 0,
      requestsInHour: 0
    };
  }

  const userLog = log[userId];
  const currentTime = now;

  userLog.requests = userLog.requests.filter(timestamp => currentTime - timestamp < hourMs);

  const timeSinceLast = currentTime - userLog.lastRequest;
  if (timeSinceLast < cooldownMs) {
    const timeLeft = Math.ceil((cooldownMs - timeSinceLast) / 1000);
    
    return {
      isSpam: false,
      isBanned: false,
      message: `⏳ Подождите ${timeLeft} сек. между заявками`,
      timeLeft: timeLeft,
      requestsInHour: userLog.requests.length
    };
  }

  if (userLog.requests.length >= CONFIG.MAX_REQUESTS_PER_HOUR) {
    addToBlacklist(userId, username, CONFIG.SPAM_BAN_REASON);
    delete log[userId];
    saveSpamLog(log);
    
    return {
      isSpam: true,
      isBanned: true,
      message: `⛔ Вы превысили лимит заявок (${CONFIG.MAX_REQUESTS_PER_HOUR} в час). Доступ к системе заблокирован.`,
      timeLeft: 0,
      requestsInHour: userLog.requests.length
    };
  }

  userLog.requests.push(currentTime);
  userLog.lastRequest = currentTime;
  saveSpamLog(log);

  return {
    isSpam: false,
    isBanned: false,
    timeLeft: 0,
    requestsInHour: userLog.requests.length,
    maxRequests: CONFIG.MAX_REQUESTS_PER_HOUR
  };
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
  const cooldownMs = CONFIG.COOLDOWN_SECONDS * 1000;
  const hourMs = 60 * 60 * 1000;
  
  const userLog = log[userId];
  userLog.requests = userLog.requests.filter(timestamp => now - timestamp < hourMs);
  
  const timeSinceLast = now - userLog.lastRequest;
  const timeLeft = Math.max(0, Math.ceil((cooldownMs - timeSinceLast) / 1000));
  
  return {
    lastRequest: userLog.lastRequest,
    timeLeft: timeLeft,
    cooldownSeconds: CONFIG.COOLDOWN_SECONDS,
    requestsInHour: userLog.requests.length,
    maxRequestsPerHour: CONFIG.MAX_REQUESTS_PER_HOUR
  };
}
