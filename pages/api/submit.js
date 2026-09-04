import { verifyToken } from '../../lib/discord';
import { isBlacklisted, addToBlacklist } from '../../lib/blacklist';
import { containsBadWords, findBadWord, findAllBadWords } from '../../lib/badwords';
import { checkSpam, isFormSubmissionActive } from '../../lib/antispam';

const DEPARTMENTS = {
  'ib': { name: 'IB (Intelligence Branch)', webhook: process.env.WEBHOOK_REPORT_IB, emoji: '🕵️', roleId: '1398200840900055071', roleId2: '1520504887497064639' },
  'cid': { name: 'CID (Criminal Investigation)', webhook: process.env.WEBHOOK_REPORT_CID, emoji: '🔍', roleId: '1398200760843374652', roleId2: '1520680049655676948' },
  'fa': { name: 'FA (Free Agent)', webhook: process.env.WEBHOOK_REPORT_FA, emoji: '🆓', roleId: '1398200891353468928', roleId2: '1520680052176715876' },
  'hrt': { name: 'HRT (Hostage Rescue)', webhook: process.env.WEBHOOK_REPORT_HRT, emoji: '🛡️', roleId: '1398201557635567636', roleId2: '1520680047038435358' },
  'atf': { name: 'ATF (Anti Terrorism)', webhook: process.env.WEBHOOK_REPORT_ATF, emoji: '💥', roleId: '1520680054731051159', roleId2: '1398201048598057041' },
  'af': { name: 'AF (Air Force)', webhook: process.env.WEBHOOK_REPORT_AF, emoji: '✈️', roleId: '1398200952602755103', roleId2: '1532529633088635041' },
  'ocu': { name: 'OCU (Organized Crime)', webhook: process.env.WEBHOOK_REPORT_OCU, emoji: '⚖️', roleId: '1520680060808331294', roleId2: '1418771091291115631' },
  'dea': { name: 'DEA (Drug Enforcement)', webhook: process.env.WEBHOOK_REPORT_DEA, emoji: '💊', roleId: '1398201115379761283', roleId2: '1274110499356934209' },
  'fna': { name: 'FNA (Academy)', webhook: process.env.WEBHOOK_REPORT_FNA, emoji: '📚', roleId: '1520680066445742232', roleId2: '1385530645186613311' },
  'nsb': { name: 'NSB (National Security)', webhook: process.env.WEBHOOK_REPORT_NSB, emoji: '🏛️', roleId: '1520680069415174275', roleId2: '1398201167154122752' },
  'trainee': { name: 'Trainee (Стажёр)', webhook: process.env.WEBHOOK_REPORT_TRAINEE, emoji: '📖', roleId: '1385530645186613311', roleId2: '1520680066445742232' }
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

  // ОПРЕДЕЛЯЕМ ВЕБХУК И РОЛИ
  if (type === 'withdrawal' || type === 'reinstatement' || type === 'transferToFib' || type === 'weaponRequest') {
    webhookUrl = webhooks[type];
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для ${type} не настроен` });
    // Исправлено: роли одной строкой через пробел!
    roleMentions = '<@&1274110499377778755> <@&1274110499377778756>';
  } else if (type === 'leave') {
    webhookUrl = webhooks.leave;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для отпуска не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'promotion') {
    webhookUrl = webhooks.promotion;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для повышения не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'highrank') {
    webhookUrl = webhooks.highrank;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для высоких рангов не настроен' });
    roleMentions = '<@&1289343511354671125>';
  } else if (type === 'resignation') {
    webhookUrl = webhooks.resignation;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для увольнений не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'report') {
    const dept = DEPARTMENTS[department];
    if (!dept) return res.status(400).json({ error: 'Выберите корректный отдел' });
    webhookUrl = dept.webhook;
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для "${dept.name}" не настроен` });
    if (dept.roleId) roleMentions += `<@&${dept.roleId}> `;
    if (dept.roleId2) roleMentions += `<@&${dept.roleId2}>`;
  } else if (type === 'transfer') {
    const deptKey = targetDepartment;
    if (!deptKey || !TRANSFER_WEBHOOKS[deptKey]) return res.status(400).json({ error: 'Некорректный отдел' });
    webhookUrl = TRANSFER_WEBHOOKS[deptKey];
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для перевода в "${deptKey}" не настроен` });
    const deptInfo = DEPARTMENTS[targetDepartment];
    if (deptInfo && deptInfo.roleId) roleMentions += `<@&${deptInfo.roleId}> `;
    if (deptInfo && deptInfo.roleId2) roleMentions += `<@&${deptInfo.roleId2}>`;
  } else {
    webhookUrl = webhooks.promotion;
    roleMentions = '<@&1274110499356934211>';
  }

  const embed = {
    title: getFormTitle(type, department, targetDepartment),
    color: getFormColor(type),
    author: {
      name: username,
      icon_url: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`
    },
    fields: buildFields(type, department, targetDepartment, formData, userId, username),
    footer: { text: 'Majestic FIB Forms • ' + new Date().toLocaleDateString('ru-RU') },
    timestamp: new Date().toISOString()
  };

  const result = await sendToDiscord(webhookUrl, {
    content: roleMentions.trim() || undefined,
    embeds: [embed],
    username: 'Majestic FIB Forms',
    avatar_url: 'https://i.imgur.com/AfFp7pu.png'
  });

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
  if (type === 'transfer') return `🔄 Перевод в ${DEPARTMENTS[targetDepartment]?.name || targetDepartment || ''}`;
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

  // ============ КРАСИВЫЕ ПОЛЯ ДЛЯ ВСЕХ ОТДЕЛОВ ============
  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    const instructorText = data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет';
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: dept ? `${dept.emoji} ${dept.name}` : 'Не указан', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || 'Не указан', inline: false },
      { name: '🎯 Целевой ранг', value: data.targetRank || 'Не указан', inline: false },
      { name: '👨‍🏫 Назначен на инструктора', value: instructorText, inline: false },
      { name: '🔗 Ссылки на работу', value: data.workLinks || 'Не указаны', inline: false },
      ...baseFields
    ];
  }

  // ============ КРАСИВЫЕ ПОЛЯ ДЛЯ ПЕРЕВОДОВ ============
  if (type === 'transfer') {
    const fields = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Текущий отдел', value: DEPARTMENTS[data.currentDepartment]?.name || data.currentDepartment || 'Не указано', inline: false },
      { name: '🎯 Желаемый отдел', value: DEPARTMENTS[targetDepartment]?.name || targetDepartment || 'Не указано', inline: false },
      { name: '📝 Причина перевода', value: data.reason || 'Не указано', inline: false }
    ];

    if (targetDepartment === 'cid') {
      fields.push(
        { name: '📋 Чем занимается CID/DB?', value: data.cidWhatIs || 'Не указано', inline: false },
        { name: '📋 Опыт работы в CID/DB?', value: data.cidExperience || 'Не указано', inline: false },
        { name: '📋 Примеры работ', value: data.cidExamples || 'Не указано', inline: false },
        { name: '📋 Серверы с CID/DB', value: data.cidServers || 'Не указано', inline: false },
        { name: '📋 Знания по работе CID (1-10)', value: data.cidKnowledge || 'Не указано', inline: false },
        { name: '📋 Знания по законке (1-10)', value: data.cidLawKnowledge || 'Не указано', inline: false }
      );
    }

    if (targetDepartment === 'fa') {
      fields.push(
        { name: '📋 Знание правил ПОИП', value: data.faRules || 'Не указано', inline: false },
        { name: '📋 Был ли в FA раньше', value: data.faPrevious || 'Не указано', inline: false }
      );
    }

    fields.push(...baseFields);
    return fields;
  }

  // ============ ОСТАЛЬНЫЕ НОВЫЕ ФОРМЫ ============
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

  // ============ СТАРЫЕ ФОРМЫ ============
  if (type === 'promotion') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📊 Диапазон рангов', value: data.rankRange || 'Не указано', inline: false },
      { name: '🔗 Ссылка на отчет', value: data.reportLink || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'highrank') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📊 Диапазон рангов', value: data.rankRange || 'Не указано', inline: false },
      { name: '🔗 Ссылка на работу', value: data.workLink || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'resignation') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📸 Скриншот планшета', value: data.screenshot || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  // Fallback (не должен срабатывать для вышеуказанных типов)
  return [...baseFields, ...Object.entries(data).map(([key, value]) => ({ name: key, value: String(value) || 'Не указано', inline: false }))];
}
