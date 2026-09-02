import { removeBlacklist, clearSpamLog } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем авторизацию и права администратора (твой ID)
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user || user.id !== '1018113109346504744') {
    return res.status(403).json({ error: 'Нет доступа' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Не указан ID пользователя' });
  }

  try {
    // Удаляем из черного списка Redis
    await removeBlacklist(userId);
    // Сбрасываем счетчик заявок
    await clearSpamLog(userId);
    return res.status(200).json({ message: `✅ Пользователь ${userId} успешно разблокирован.` });
  } catch (error) {
    console.error('Ошибка разблокировки:', error);
    return res.status(500).json({ error: 'Ошибка разблокировки' });
  }
}
