import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datedConnections, hasJourneyDate, sortJourney, summarizeJourney, validCoordinates } from './originsJourney.js';

const step = (id, person, date, latitude = 3, name = id) => ({ id, personneId: person, dateEvenement: date, lieu: { nom: name, pays: 'Cameroun', latitude, longitude: latitude === null ? null : 11 }, ordre: 0 });
test('journey separates undated places from historical order and filters by individual', () => {
  const rows = [step('undated', 'p1', null), step('recent', 'p1', '2020-01-01'), step('older', 'p2', '1980-01-01'), step('invalid', 'p1', 'not-a-date')];
  assert.deepEqual(sortJourney(rows).slice(0, 2).map((item) => item.id), ['older', 'recent']);
  const summary = summarizeJourney(rows, [], 'p1');
  assert.equal(summary.visible.length, 3);
  assert.equal(summary.undated.length, 2);
  assert.equal(summary.first.id, 'recent');
  assert.equal(hasJourneyDate(rows[3]), false);
});
test('routes never connect different people, equal dates, undated places or bridge an unlocated dated step', () => {
  const rows = [step('a', 'p1', '1980-01-01'), step('b', 'p2', '1990-01-01'), step('missing', 'p1', '2000-01-01', null), step('c', 'p1', '2020-01-01'), step('unknown', 'p1', null)];
  assert.deepEqual(datedConnections(rows), []);
  assert.deepEqual(datedConnections([step('a', 'p1', '1980-01-01'), step('b', 'p1', '2000-01-01')]).map((pair) => pair.map((item) => item.id)), [['a', 'b']]);
  assert.deepEqual(datedConnections([step('a', 'p1', '2000-01-01'), step('b', 'p1', '2000-01-01')]), []);
});
test('declared origins remain distinct from first dated places and prefer a located matching entry', () => {
  const people = [{ id: 'p1', villageOrigine: 'Yaoundé' }, { id: 'p2', villageOrigine: 'Douala' }];
  const summary = summarizeJourney([step('first', 'p1', '1990-01-01', 2, 'Paris'), step('unknown', 'p1', null, null, 'Yaounde'), step('located', 'p1', null, 3, 'YAOUNDÉ')], people);
  assert.equal(summary.first.lieu.nom, 'Paris');
  assert.equal(summary.declaredOrigins[0].linked.id, 'located');
  assert.equal(summary.unplacedOrigins.length, 1);
  assert.equal(summary.unplacedOrigins[0].person.id, 'p2');
  assert.equal(validCoordinates(step('bad', 'p1', null, 999)), false);
  assert.equal(validCoordinates(step('missing', 'p1', null, null)), false);
});
