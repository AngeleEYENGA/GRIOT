// Integration recipe. Creates isolated private fixtures and removes only those IDs.
// Never run against a hosted database or API.
require('dotenv').config({ quiet: true });
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');
const { KnowledgeService } = require('../dist/knowledge/knowledge.service');
const base = process.argv[2] || 'http://localhost:3001/api';
for (const url of [base, process.env.DATABASE_URL]) if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)) throw Error('Local fixtures only');
process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
const prisma = new PrismaClient(); const users = []; const trees = []; const sources = [];
const nonce = randomUUID();
async function call(token, path, body, method = body ? 'POST' : 'GET', expected) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  assert.equal(response.status, expected ?? (method === 'POST' ? 201 : 200), `${method} ${path}`);
  return data;
}
(async () => {
  for (let i = 0; i < 3; i++) {
    const auth = await call(null, '/auth/register', { nom: 'Recette documentaire', prenom: `Acteur ${i}`, email: `kc-${nonce}-${i}@example.test`, motDePasse: `Test-${randomUUID()}-Aa7` });
    users.push({ id: auth.utilisateur.id, token: auth.accessToken });
  }
  for (const actor of users.slice(0, 2)) trees.push(await call(actor.token, '/arbres', { nom: `Recette Knowledge Core ${nonce}`, visibilite: 'prive' }));
  const [owner, outsider, reader] = users; const [a, b] = trees;
  await prisma.membreArbre.create({ data: { utilisateurId: reader.id, arbreId: a.id, role: 'lecteur', statut: 'actif' } });
  await call(null, '/knowledge/sources', null, 'GET', 401);
  await call(owner.token, '/knowledge/sources', { nom: 'Aucune habilitation éditoriale' }, 'POST', 403);
  const body = { nom: 'Document fictif de recette', doi: '10.9999/GRIOT-LOCAL-TEST', arbreId: a.id, auteurs: ['Acteur fictif'], licence: 'Recette technique uniquement' };
  const created = await call(owner.token, '/knowledge/sources', body); sources.push(created.id);
  let detail = await call(owner.token, `/knowledge/sources/${created.id}`);
  assert.equal(detail.versions.length, 1); assert.equal(detail.consultations.length, 0); assert.equal(detail.statutDocumentaire, 'a_examiner'); assert.equal(detail.publie, false);
  await call(owner.token, '/knowledge/sources', { ...body, doi: 'https://doi.org/10.9999/griot-local-test' }, 'POST', 409);
  await call(owner.token, '/knowledge/sources', { ...body, publie: true }, 'POST', 400);
  await call(owner.token, '/knowledge/sources', { ...body, url: 'javascript:alert(1)', doi: '' }, 'POST', 400);
  const same = await call(outsider.token, '/knowledge/sources', { ...body, arbreId: b.id }); sources.push(same.id);
  await call(outsider.token, `/knowledge/sources/${created.id}`, null, 'GET', 404);
  await call(outsider.token, `/knowledge/sources?arbreId=${a.id}`, null, 'GET', 404);
  await call(reader.token, '/knowledge/sources', { ...body, doi: '' }, 'POST', 403);
  assert.equal((await call(reader.token, `/knowledge/sources/${created.id}`)).canEdit, false);
  const update = { nom: 'Titre corrigé de recette', doi: body.doi, revision: 1, motif: 'Vérifier le versionnement' };
  await call(reader.token, `/knowledge/sources/${created.id}`, update, 'PATCH', 403);
  await call(owner.token, `/knowledge/sources/${created.id}`, update, 'PATCH');
  await call(owner.token, `/knowledge/sources/${created.id}`, update, 'PATCH', 409);
  detail = await call(owner.token, `/knowledge/sources/${created.id}`);
  assert.equal(detail.revision, 2); assert.equal(detail.versions.length, 2); assert.equal(detail.versions[1].metadonnees.nom, body.nom);
  const check = await call(owner.token, `/knowledge/sources/${created.id}/consultations`, { revision: 2, operation: 'controle_acces', accessibilite: 'accessible' });
  assert.equal(check.contenuConsulte, false); assert.equal(check.provenance, 'declaration_manuelle');
  await call(owner.token, `/knowledge/sources/${created.id}/consultations`, { revision: 2, operation: 'lecture_manuelle', accessibilite: 'indisponible' }, 'POST', 400);
  const read = await call(owner.token, `/knowledge/sources/${created.id}/consultations`, { revision: 2, operation: 'lecture_manuelle', accessibilite: 'accessible', note: 'Déclaration fictive pour recette, pas de document distant consulté.' });
  assert.equal(read.contenuConsulte, true); assert.equal(read.versionId, detail.versions[0].id);
  const otherVersion = await prisma.versionSource.findFirst({ where: { sourceId: same.id } });
  await assert.rejects(prisma.consultationSource.create({ data: { sourceId: created.id, versionId: otherVersion.id, acteurId: owner.id, operation: 'controle_acces', accessibilite: 'accessible' } }), (e) => e.code === 'P2003');
  const legacy = await prisma.source.create({ data: { type: 'autre', nom: `Legacy restreint de recette ${nonce}` } }); sources.push(legacy.id);
  await call(owner.token, `/knowledge/sources/${legacy.id}`, null, 'GET', 404);
  const broken = { $transaction: (action) => prisma.$transaction((tx) => action(new Proxy(tx, { get(target, key) { return key === 'journalDocumentaire' ? { create: async () => { throw Error('Intentional audit failure'); } } : Reflect.get(target, key); } }))) };
  await assert.rejects(new KnowledgeService(broken).create(owner.id, { nom: `Rollback ${nonce}`, arbreId: a.id }), /Intentional audit failure/);
  assert.equal(await prisma.source.count({ where: { nom: `Rollback ${nonce}` } }), 0);
  await call(owner.token, `/knowledge/sources/${created.id}/archive`, { revision: 2, motif: 'Fin de recette' });
  assert.equal((await call(owner.token, `/knowledge/sources?arbreId=${a.id}`)).items.length, 0);
  assert.equal((await call(owner.token, `/knowledge/sources?arbreId=${a.id}&statut=archive`)).items.length, 1);
  detail = await call(owner.token, `/knowledge/sources/${created.id}`); assert.equal(detail.versions.length, 3); assert.equal(detail.consultations.length, 2);
  await prisma.membreArbre.updateMany({ where: { arbreId: a.id, utilisateurId: reader.id }, data: { statut: 'en_attente' } });
  await call(reader.token, `/knowledge/sources/${created.id}`, null, 'GET', 404);
  console.log('PASS local real API/DB: authentication, scope isolation, readers/revocation, global permissions, scoped deduplication, DTO flags, versions/concurrency, manual consultation, archive, cross-source FK and atomic rollback.');
})().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  // IDs originate only from the fixtures above. Existing user data is never selected.
  try {
    await prisma.consultationSource.deleteMany({ where: { sourceId: { in: sources } } });
    await prisma.journalDocumentaire.deleteMany({ where: { sourceId: { in: sources } } });
    await prisma.versionSource.deleteMany({ where: { sourceId: { in: sources } } });
    await prisma.source.deleteMany({ where: { id: { in: sources } } });
    await prisma.membreArbre.deleteMany({ where: { arbreId: { in: trees.map((t) => t.id) }, utilisateurId: { in: users.map((u) => u.id) } } });
    await prisma.arbre.deleteMany({ where: { id: { in: trees.map((t) => t.id) }, proprietaireId: { in: users.map((u) => u.id) } } });
    await prisma.utilisateur.deleteMany({ where: { id: { in: users.map((u) => u.id) }, email: { contains: nonce } } });
    console.log('Isolated local fixtures removed.');
  } finally { await prisma.$disconnect(); }
});
