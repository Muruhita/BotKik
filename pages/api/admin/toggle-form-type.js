import { verifyToken } from '../../../lib/discord';
import { toggleFormTypeStatus } from '../../../lib/antispam';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const { type, status } = req.body;
  if (!type || typeof status !== 'boolean') return res.status(400).json({ error: 'Неверные данные' });

  const newStatus = await toggleFormTypeStatus(type, status);
  return res.status(200).json({ type, status: newStatus });
}
