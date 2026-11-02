import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fangCourse } from '../data/fangCourse.js';
import { askTutor, courseItems, emptyLearning, gradeTutor, isUnitOpen, learningDay, learningStats, practiceQueue, recordLearning, sanitizeLearning } from './languageTutor.js';

const now = Date.parse('2026-11-02T12:00:00Z');
test('a family with no contributions can start the sourced Fang course immediately', () => {
  assert.equal(fangCourse.languageId, 'fang1246');
  assert.equal(courseItems.length, 13);
  assert.equal(new Set(courseItems.map((item) => item.id)).size, courseItems.length);
  assert.ok(courseItems.every((item) => fangCourse.sources[item.source]?.url.startsWith('https://')));
  assert.equal(isUnitOpen(0, emptyLearning()), true);
  assert.equal(isUnitOpen(1, emptyLearning()), false);
});
test('help and errors do not unlock a unit or earn points, while the same word earns points only once a day', () => {
  const initial = emptyLearning();
  let state = recordLearning(initial, 'mbolo', true, true, now);
  assert.equal(state.skills.mbolo.successes, 0); assert.equal(learningStats(state, now).xp, 0);
  state = recordLearning(state, 'mbolo', false, false, now);
  assert.equal(state.skills.mbolo.due, now + 300000);
  state = recordLearning(state, 'mbolo', true, false, now);
  assert.equal(state.skills.mbolo.due, now + 86400000);
  state = recordLearning(state, 'mbolo', true, false, now);
  assert.equal(learningStats(state, now).xp, 10);
  assert.equal(state.skills.mbolo.stage, 1);
  assert.equal(state.skills.mbolo.due, now + 86400000, 'early practice does not artificially advance a spaced review');
  assert.equal(isUnitOpen(1, state), false);
  for (const id of ['mbolane', 'ambolo']) state = recordLearning(state, id, true, false, now);
  assert.equal(isUnitOpen(1, state), true); assert.equal(learningStats(state, now).completed.length, 1);
  assert.deepEqual(initial, emptyLearning());
});
test('wrong items and due reviews precede new items and review intervals reset after an error', () => {
  let state = recordLearning(emptyLearning(), 'mbolo', true, false, now - 2 * 86400000);
  state = recordLearning(state, 'mbolane', false, false, now);
  const queue = practiceQueue(fangCourse.units[0].items, state, now);
  assert.deepEqual(queue.map((item) => item.id), ['mbolane', 'mbolo', 'ambolo']);
  assert.equal(learningStats(state, now).due.length, 1);
  const correct = recordLearning(state, 'mbolo', true, false, now);
  assert.equal(correct.skills.mbolo.due, now + 3 * 86400000);
  const wrong = recordLearning(correct, 'mbolo', false, false, now);
  assert.equal(wrong.skills.mbolo.due, now + 300000);
});
test('written exercises preserve source tones and coach refuses invented free translations', () => {
  const item = courseItems.find((entry) => entry.id === 'mbolo');
  assert.equal(gradeTutor(item, 'Mbóló', 'ecriture'), true);
  assert.equal(gradeTutor(item, 'Mbolo', 'ecriture'), false);
  assert.match(askTutor('Traduis une phrase inconnue', item).text, /ne fabrique pas/);
  assert.equal(askTutor('Comment prononcer ?', item).source, 'dzaleu');
  assert.match(askTutor('Comment prononcer ?', item).text, /pas encore d’un audio vérifié/);
});
test('progress is validated before restoration and day boundaries use Paris time including daylight saving changes', () => {
  assert.deepEqual(sanitizeLearning({ version: 99 }), emptyLearning());
  const state = sanitizeLearning({ version: 1, goal: 999, skills: { invented: { successes: 5000 } }, days: { invalid: ['mbolo'] } });
  assert.equal(state.goal, 5); assert.deepEqual(state.skills, {}); assert.deepEqual(state.days, {});
  assert.equal(learningDay(Date.parse('2026-11-02T23:30:00Z')), '2026-11-03');
  let progress = recordLearning(emptyLearning(), 'mbolo', true, false, Date.parse('2026-10-24T12:00:00Z'));
  progress = recordLearning(progress, 'mbolo', true, false, Date.parse('2026-10-25T12:00:00Z'));
  assert.equal(learningStats(progress, Date.parse('2026-10-26T12:00:00Z')).streak, 2);
});
