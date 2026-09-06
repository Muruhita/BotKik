import redis from '../../lib/redis';
import { verifyToken } from '../../lib/discord';
import { containsBadWords } from '../../lib/badwords';
import { isBlacklisted } from '../../lib/antispam';

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const nickname = await redis.get(`nickname:${user.id}`);
    const department = await redis.get(`department:${user.id}`);
    const profileCustom = await redis.get(`profileCustom:${user.id}`);
    const banned = await isBlacklisted(user.id);
    return res.status(200).json({ user, nickname, department, profileCustom, banned });
  }

  if (req.method === 'POST') {
    const { nickname, department, profileCustom } = req.body;

    if (nickname !== undefined) {
      if (!nickname || containsBadWords(nickname)) {
        return res.status(400).json({ error: 'Никнейм содержит запрещенные слова!' });
      }
      await redis.set(`nickname:${user.id}`, nickname);
    }

    if (department !== undefined) {
      await redis.set(`department:${user.id}`, department);
    }

    if (profileCustom !== undefined) {
      // Валидация структуры
      if (typeof profileCustom === 'object' && profileCustom !== null) {
        const { type, presetId, url } = profileCustom;
        if (type === 'preset' && presetId) {
          await redis.set(`profileCustom:${user.id}`, JSON.stringify({ type: 'preset', presetId }));
        } else if (type === 'image' && url) {
          await redis.set(`profileCustom:${user.id}`, JSON.stringify({ type: 'image', url }));
        } else {
          return res.status(400).json({ error: 'Некорректные данные кастомизации' });
        }
      } else {
        return res.status(400).json({ error: 'Некорректные данные кастомизации' });
      }
    }

    return res.status(200).json({ message: 'Профиль обновлён!' });
  }
}
