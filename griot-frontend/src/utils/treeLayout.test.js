import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTreeLayout, NODE_WIDTH } from './treeLayout.js';

const people = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, prenom: id, nom: 'Famille' }));
const relation = (a, b, type) => ({ personneId1: a, personneId2: b, typeRelation: type });

test('couples stay adjacent and share one branch for children, including inverse duplicate records', () => {
  const relations = [relation('a', 'b', 'conjoint'), relation('b', 'a', 'conjoint'), ...['c', 'd'].flatMap((id) => [relation('a', id, 'pere'), relation('b', id, 'mere'), relation(id, 'a', 'fille')])];
  const layout = buildTreeLayout(people, relations);
  assert.equal(Math.abs(layout.positions.get('a').x - layout.positions.get('b').x), NODE_WIDTH + 28);
  assert.equal(layout.positions.get('a').y, layout.positions.get('b').y);
  assert.ok(layout.positions.get('c').y > layout.positions.get('a').y);
  assert.equal(layout.paths.filter((path) => path.kind === 'spouse').length, 1);
  assert.equal(layout.paths.filter((path) => path.kind === 'family').length, 1);
});

test('a partner with known ancestors sets the generation of the couple; blended families keep distinct branches', () => {
  const layout = buildTreeLayout(people, [relation('a', 'c', 'pere'), relation('c', 'd', 'conjoint'), relation('d', 'e', 'conjoint'), relation('c', 'f', 'pere'), relation('d', 'f', 'mere')]);
  assert.equal(layout.positions.get('c').y, layout.positions.get('d').y);
  assert.equal(layout.positions.get('d').y, layout.positions.get('e').y);
  assert.ok(layout.positions.get('f').y > layout.positions.get('d').y);
  assert.equal(layout.paths.filter((path) => path.kind === 'spouse').length, 2);
  const unique = new Set([...layout.positions.values()].map((p) => `${p.x}:${p.y}`));
  assert.equal(unique.size, people.length);
});

test('empty, filtered and cyclic trees remain finite and do not mutate source records', () => {
  assert.equal(buildTreeLayout([], []).positions.size, 0);
  const relations = [relation('a', 'b', 'pere'), relation('b', 'a', 'pere'), relation('a', 'z', 'conjoint')];
  const original = JSON.stringify(relations);
  const layout = buildTreeLayout(people.slice(0, 2), relations);
  assert.ok([...layout.positions.values()].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  assert.equal(JSON.stringify(relations), original);
});
