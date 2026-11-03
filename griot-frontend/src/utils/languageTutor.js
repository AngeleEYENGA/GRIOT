import { fangCourse } from '../data/fangCourse.js';
import { answerMatches } from './culture.js';

export const courseItems = fangCourse.units.flatMap((unit) => unit.items);
export const emptyLearning = () => ({ version: 1, skills: {}, days: {}, goal: 5 });
export const learningDay = (time = Date.now()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(time));
export function sanitizeLearning(value, course = fangCourse) {
  const courseItems = course.units.flatMap((unit) => unit.items);
  const next = emptyLearning();
  if (!value || value.version !== 1) return next;
  next.goal = [3, 5, 10].includes(value.goal) ? value.goal : 5;
  courseItems.forEach((item) => {
    const skill = value.skills?.[item.id];
    if (!skill) return;
    next.skills[item.id] = {
      attempts: Math.min(100000, Math.max(0, Number(skill.attempts) || 0)),
      successes: Math.min(100000, Math.max(0, Number(skill.successes) || 0)),
      stage: Math.min(4, Math.max(0, Number(skill.stage) || 0)),
      due: Number.isFinite(skill.due) ? skill.due : 0,
      lastCredit: typeof skill.lastCredit === 'string' ? skill.lastCredit : '',
    };
  });
  Object.entries(value.days || {}).filter(([day, ids]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(ids)).slice(-366).forEach(([day, ids]) => { next.days[day] = [...new Set(ids.filter((id) => courseItems.some((item) => item.id === id)))]; });
  return next;
}
export function recordLearning(state, itemId, correct, helped = false, now = Date.now(), course = fangCourse) {
  const courseItems = course.units.flatMap((unit) => unit.items);
  if (!courseItems.some((item) => item.id === itemId)) return state;
  const next = sanitizeLearning(state, course); const old = next.skills[itemId] || { attempts: 0, successes: 0, stage: 0, due: 0, lastCredit: '' };
  const passed = correct && !helped; const day = learningDay(now);
  const advance = passed && (old.stage === 0 || old.due <= now);
  const stage = passed ? advance ? Math.min(4, old.stage + 1) : old.stage : 0;
  const intervals = [5 * 60000, 86400000, 3 * 86400000, 7 * 86400000, 14 * 86400000];
  next.skills[itemId] = { attempts: old.attempts + 1, successes: old.successes + Number(passed), stage, due: passed && !advance ? old.due : now + intervals[stage], lastCredit: passed ? day : old.lastCredit };
  if (passed) next.days[day] = [...new Set([...(next.days[day] || []), itemId])];
  return next;
}
export function learningStats(state, now = Date.now(), course = fangCourse) {
  const courseItems = course.units.flatMap((unit) => unit.items);
  const today = learningDay(now); const completed = course.units.filter((unit) => unit.items.every((item) => (state.skills[item.id]?.successes || 0) > 0));
  const due = courseItems.filter((item) => state.skills[item.id] && state.skills[item.id].due <= now);
  let streak = 0; let calendar = new Date(`${today}T12:00:00Z`);
  if (!state.days[today]?.length) calendar.setUTCDate(calendar.getUTCDate() - 1);
  while (state.days[calendar.toISOString().slice(0, 10)]?.length) { streak += 1; calendar.setUTCDate(calendar.getUTCDate() - 1); }
  return { completed, due, streak, today: state.days[today]?.length || 0, xp: Object.values(state.days).reduce((sum, items) => sum + items.length * 10, 0) };
}
export function isUnitOpen(unitIndex, state, course = fangCourse) {
  return unitIndex === 0 || course.units.slice(0, unitIndex).every((unit) => unit.items.every((item) => (state.skills[item.id]?.successes || 0) > 0));
}
export function practiceQueue(items, state, now = Date.now()) {
  return [...items].sort((a, b) => {
    const score = (item) => {
      const skill = state.skills[item.id];
      if (skill && !skill.stage) return -3;
      if (skill && skill.due <= now) return -2;
      if (!skill) return -1;
      return skill.stage;
    };
    return score(a) - score(b);
  });
}
export function tutorOptions(item, unit) {
  return item.choices || [...new Set([item.meaning, ...unit.items.filter((other) => other.id !== item.id && other.kind !== 'concept').map((other) => other.meaning)])].sort((a, b) => a.localeCompare(b, 'fr'));
}
export function gradeTutor(item, answer, mode) {
  const apostrophes = (value) => value.replace(/[’‘]/g, "'");
  return answerMatches(apostrophes(answer), apostrophes(item.kind === 'concept' || mode === 'decouverte' ? item.meaning : item.expression));
}
const searchable = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
export function askTutor(question, current, course = fangCourse) {
  const courseItems = course.units.flatMap((unit) => unit.items);
  if (course.ttsLocale && /(audio|voix|parler|prononc|ecout)/.test(searchable(question))) return { text: "Utilisez le bouton de lecture de la leçon si votre appareil propose une voix dans cette langue. Il s’agit d’une synthèse vocale, pas d’un locuteur enregistré. Vous pouvez vous enregistrer et vous réécouter ; aucune note orale automatique n’est attribuée.", source: "reference" };
  const q = searchable(question).trim();
  if (!q) return { text: 'Choisissez une question ou écrivez ce que vous souhaitez comprendre.' };
  if (/(invent|ignore|tradui|comment dit)/.test(q)) return { text: 'Je travaille avec le contenu sourcé de ce parcours. Je peux retrouver un mot déjà enseigné, mais je ne fabrique pas de traduction nouvelle. Précisez le mot du cours ou consultez une source linguistique.' };
  if (/(audio|voix|parler|prononc|ecout)/.test(q)) return { text: 'La salutation Mbóló dispose d’une démonstration externe de Dzaleu. Pour les autres éléments, ce parcours ne dispose pas encore d’un audio vérifié. Enregistrez-vous pour vous réécouter, sans note automatique ; une voix française ne constitue pas un modèle fang.', source: 'dzaleu' };
  if (/(revis|oubli|diffic|progress|conseil)/.test(q)) return { text: 'Les erreurs reviennent en priorité et sont reprogrammées à court terme. Une réponse sans aide espace ensuite les révisions à 1, 3, 7 puis 14 jours. Cinq réponses différentes sans aide constituent un bon petit rendez-vous ; le score ne certifie pas votre niveau oral.' };
  const matched = courseItems.filter((item) => searchable(`${item.expression} ${item.meaning}`).split(/\s+/).some((word) => word.length > 3 && q.includes(word)));
  const target = matched[0] || (/(explique|pourquoi|sens|regle|aide|indice)/.test(q) ? current : null);
  return target ? { text: `${target.expression} → ${target.meaning}. ${target.note}`, source: target.source } : { text: 'Ce point dépasse les éléments de ce premier parcours. Je peux expliquer les salutations, les mots et les trois repères de grammaire du cours ; je ne vérifie pas encore des phrases libres dans cette langue.' };
}
