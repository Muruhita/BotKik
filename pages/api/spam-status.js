import { verifyToken } from '../../lib/discord';
import { getSpamStatus } from '../../lib/antispam';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const status = await getSpamStatus(user.id);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения статуса' });
  }
}
