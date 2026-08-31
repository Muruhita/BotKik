import { verifyToken } from '../../lib/discord';
import { isBlacklisted, addToBlacklist } from '../../lib/blacklist';
import { containsBadWords, findBadWord, findAllBadWords } from '../../lib/badwords';
import { checkSpam } from '../../lib/antispam';

const DEPARTMENTS = {
  'ib': {
    name: 'IB (Intelligence Branch)',
    webhook: process.env.WEBHOOK_REPORT_IB,
    emoji: '🕵️',
    roleId: '1398200840900055071',
    roleId2: '1520504887497064639'
  },
  'cid': {
    name: 'CID (Criminal Investigation Department)',
    webhook: process.env.WEBHOOK_REPORT_CID,
    emoji: '🔍',
    roleId: '1398200760843374652',
    roleId2: '1520680049655676948'
  },
  'fa': {
    name: 'FA (Free Agent)',
    webhook: process.env.WEBHOOK_REPORT_FA,
    emoji: '🆓',
    roleId: '1398200891353468928',
    roleId2: '1520680052176715876'
  },
  'hrt': {
    name: 'HRT (Hostage Rescue Team)',
    webhook: process.env.WEBHOOK_REPORT_HRT,
    emoji: '🛡️',
    roleId: '1398201557635567636',
    roleId2: '1520680047038435358'
  },
  'atf': {
    name: 'ATF (Anti Terrorism Force)',
    webhook: process.env.WEBHOOK_REPORT_ATF,
    emoji: '💥',
    roleId: '1520680054731051159',
    roleId2: '1398201048598057041'
  },
  'af': {
    name: 'AF (Air Force)',
    webhook: process.env.WEBHOOK_REPORT_AF,
    emoji: '✈️',
    roleId: '1398200952602755103',
    roleId2: '1532529633088635041'
  },
  'ocu': {
    name: 'OCU (Organized Crime Unit)',
    webhook: process.env.WEBHOOK_REPORT_OCU,
    emoji: '⚖️',
    roleId: '1520680060808331294',
    roleId2: '1418771091291115631'
  },
  'dea': {
    name: 'DEA (Drug Enforcement Administration)',
    webhook: process.env.WEBHOOK_REPORT_DEA,
    emoji: '💊',
    roleId: '1398201115379761283',
    roleId2: '1274110499356934209'
  },
  'fna': {
    name: 'FNA (Federal National Academy)',
    webhook: process.env.WEBHOOK_REPORT_FNA,
    emoji: '📚',
    roleId: '1520680066445742232',
    roleId2: '1385530645186613311'
  },
  'nsb': {
    name: 'NSB (National Security Branch)',
    webhook: process.env.WEBHOOK_REPORT_NSB,
    emoji: '🏛️',
    roleId: '1520680069415174275',
    roleId2: '1398201167154122752'
  },
  'trainee': {
    name: 'Trainee (Стажёр)',
    webhook: process.env.WEBHOOK_REPORT_TRAINEE,
    emoji: '📖',
    roleId: '1385530645186613311',
    roleId2: '1520680066445742232'
  }
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
  resignation: process.env.WEBHOOK_RESIGNATION
};

