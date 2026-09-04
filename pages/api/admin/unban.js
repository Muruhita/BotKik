import { removeBlacklist, clearSpamLog } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user || !ADMIN_IDS.includes(user.id)) {
    return res.status(403).json({ error: 'Нет доступа. Вы не являетесь администратором.' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Не указан ID пользователя для разбана' });
  }

  try {
    await removeBlacklist(userId);
    await clearSpamLog(userId);
    
    return res.status(200).json({ message: `✅ Пользователь ${userId} успешно разблокирован.` });
  } catch (error) {
    console.error('Ошибка разблокировки:', error);
    return res.status(500).json({ error: 'Ошибка при разблокировке' });
  }
}
