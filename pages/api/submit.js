import { verifyToken } from '../../lib/discord';
import { isBlacklisted, addToBlacklist } from '../../lib/blacklist';
import { containsBadWords, findBadWord, findAllBadWords } from '../../lib/badwords';
import { checkSpam, isFormSubmissionActive } from '../../lib/antispam';

const DEPARTMENTS = {
  'ib': { name: 'IB', webhook: process.env.WEBHOOK_REPORT_IB, emoji: '🕵️' },
  'cid': { name: 'CID', webhook: process.env.WEBHOOK_REPORT_CID, emoji: '🔍' },
  'fa': { name: 'FA', webhook: process.env.WEBHOOK_REPORT_FA, emoji: '🆓' },
  'hrt': { name: 'HRT', webhook: process.env.WEBHOOK_REPORT_HRT, emoji: '🛡️' },
  'atf': { name: 'ATF', webhook: process.env.WEBHOOK_REPORT_ATF, emoji: '💥' },
  'af': { name: 'AF', webhook: process.env.WEBHOOK_REPORT_AF, emoji: '✈️' },
  'ocu': { name: 'OCU', webhook: process.env.WEBHOOK_REPORT_OCU, emoji: '⚖️' },
  'dea': { name: 'DEA', webhook: process.env.WEBHOOK_REPORT_DEA, emoji: '💊' },
  'fna': { name: 'FNA', webhook: process.env.WEBHOOK_REPORT_FNA, emoji: '📚' },
  'nsb': { name: 'NSB', webhook: process.env.WEBHOOK_REPORT_NSB, emoji: '🏛️' },
  'trainee': { name: 'Trainee', webhook: process.env.WEBHOOK_REPORT_TRAINEE, emoji: '📖' }
};

const TRANSFER_WEBHOOKS = {
  'cid': process.env.WEBHOOK_TRANSFER_CID,
  'fa': process.env.WEBHOOK_TRANSFER_FA,
  'hrt': process.env.WEBHOOK_TRANSFER_HRT,
  'atf': process.env.WEBHOOK_TRANSFER_ATF,
  'af': process.env.WEBHOOK_TRANSFER_AF,
  'ocu': process.env.WEBHOOK_TRANSFER_OCU,
  'dea': process.env.WEBHOOK_TRANSFER_DEA,
  'fna': process.env.WEBHOOK_TRANSFER_FNA,
  'nsb': process.env.WEBHOOK_TRANSFER_NSB
};

const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION,
  highrank: process.env.WEBHOOK_HIGH_RANK_REPORT,
  resignation: process.env.WEBHOOK_RESIGNATION,
  reinstatement: process.env.WEBHOOK_REINSTATEMENT,
  transferToFib: process.env.WEBHOOK_TRANSFER_TO_FIB,
  weaponRequest: process.env.WEBHOOK_WEAPON_REQUEST,
  leave: process.env.WEBHOOK_LEAVE,
  withdrawal: process.env.WEBHOOK_WITHDRAWAL
};

