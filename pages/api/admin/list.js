import { getAllBannedUsers, isFormSubmissionActive } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';
const ADMIN_IDS = ['1018113109346504744'];
export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });
  const bannedUsers = await getAllBannedUsers();
  const formsActive = await isFormSubmissionActive();
  res.status(200).json({ bannedUsers, formsActive });
}