async function sendToDiscord(webhookUrl, data, retries = 3) {
  const safeWebhook = webhookUrl.replace('discord.com', 'discordapp.com');
  let lastError = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(safeWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log(`📊 Код ответа Discord [попытка ${i + 1}]: ${response.status}`);
      
      if (response.ok) {
        return { success: true, status: response.status };
      }
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 5;
        console.warn(`⚠️ Discord вернул 429. Ждём ${retryAfter} секунд...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      const errorText = await response.text();
      return { success: false, status: response.status, error: errorText || `HTTP ${response.status}` };
    } catch (error) {
      lastError = error;
      console.error(`❌ Попытка ${i + 1}/${retries} не удалась:`, error.message);
      if (i < retries - 1) {
        const waitTime = 1000 * (i + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  return { success: false, error: lastError ? lastError.message : 'Неизвестная ошибка' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (isBlacklisted(user.id)) {
    return res.status(403).json({ 
      error: '⛔ Ваш доступ к системе заявок заблокирован. Обратитесь к администрации.' 
    });
  }

  const spamCheck = checkSpam(user.id, user.username);
  if (spamCheck.isSpam) {
    return res.status(429).json({ error: spamCheck.message });
  }

  const { type, department, targetDepartment, ...formData } = req.body;
  const userId = user.id;
  const username = user.username;

  const allText = Object.values(formData).filter(val => typeof val === 'string').join(' ');
  
  if (containsBadWords(allText)) {
    const foundWords = findAllBadWords(allText);
    const foundWord = findBadWord(allText);
    
    await sendBanWordAlert(user, username, foundWord || foundWords.join(', '), allText, type, req);
    addToBlacklist(user.id, username, `Банворд: ${foundWord || foundWords.join(', ')}`);
    
    return res.status(403).json({ 
      error: `⛔ Ваша заявка содержит запрещённое слово "${foundWord || foundWords.join(', ')}". Доступ к системе заблокирован.` 
    });
  }

  let webhookUrl;
  let roleMentions = '';

  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    if (!dept) return res.status(400).json({ error: 'Выберите корректный отдел для отчёта' });
    webhookUrl = dept.webhook;
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для отдела "${dept.name}" не настроен` });
    if (dept.roleId) roleMentions += `<@&${dept.roleId}> `;
    if (dept.roleId2) roleMentions += `<@&${dept.roleId2}>`;
  } else if (type === 'transfer') {
    const deptKey = targetDepartment;
    if (!deptKey || !TRANSFER_WEBHOOKS[deptKey]) return res.status(400).json({ error: 'Некорректный отдел для перевода' });
    webhookUrl = TRANSFER_WEBHOOKS[deptKey];
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для перевода в отдел "${targetDepartment}" не настроен` });
    const deptInfo = DEPARTMENTS[targetDepartment];
    if (deptInfo && deptInfo.roleId) roleMentions += `<@&${deptInfo.roleId}> `;
    if (deptInfo && deptInfo.roleId2) roleMentions += `<@&${deptInfo.roleId2}>`;
  } else if (type === 'highrank') {
    webhookUrl = webhooks.highrank;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для Хай Рангов не настроен' });
    roleMentions = '<@&1289343511354671125>';
  } else if (type === 'resignation') {
    webhookUrl = webhooks.resignation;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для увольнений не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else {
    webhookUrl = webhooks.promotion;
    if (!webhookUrl) return res.status(400).json({ error: 'Invalid form type' });
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

  const content = roleMentions.trim() || undefined;

  const result = await sendToDiscord(webhookUrl, {
    content,
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
  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    return `📋 Отчёт о повышении • ${dept ? dept.emoji + ' ' + dept.name : 'Отдел'}`;
  }
  if (type === 'transfer') {
    const deptNames = { 'cid': 'CID', 'fa': 'FA', 'hrt': 'HRT', 'atf': 'ATF', 'af': 'AF', 'ocu': 'OCU', 'dea': 'DEA', 'fna': 'FNA', 'nsb': 'NSB' };
    return `🔄 Запрос на перевод в ${deptNames[targetDepartment] || 'Отдел'}`;
  }
  if (type === 'highrank') return '📈 Отчёт на повышение (Хай Ранги)';
  if (type === 'resignation') return '📋 Заявление на увольнение';
  return { promotion: '📈 Запрос на повышение' }[type] || 'Новая заявка';
}

function getFormColor(type) {
  return { promotion: 0x4CAF50, transfer: 0x2196F3, report: 0xFF9800, highrank: 0xFF69B4, resignation: 0xDC3545 }[type] || 0x5865F2;
}

function buildFields(type, department, targetDepartment, data, userId, username) {
  const baseFields = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    const instructorText = data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет';
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: dept ? dept.emoji + ' ' + dept.name : 'Не указан', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || 'Не указан', inline: false },
      { name: '🎯 Целевой ранг', value: data.targetRank || 'Не указан', inline: false },
      ...(data.isInstructor ? [{ name: '👨‍🏫 Назначен на инструктора', value: instructorText, inline: false }] : []),
      { name: '🔗 Ссылки на работу', value: data.workLinks || 'Не указаны', inline: false },
      ...baseFields
    ];
  }

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

  if (type === 'transfer') {
    const fields = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Текущий отдел', value: data.currentDepartment || 'Не указано', inline: false },
      { name: '🎯 Желаемый отдел', value: targetDepartment || 'Не указано', inline: false },
      { name: '📝 Причина перевода', value: data.reason || 'Не указано', inline: false }
    ];

    if (data.targetDepartment === 'cid') {
      fields.push(
        { name: '📋 Чем занимается CID/DB?', value: data.cidWhatIs || 'Не указано', inline: false },
        { name: '📋 Опыт работы в CID/DB?', value: data.cidExperience || 'Не указано', inline: false },
        { name: '📋 Примеры работ', value: data.cidExamples || 'Не указано', inline: false },
        { name: '📋 Серверы с CID/DB', value: data.cidServers || 'Не указано', inline: false },
        { name: '📋 Знания по работе CID (1-10)', value: data.cidKnowledge || 'Не указано', inline: false },
        { name: '📋 Знания по законке (1-10)', value: data.cidLawKnowledge || 'Не указано', inline: false }
      );
    }

    if (data.targetDepartment === 'fa') {
      fields.push(
        { name: '📋 Знание правил ПОИП', value: data.faRules || 'Не указано', inline: false },
        { name: '📋 Был ли в FA раньше', value: data.faPrevious || 'Не указано', inline: false }
      );
    }

    fields.push(...baseFields);
    return fields;
  }

  return [...baseFields, ...Object.entries(data).map(([key, value]) => ({ name: key, value: String(value) || 'Не указано', inline: false }))];
}

async function sendBanWordAlert(user, username, badWords, fullText, type, req) {
  const webhookUrl = process.env.WEBHOOK_BANWORDS || process.env.WEBHOOK_LOGS;
  if (!webhookUrl) return;

  const ip = req.headers['x-real-ip'] || (req.headers['x-forwarded-for']?.split(',')[0].trim()) || 'неизвестен';

  const embed = {
    title: '🚨 ОБНАРУЖЕН БАНВОРД',
    color: 0xFF0000,
    author: { name: username, icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
    fields: [
      { name: '👤 Пользователь', value: `<@${user.id}>`, inline: true },
      { name: '🆔 Discord ID', value: user.id, inline: true },
      { name: '🌐 IP-адрес', value: ip, inline: true },
      { name: '📋 Тип заявки', value: type || 'неизвестен', inline: true },
      { name: '🚫 Запрещённое слово', value: `**${badWords}**`, inline: true },
      { name: '📝 Полный текст', value: `\`\`\`\n${fullText.slice(0, 1000)}\n\`\`\``, inline: false },
      { name: '📌 Действие', value: 'Пользователь автоматически добавлен в чёрный список', inline: false }
    ],
    footer: { text: 'Majestic FIB Forms • Система модерации' },
    timestamp: new Date().toISOString()
  };

  try {
    await sendToDiscord(webhookUrl, {
      content: '🚨 **Обнаружен банворд!**',
      embeds: [embed],
      username: 'FIB Модератор',
      avatar_url: 'https://i.imgur.com/AfFp7pu.png'
    });
  } catch (error) {
    console.error('Ошибка отправки уведомления о банворде:', error);
  }
}