async function sendToDiscord(webhookUrl, data, retries = 3) {
  const safeWebhook = webhookUrl.replace('discord.com', 'discordapp.com');
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(safeWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) return { success: true, status: response.status };
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      const errorText = await response.text();
      return { success: false, status: response.status, error: errorText };
    } catch (error) {
      lastError = error;
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return { success: false, error: lastError ? lastError.message : 'Неизвестная ошибка' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const isActive = await isFormSubmissionActive();
  if (!isActive) return res.status(403).json({ error: '🚫 Подача заявок временно остановлена администрацией.' });

  const banned = await isBlacklisted(user.id);
  if (banned) return res.status(403).json({ error: '⛔ Ваш доступ к системе заявок заблокирован.' });

  const spamCheck = await checkSpam(user.id, user.username);
  if (spamCheck.isSpam) return res.status(429).json({ error: spamCheck.message });

  const { type, department, targetDepartment, ...formData } = req.body;
  const userId = user.id;
  const username = user.username;

  const allText = Object.values(formData).filter(val => typeof val === 'string').join(' ');
  
  if (containsBadWords(allText)) {
    const foundWords = findAllBadWords(allText);
    const foundWord = findBadWord(allText);
    
    await addToBlacklist(user.id, username, `Банворд: ${foundWord || foundWords.join(', ')}`);
    
    return res.status(403).json({ error: `⛔ Ваша заявка содержит запрещённое слово "${foundWord}". Доступ к системе заблокирован.` });
  }

  let webhookUrl;
  let roleMentions = '';

  if (type === 'withdrawal') {
    webhookUrl = webhooks.withdrawal;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для снятия ЧС не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'reinstatement') {
    webhookUrl = webhooks.reinstatement;
  } else if (type === 'transferToFib') {
    webhookUrl = webhooks.transferToFib;
  } else if (type === 'weaponRequest') {
    webhookUrl = webhooks.weaponRequest;
  } else if (type === 'leave') {
    webhookUrl = webhooks.leave;
  } else if (type === 'report') {
    const dept = DEPARTMENTS[department];
    if (!dept) return res.status(400).json({ error: 'Выберите корректный отдел' });
    webhookUrl = dept.webhook;
  } else if (type === 'transfer') {
    const deptKey = targetDepartment;
    if (!deptKey || !TRANSFER_WEBHOOKS[deptKey]) return res.status(400).json({ error: 'Некорректный отдел' });
    webhookUrl = TRANSFER_WEBHOOKS[deptKey];
  } else if (type === 'highrank') {
    webhookUrl = webhooks.highrank;
  } else if (type === 'resignation') {
    webhookUrl = webhooks.resignation;
  } else {
    webhookUrl = webhooks.promotion;
  }

  const embed = {
    title: getFormTitle(type, department, targetDepartment),
    color: getFormColor(type),
    author: { name: username, icon_url: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` },
    fields: buildFields(type, department, targetDepartment, formData, userId, username),
    timestamp: new Date().toISOString()
  };

  const result = await sendToDiscord(webhookUrl, { content: roleMentions.trim() || undefined, embeds: [embed], username: 'Majestic FIB Forms', avatar_url: 'https://i.imgur.com/AfFp7pu.png' });

  if (result.success) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: `Не удалось отправить заявку: ${result.error}` });
  }
}

function getFormTitle(type, department, targetDepartment) {
  if (type === 'withdrawal') return '🚫 Снятие ЧС';
  if (type === 'reinstatement') return '🔁 Восстановление';
  if (type === 'transferToFib') return '🏛️ Перевод в FIB';
  if (type === 'weaponRequest') return '🔫 Спец Вооружение';
  if (type === 'leave') return '🌴 Отпуск';
  if (type === 'report') return `📋 Отчёт о повышении • ${DEPARTMENTS[department]?.name || ''}`;
  if (type === 'transfer') return `🔄 Перевод в ${targetDepartment || ''}`;
  if (type === 'highrank') return '📈 Отчёт на повышение (Хай Ранги)';
  if (type === 'resignation') return '📋 Заявление на увольнение';
  return '📈 Запрос на повышение';
}

function getFormColor(type) {
  const colors = {
    'withdrawal': 0xFF69B4, 'reinstatement': 0x00FFFF, 'transferToFib': 0x00BFFF, 'weaponRequest': 0xFF0000,
    'leave': 0x00FF00, 'promotion': 0x4CAF50, 'transfer': 0x2196F3, 'report': 0xFF9800,
    'highrank': 0xFF69B4, 'resignation': 0xDC3545
  };
  return colors[type] || 0x5865F2;
}

function buildFields(type, department, targetDepartment, data, userId, username) {
  const baseFields = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'withdrawal') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🚨 Причина ЧС', value: data.reason || 'Не указана', inline: false },
      { name: '📅 Дата выдачи ЧС', value: data.date || 'Не указана', inline: false },
      ...baseFields
    ];
  }

  if (type === 'weaponRequest') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Ваш отдел', value: data.department || 'Не указан', inline: false },
      { name: '🔫 Предмет на выбор', value: data.item || 'Не указан', inline: false },
      ...baseFields
    ];
  }

  if (type === 'reinstatement') {
    return [
      { name: '👤 Имя Фамилия | Статик ID', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ранг на момент увольнения', value: data.rank || 'Не указан', inline: false },
      { name: '📸 Доказательства', value: data.proof || 'Не указано', inline: false },
      { name: '⚠️ Уволен после Ban/Warn?', value: data.wasBannedWarned || 'Не указано', inline: false },
      ...(data.wasBannedWarned === 'yes' ? [{ name: '🔗 Одобрение', value: data.approvalLink || 'Не указано', inline: false }] : []),
      ...baseFields
    ];
  }

  if (type === 'transferToFib') {
    return [
      { name: '👤 Имя Фамилия | Статик ID', value: data.fullName || 'Не указано', inline: false },
      { name: '✅ Одобрение', value: data.approval || 'Не указано', inline: false },
      { name: '📸 Доказательство ранга', value: data.rankProof || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'leave') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: data.department || 'Не указан', inline: false },
      { name: '📝 Причина', value: data.reason || 'Не указана', inline: false },
      { name: '📅 Начало', value: data.startDate || 'Не указано', inline: false },
      { name: '📅 Конец', value: data.endDate || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  return [...baseFields, ...Object.entries(data).map(([key, value]) => ({ name: key, value: String(value) || 'Не указано', inline: false }))];
}