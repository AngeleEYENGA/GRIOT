// Run explicitly against a chosen GRIOT API. Credentials stay outside the repository.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoTrees } from './fixtures/publicTrees.js';

const [base, credentialsFile] = process.argv.slice(2);
if (!base || !credentialsFile) throw new Error('Usage: node scripts/create-public-introduction.mjs <API URL> <credentials JSON outside repository>');
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!relative(repository, resolve(credentialsFile)).startsWith(`..${sep}`)) throw new Error('Les identifiants doivent être conservés hors du dépôt.');
let credentials;
try { credentials = JSON.parse(await readFile(credentialsFile, 'utf8')); }
catch (e) {
  if (e.code !== 'ENOENT') throw e;
  credentials = { email: `decouverte.${randomBytes(5).toString('hex')}@example.test`, motDePasse: `Griot-${randomBytes(12).toString('hex')}-Aa7`, api: base };
  await writeFile(credentialsFile, JSON.stringify(credentials), { flag: 'wx', mode: 0o600 });
}
if (credentials.api !== base) throw new Error('Le fichier de compte appartient à une autre API.');
let token;
async function request(path, body, method = body ? 'POST' : 'GET') {
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) { const error = new Error(`${method} ${path}: HTTP ${response.status}`); error.status = response.status; throw error; }
  return response.json();
}
let auth;
try { auth = await request('/auth/login', { email: credentials.email, motDePasse: credentials.motDePasse }); }
catch (e) { if (e.status !== 401) throw e; auth = await request('/auth/register', { ...credentials, api: undefined, nom: 'GRIOT', prenom: 'Découverte' }); }
token = auth.accessToken;
const owned = await request('/arbres'); const report = [];
const introductions = {
  'ethiopie-cameroun': 'D’Addis-Abeba à Yaoundé, trois générations relient leurs souvenirs et leurs lieux de vie. Découvrez comment une famille conserve les traces de son parcours.',
  diaspora: 'Léa, Élie, Charlie et Lou grandissent au Gabon, puis leurs chemins les conduisent à Londres, Berlin, Madrid et Shanghai. Des langues et des horizons différents, une histoire à partager.',
  incertitudes: 'Un village à retrouver, deux villes nommées Paris et des dates encore incertaines. Une famille rassemble ses indices pour transmettre son histoire sans combler les silences par des inventions.',
  'retour-haiti': 'Entre Port-au-Prince et Paris, Ari, Sam et Kim vivent des départs et des retours. Suivez leurs lieux de vie et les questions qu’ils laissent aux générations suivantes.',
};
for (const fixture of demoTrees) {
  let tree = owned.find((item) => item.nom === fixture.nom);
  if (!tree) tree = await request('/arbres', { nom: fixture.nom, visibilite: 'public', presentationPublique: true, introductionPublique: introductions[fixture.slug], languesPubliques: fixture.declaredLanguages.map((language) => language.iso) });
  if (!tree.presentationPublique || tree.visibilite !== 'public') throw new Error('L’arbre existant n’a pas autorisé sa présentation publique.');
  const persons = await request(`/arbres/${tree.id}/personnes`); const ids = new Map();
  for (const person of fixture.people) {
    let saved = persons.find((item) => item.prenom === person.prenom && item.nom === person.nom);
    if (!saved) { const { id, ...data } = person; void id; saved = await request(`/arbres/${tree.id}/personnes`, data); persons.push(saved); }
    ids.set(person.id, saved.id);
  }
  const relations = await request(`/arbres/${tree.id}/relations`);
  for (const relation of fixture.relations) {
    const body = { personneId1: ids.get(relation.personneId1), personneId2: ids.get(relation.personneId2), typeRelation: relation.typeRelation };
    if (!relations.some((item) => Object.entries(body).every(([key, value]) => item[key] === value))) relations.push(await request(`/arbres/${tree.id}/relations`, body));
  }
  const migrations = await request(`/arbres/${tree.id}/migrations`);
  for (const step of fixture.migrations) {
    const personId = ids.get(step.personneId);
    if (migrations.some((item) => item.personneId === personId && item.lieu.nom === step.lieu.nom && item.lieu.pays === step.lieu.pays && (item.dateEvenement?.slice(0, 10) || null) === step.dateEvenement)) continue;
    const body = { personneId: personId, lieu: step.lieu.nom, pays: step.lieu.pays, ordre: step.ordre };
    if (step.dateEvenement) body.dateEvenement = step.dateEvenement;
    if (step.lieu.latitude !== null) Object.assign(body, { latitude: step.lieu.latitude, longitude: step.lieu.longitude });
    migrations.push(await request(`/arbres/${tree.id}/migrations`, body));
  }
  const publicTree = await request(`/arbres/presentations/${tree.id}`);
  if (publicTree.personnes.length !== fixture.people.length || publicTree.migrations.length !== fixture.migrations.length || publicTree.relations.length !== fixture.relations.length) throw new Error('La recette des quantités ne correspond pas au scénario.');
  report.push({ id: tree.id, slug: fixture.slug, nom: tree.nom, personnes: persons.length, relations: relations.length, migrations: migrations.length });
  console.log(JSON.stringify(report.at(-1)));
}
await writeFile(`${credentialsFile}.trees.json`, JSON.stringify(report, null, 2), { mode: 0o600 });
console.log('Compte et quatre arbres publics vérifiés. Aucun mot de passe ni jeton affiché.');
