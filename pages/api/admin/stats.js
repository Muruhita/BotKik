import redis from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985', '797111731864207360'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  try {
    const total = await redis.get('stats:total') || 0;
    
    // Счётчики по типам форм
    const typesKeys = await redis.keys('stats:type:*');
    const types = {};
    for (const key of typesKeys) {
      const type = key.replace('stats:type:', '');
      types[type] = await redis.get(key) || 0;
    }

    const now = new Date();
    const dayKey = `stats:day:${now.toISOString().slice(0,10)}`;
    const monthKey = `stats:month:${now.toISOString().slice(0,7)}`;
    const weekKey = `stats:week:${getWeekKey(now)}`;
    
    const today = await redis.get(dayKey) || 0;
    const thisWeek = await redis.get(weekKey) || 0;
    const thisMonth = await redis.get(monthKey) || 0;

    const userKeys = await redis.keys('stats:user:*');
    const activeUsers = userKeys.length;

    res.status(200).json({ total, types, today, thisWeek, thisMonth, activeUsers });
  } catch (error) {
    console.error('Ошибка статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
}

function getWeekKey(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}
