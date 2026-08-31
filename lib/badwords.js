const BAD_WORDS = [
  'хуй', 'пизда', 'блядь', 'мудак', 'сука', 'пидор', 'гандон',
  'еблан', 'лох', 'долбоеб', 'пидр', 'хуесос', 'сучка', 'шлюха',
  'курва', 'нахуй', 'ебать', 'ебал', 'пиздец', 'бля', 'залупа',
  'гнида', 'тварь', 'выблядок', 'ублюдок',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'pussy', 'whore', 'slut', 'motherfucker', 'douchebag',
  'asshat', 'bullshit',
  'hui', 'pizda', 'blyad', 'blyat', 'pidor', 'pidr', 'huilo',
  'huy', 'nahuy', 'naxuy', 'ebat', 'ebal', 'pizdec', 'blya',
  'zhopa', 'govno', 'mudak', 'suka', 'sucka', 'loshar', 'dolboeb',
  'gandon', 'kiska', 'pica', 'pisa', 'sraka',
  'e6aть', 'e6al', 'naxui', 'nahui', 'xui', 'xuy', '6lyad', '6lya',
  'х\\.у\\.й', 'п\\.з\\.д\\а', 'б\\.л\\я', 'с\\.у\\.к\\а'
];

export function containsBadWords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

export function findBadWord(text) {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  for (const word of BAD_WORDS) {
    if (lowerText.includes(word)) return word;
  }
  return null;
}

export function findAllBadWords(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = [];
  for (const word of BAD_WORDS) {
    if (lowerText.includes(word)) found.push(word);
  }
  return found;
}

export default BAD_WORDS;