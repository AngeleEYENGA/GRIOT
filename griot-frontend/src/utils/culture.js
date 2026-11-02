import languages from '../data/languages.json' with { type: 'json' };
import { findCountry, normalizePlace } from './geography.js';

export function treeCountries(migrations) {
  return [...new Map(migrations.map((step) => findCountry(step.lieu?.pays || '')).filter(Boolean).map((country) => [country.code, country])).values()];
}
export function suggestedLanguages(countryCodes, query = '') {
  const search = normalizePlace(query);
  return languages.filter((language) => (!countryCodes.length || language.countries.some((code) => countryCodes.includes(code))) && (!search || normalizePlace(`${language.name} ${language.iso}`).includes(search))).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
export function answerMatches(answer, expected) {
  // Diacritics and tones matter when learning; only case and whitespace are relaxed.
  return answer.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase() === expected.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}
export function quizChoices(card, cards) {
  return [...new Set([card.traduction, ...cards.filter((item) => item.id !== card.id).map((item) => item.traduction)])].slice(0, 4).sort((a, b) => a.localeCompare(b, 'fr'));
}
