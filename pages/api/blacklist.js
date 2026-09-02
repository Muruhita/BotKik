import fs from 'fs';
import path from 'path';

const BLACKLIST_FILE = path.join(process.cwd(), 'data', 'blacklist.json');
const ADMIN_IDS = ['1018113109346504744']; // Ваш Discord ID

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadBlacklist() {
  try {
    if (fs.existsSync(BLACKLIST_FILE)) {
      return JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка загрузки чёрного списка:', error);
  }
  return [];
}

function saveBlacklist(list) {
  try {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения чёрного списка:', error);
  }
}

export function isBlacklisted(userId) {
  const list = loadBlacklist();
  return list.some(entry => entry.userId === userId);
}

export function addToBlacklist(userId, username, reason = 'Банворд') {
  const list = loadBlacklist();
  if (list.some(entry => entry.userId === userId)) return false;
  list.push({
    userId,
    username,
    reason,
    timestamp: new Date().toISOString()
  });
  saveBlacklist(list);
  return true;
}

export function removeFromBlacklist(userId, requesterId) {
  if (!ADMIN_IDS.includes(requesterId)) {
    return { success: false, error: 'Недостаточно прав для снятия блокировки' };
  }
  
  const list = loadBlacklist();
  const filtered = list.filter(entry => entry.userId !== userId);
  saveBlacklist(filtered);
  return { success: true };
}

export function getBlacklist() {
  return loadBlacklist();
}

export function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

export default loadBlacklist();
