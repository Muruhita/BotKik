import { removeBlacklist, clearSpamLog } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';

// Список ID администраторов (добавь сюда второй ID)
const ADMIN_IDS = [
  '1018113109346504744', // Твой ID
  '555380718566506506',
  '260076815970729985' // ID второго админа (замени на реальный)
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверяем авторизацию и что это админ из списка
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
    // Удаляем из черного списка Redis
    await removeBlacklist(userId);
    // Сбрасываем счетчик заявок (чтобы мог снова подать 3 заявки)
    await clearSpamLog(userId);
    
    return res.status(200).json({ message: `✅ Пользователь ${userId} успешно разблокирован.` });
  } catch (error) {
    console.error('Ошибка разблокировки:', error);
    return res.status(500).json({ error: 'Ошибка при разблокировке' });
  }
}
