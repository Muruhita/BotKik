import redis from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Сохраняем результат игрока
    const { userId, username, score } = req.body;
    if (!userId || !username || !score) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    // Ключ: leaderboard:score (храним JSON с именем и очками)
    const data = JSON.stringify({ username, score, timestamp: Date.now() });
    await redis.zadd('leaderboard', score, `${userId}:${data}`);

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    // Получаем топ-10
    const top = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    const leaderboard = [];
    for (let i = 0; i < top.length; i += 2) {
      const [member, score] = [top[i], top[i + 1]];
      const parsed = JSON.parse(member.split(':').slice(1).join(':'));
      leaderboard.push({ username: parsed.username, score: parseInt(score) });
    }
    return res.status(200).json({ leaderboard });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
