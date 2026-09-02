import { verifyToken } from '../../lib/discord';
import { removeFromBlacklist, isAdmin } from '../../lib/blacklist';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!isAdmin(user.id)) {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Не указан userId' });
  }

  const result = removeFromBlacklist(userId, user.id);
  
  if (result.success) {
    return res.status(200).json({ success: true, message: 'Пользователь разблокирован' });
  } else {
    return res.status(403).json({ error: result.error });
  }
}
