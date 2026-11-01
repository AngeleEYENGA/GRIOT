import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getProfileCoverage, getUpcomingBirthdays } from './dashboardInsights.js';

test('birthdays include today, roll past dates into next year and omit deceased or invalid profiles', () => {
  const results = getUpcomingBirthdays([
    { id: 'past', dateNaissance: '1980-10-31T00:00:00Z' },
    { id: 'today', dateNaissance: '1990-11-01T00:00:00Z' },
    { id: 'next', dateNaissance: '2000-11-10T00:00:00Z' },
    { id: 'deceased', dateNaissance: '1920-11-02', dateDeces: '2020-01-01' },
    { id: 'invalid', dateNaissance: 'invalid' },
    { id: 'future', dateNaissance: '2040-11-02' },
  ], new Date(2026, 10, 1, 12));
  assert.deepEqual(results.map((r) => r.person.id), ['today', 'next', 'past']);
  assert.equal(results[0].today, true);
  assert.equal(results[0].age, 36);
  assert.equal(results[2].date.getFullYear(), 2027);
});

test('coverage handles an empty tree and excludes blank biography or origin values', () => {
  assert.ok(getProfileCoverage([]).every((item) => item.percent === 0));
  const result = getProfileCoverage([
    { biographie: ' Une histoire ', villageOrigine: 'Yaoundé', dateNaissance: '1990-01-01' },
    { biographie: '  ', villageOrigine: '', dateNaissance: null },
  ]);
  assert.ok(result.every((item) => item.count === 1 && item.total === 2 && item.percent === 50));
});
