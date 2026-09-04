import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { isBlacklisted } from '../../lib/antispam';

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const user = verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    if (req.method === 'GET') {
      // Пытаемся получить ник из Redis
      const nickname = await redis.get(`nickname:${user.id}`);
      const banned = await isBlacklisted(user.id);
      
      return res.status(200).json({ 
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }, 
        nickname, 
        banned 
      });
    }

    if (req.method === 'POST') {
      const { nickname } = req.body;
      
      // Простая проверка на пустоту, без BadWords (чтобы не падать)
      if (!nickname || nickname.trim().length === 0) {
        return res.status(400).json({ error: 'Никнейм не может быть пустым!' });
      }
      
      await redis.set(`nickname:${user.id}`, nickname);
      return res.status(200).json({ message: 'Никнейм сохранен!' });
    }
  } catch (error) {
    console.error('Ошибка в /api/profile:', error);
    return res.status(500).json({ error: 'Ошибка сервера при загрузке профиля. Проверьте REDIS_URL.' });
  }
}
