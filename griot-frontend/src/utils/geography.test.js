import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findCountry, nearestCity, normalizePlace, searchCities } from './geography.js';

const cities = [
  { id: 1, name: 'Yaoundé', search: 'yaounde', countryCode: 'CM', latitude: 3.848, longitude: 11.5021, population: 1000 },
  { id: 2, name: 'Paris', search: 'paris', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, population: 2000 },
  { id: 3, name: 'Paris', search: 'paris', countryCode: 'US', latitude: 33.6609, longitude: -95.5555, population: 500 },
];

test('country lookup accepts French names, English names and ISO codes', () => {
  assert.equal(findCountry(' CAMEROUN ').code, 'CM');
  assert.equal(findCountry('Cameroon').code, 'CM');
  assert.equal(findCountry('fr').code, 'FR');
  assert.equal(normalizePlace(' Yaoundé '), 'yaounde');
});

test('city search filters homonyms by country and keeps unknown countries manual', () => {
  assert.equal(searchCities(cities, 'Yaou', 'Cameroun')[0].id, 1);
  assert.deepEqual(searchCities(cities, 'Paris', 'France').map((city) => city.id), [2]);
  assert.equal(searchCities(cities, 'Paris', '').length, 2);
  assert.deepEqual(searchCities(cities, 'Paris', 'Pays inconnu'), []);
  assert.deepEqual(searchCities(cities, 'Y', 'Cameroun'), []);
});

test('nearest-city lookup finds a nearby city, rejects invalid coordinates and handles empty data', () => {
  const nearest = nearestCity(cities, 3.85, 11.5);
  assert.equal(nearest.city.id, 1);
  assert.ok(nearest.distance < 1);
  assert.equal(nearestCity(cities, 100, 0), null);
  assert.equal(nearestCity([], 0, 0), null);
  assert.ok(nearestCity(cities, -80, 0).distance > 75);
});

test('bundled catalogue matches metadata and contains valid coordinates and unique identifiers', () => {
  const rows = JSON.parse(readFileSync(new URL('../../public/data/cities.json', import.meta.url), 'utf8'));
  const metadata = JSON.parse(readFileSync(new URL('../../public/data/geonames-source.json', import.meta.url), 'utf8'));
  assert.equal(rows.length, metadata.cities);
  assert.equal(new Set(rows.map((row) => row[0])).size, rows.length);
  assert.ok(rows.every((row) => row.length === 8 && row[1] && /^[A-Z]{2}$/.test(row[2]) && Number.isFinite(row[3]) && Math.abs(row[3]) <= 90 && Number.isFinite(row[4]) && Math.abs(row[4]) <= 180));
});
