import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoTrees } from '../data/demoTrees.js';
import { ambiguousJourneyIds, datedConnections } from './originsJourney.js';
import { historicalJourneys } from './migrationHistory.js';

for (const demo of demoTrees) test(`public fictional scenario: ${demo.slug}`, () => {
  assert.equal(demo.visibilite, 'public'); assert.equal(demo.demonstration, true);
  assert.ok(demo.people.every((person) => person.biographie.includes('fictif')));
  const ids = new Set(demo.people.map((person) => person.id));
  assert.ok(demo.relations.every((relation) => ids.has(relation.personneId1) && ids.has(relation.personneId2)));
  assert.deepEqual(datedConnections(demo.migrations).map((pair) => pair.map((step) => step.id)), demo.expectedRoutes);
  const journeys = historicalJourneys(demo.people, demo.migrations);
  const contexts = [...new Set(journeys.flatMap((journey) => journey.episodes.flatMap((episode) => episode.events.map((event) => event.id))))];
  assert.deepEqual(contexts, demo.expectedContexts);
  assert.ok(journeys.every((journey) => journey.episodes.every((episode) => episode.from.personneId === episode.to.personneId && episode.narrative.includes('motif restent à documenter'))));
});
test('same-day ambiguity blocks incoming and outgoing routes without inventing an order', () => {
  const demo = demoTrees.find((demo) => demo.slug === 'incertitudes');
  assert.deepEqual([...ambiguousJourneyIds(demo.migrations)], ['ie', 'if']);
  const alix = historicalJourneys(demo.people, demo.migrations).find((journey) => journey.person.id === 'i2');
  assert.equal(alix.ambiguous, 2); assert.equal(alix.episodes.length, 0);
});
test('a disaster before arrival is not automatically attached to the destination; return stays ordered', () => {
  const demo = demoTrees.find((demo) => demo.slug === 'retour-haiti');
  const journeys = historicalJourneys(demo.people, demo.migrations);
  assert.equal(journeys.find((journey) => journey.person.id === 'h2').episodes[0].events.length, 0);
  assert.deepEqual(journeys.find((journey) => journey.person.id === 'h1').episodes.map((episode) => [episode.from.id, episode.to.id]), [['ha', 'hb'], ['hb', 'hc']]);
});
