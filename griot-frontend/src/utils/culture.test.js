import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerMatches, suggestedLanguages, treeCountries } from './culture.js';
import { historicalJourneys } from './migrationHistory.js';

test('country suggestions respect recorded countries, preserve multilingual options and do not guess from a surname', () => {
  assert.deepEqual(treeCountries([{ lieu: { pays: 'Cameroun' } }, { lieu: { pays: 'CM' } }, { lieu: { pays: 'imaginaire' } }]).map((country) => country.code), ['CM']);
  const options = suggestedLanguages(['CM']);
  assert.ok(options.length > 100);
  assert.ok(options.some((language) => language.iso === 'ewo'));
  assert.ok(options.every((language) => language.countries.includes('CM')));
  assert.ok(suggestedLanguages(['ET'], 'amh').some((language) => language.iso === 'amh'));
});
test('language games preserve diacritics and tones', () => {
  assert.equal(answerMatches(' École ', 'école'), true);
  assert.equal(answerMatches('ecole', 'école'), false);
  assert.equal(answerMatches('a', 'á'), false);
});
const person = { id: 'p1', prenom: 'Camille', nom: 'Exemple' };
const step = (id, country, date, personneId = 'p1') => ({ id, personneId, dateEvenement: date, lieu: { nom: country, pays: country } });
test('historical context matches country and exact time interval, without inventing a cause or connecting people', () => {
  const rows = [step('a', 'Éthiopie', '1980-01-01'), step('b', 'Cameroun', '1987-01-01'), step('x', 'Haïti', '2011-01-01', 'other')];
  const episodes = historicalJourneys([person], rows)[0].episodes;
  assert.equal(episodes.length, 1);
  assert.deepEqual(episodes[0].events.map((event) => event.id), ['ethiopie-1984']);
  assert.match(episodes[0].narrative, /motif restent à documenter/);
  assert.equal(historicalJourneys([person], [step('a', 'Éthiopie', '1970-01-01'), step('b', 'Cameroun', '1980-01-01')])[0].episodes[0].events.length, 0);
});
test('unknown dates, identical places and simultaneous presences cannot establish migration episodes', () => {
  assert.equal(historicalJourneys([person], [step('a', 'Éthiopie', null), step('b', 'Cameroun', '1987-01-01')])[0].episodes.length, 0);
  assert.equal(historicalJourneys([person], [step('a', 'Éthiopie', '1984-01-01'), step('b', 'Éthiopie', '1987-01-01')])[0].episodes.length, 0);
  assert.equal(historicalJourneys([person], [step('a', 'Éthiopie', '1984-01-01'), step('b', 'Cameroun', '1984-01-01')])[0].episodes.length, 0);
});
