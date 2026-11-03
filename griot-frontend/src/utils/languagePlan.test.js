import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoTrees } from '../data/demoTrees.js';
import { worldCourses } from '../data/worldCourses.js';
import { buildLanguagePlan } from './languagePlan.js';
import { emptyLearning, recordLearning, sanitizeLearning, learningStats, isUnitOpen, gradeTutor, askTutor } from './languageTutor.js';

test('all diaspora branches suggest their practical courses while declared Fang stays distinct', () => {
  const tree = demoTrees.find((item) => item.slug === 'diaspora');
  const plan = buildLanguagePlan(tree.migrations, tree.declaredLanguages);
  assert.equal(plan.countries.length, 5);
  assert.equal(plan.courses[0].course.iso, 'fan');
  assert.equal(plan.courses.filter((item) => item.family).length, 1);
  assert.deepEqual(plan.courses.filter((item) => item.latestPlaces.length).map((item) => item.course.iso).sort(), ['cmn', 'deu', 'eng', 'spa']);
  assert.equal(buildLanguagePlan(tree.migrations).courses.some((item) => item.family), false);
});
test('historical countries remain discoverable but undated and conflicting latest presences do not become residence', () => {
  const step = (id, dateEvenement, pays) => ({ id, personneId: 'p', dateEvenement, lieu: { pays } });
  const plan = buildLanguagePlan([step('1', '2000-01-01', 'GB'), step('2', '2010-01-01', 'DE'), step('3', null, 'CN')]);
  assert.equal(plan.courses.find((item) => item.course.iso === 'eng').latestPlaces.length, 0);
  assert.equal(plan.courses.find((item) => item.course.iso === 'deu').latestPlaces.length, 1);
  assert.equal(plan.courses.find((item) => item.course.iso === 'cmn').latestPlaces.length, 0);
  const conflict = buildLanguagePlan([step('1', '2010-01-01', 'DE'), step('2', '2010-01-01', 'GB')]);
  assert.deepEqual(conflict.uncertainPeople, ['p']);
  assert.ok(conflict.courses.every((item) => !item.latestPlaces.length));
  assert.equal(buildLanguagePlan([], [{ id: 'stan1293', name: 'English' }]).courses.find((item) => item.course.iso === 'eng').family, true);
});
test('four independent beginner courses unlock, review and restore only their own progress', () => {
  for (const course of worldCourses) {
    let state = emptyLearning();
    assert.equal(course.units.length, 3);
    for (const item of course.units[0].items) {
      assert.ok(course.sources[item.source]?.url.startsWith('https://'));
      assert.equal(gradeTutor(item, item.expression, 'ecriture'), true);
      assert.equal(gradeTutor(item, item.meaning, 'decouverte'), true);
      state = recordLearning(state, item.id, true, false, 1000000, course);
    }
    assert.equal(isUnitOpen(1, state, course), true);
    assert.equal(learningStats(state, 1000000, course).xp, 30);
    assert.equal(learningStats(state, 1000000, course).completed.length, 1);
    assert.deepEqual(sanitizeLearning(state).skills, {}, 'global progress must not leak into Fang');
    assert.deepEqual(sanitizeLearning(state, worldCourses.find((other) => other.id !== course.id)).skills, {});
    assert.match(askTutor('Comment prononcer ?', course.units[0].items[0], course).text, /synthèse vocale/);
  }
  const spanish = worldCourses.find((course) => course.iso === 'spa');
  assert.equal(gradeTutor(spanish.units[1].items[0], 'Buenos dias', 'ecriture'), false);
  const english = worldCourses.find((course) => course.iso === 'eng');
  assert.equal(gradeTutor(english.units[1].items[1], "My name isn't", 'ecriture'), true);
});
