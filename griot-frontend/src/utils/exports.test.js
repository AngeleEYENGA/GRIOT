import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, createCsv } from './exports.js';
import { remapLocalIds } from './offlineStore.js';

test('CSV preserves accents, quotes and newlines while neutralising spreadsheet formulas', () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell('  +cmd'), '"\'  +cmd"');
  assert.equal(csvCell('Angèle; famille'), '"Angèle; famille"');
  assert.ok(createCsv([['Prénom'], ['Angèle\nMyrlaine']]).startsWith('\uFEFF"Prénom"\r\n'));
});

test('offline synchronisation remaps dependent person ids without changing the stored draft', () => {
  const source = { personneId: 'local-a', nested: [{ personneId1: 'local-a', personneId2: 'p2' }] };
  assert.deepEqual(remapLocalIds(source, { 'local-a': 'server-a' }), { personneId: 'server-a', nested: [{ personneId1: 'server-a', personneId2: 'p2' }] });
  assert.equal(source.personneId, 'local-a');
});
