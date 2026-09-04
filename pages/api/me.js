import { verifyToken } from '../../lib/discord';
export default function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.status(200).json({ user });
}