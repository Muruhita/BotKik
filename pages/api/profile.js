import { verifyToken } from '../../lib/discord';
import { getProfile, setProfile } from '../../lib/profile';

export default function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const profile = getProfile(user.id) || { nickname: user.username };
    return res.status(200).json({ profile });
  }

  if (req.method === 'POST') {
    const { nickname } = req.body;
    if (!nickname || nickname.trim().length === 0) {
      return res.status(400).json({ error: 'Ник не может быть пустым' });
    }
    setProfile(user.id, { nickname: nickname.trim() });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}