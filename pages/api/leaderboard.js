import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, username, score } = req.body;
    if (!userId || !username || !score) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    // Проверяем текущий рекорд пользователя
    const currentScore = await redis.zscore('leaderboard', userId);

    // Если текущего рекорда нет, или новый рекорд выше, обновляем
    if (!currentScore || score > parseInt(currentScore)) {
      // Сохраняем результат как лучший, используя ID пользователя как ключ
      await redis.zadd('leaderboard', score, userId);
      // Запоминаем актуальное имя пользователя в отдельном хранилище
      await redis.hset('leaderboard:users', userId, username);
      return res.status(200).json({ success: true, updated: true });
    }

    // Если новый рекорд ниже, не обновляем (оставляем лучший)
    return res.status(200).json({ success: true, updated: false });
  }

  if (req.method === 'GET') {
    // Получаем топ-10 по очкам
    const top = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    const leaderboard = [];

    for (let i = 0; i < top.length; i += 2) {
      const userId = top[i];
      const score = parseInt(top[i + 1]);
      // Забираем актуальное имя пользователя из хранилища
      const username = await redis.hget('leaderboard:users', userId);

      if (username) {
        leaderboard.push({ username, score });
      }
    }

    return res.status(200).json({ leaderboard });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
