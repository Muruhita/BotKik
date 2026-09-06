import { getAllBannedUsers, isFormSubmissionActive, getAllFormStatuses } from '../../../lib/antispam';
import { verifyToken } from '../../../lib/discord';

const ADMIN_IDS = ['1018113109346504744', '555380718566506506', '260076815970729985'];

export default async function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const bannedUsers = await getAllBannedUsers();
  const formsActive = await isFormSubmissionActive();
  const formStatuses = await getAllFormStatuses();

  res.status(200).json({ bannedUsers, formsActive, formStatuses });
}
