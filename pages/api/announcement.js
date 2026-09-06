import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985', '797111731864207360'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const announcement = await redis.get('announcement');
    return res.status(200).json({ announcement });
  }

  if (req.method === 'POST') {
    const token = req.cookies.token;
    const user = verifyToken(token);
    if (!user || !ADMIN_IDS.includes(user.id)) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      await redis.del('announcement');
      return res.status(200).json({ message: 'Объявление удалено' });
    }

    await redis.set('announcement', text.trim());
    return res.status(200).json({ message: 'Объявление сохранено' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}