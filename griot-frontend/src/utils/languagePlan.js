import { findCountry } from './geography.js';
import { hasJourneyDate, personIdOf } from './originsJourney.js';
import { learningCourses } from '../data/worldCourses.js';
import languages from '../data/languages.json' with { type: 'json' };

// A practical shortlist, not an inventory of a country's languages or an identity classifier.
const practical = { GB: ['eng'], US: ['eng'], AU: ['eng'], NZ: ['eng'], IE: ['eng'], CA: ['eng'], DE: ['deu'], AT: ['deu'], CH: ['deu'], ES: ['spa'], MX: ['spa'], AR: ['spa'], CO: ['spa'], PE: ['spa'], CL: ['spa'], EC: ['spa'], BO: ['spa'], UY: ['spa'], PY: ['spa'], VE: ['spa'], CU: ['spa'], DO: ['spa'], CR: ['spa'], PA: ['spa'], GT: ['spa'], HN: ['spa'], SV: ['spa'], NI: ['spa'], GQ: ['spa'], CN: ['cmn'], TW: ['cmn'], SG: ['eng', 'cmn'] };

export function buildLanguagePlan(migrations = [], declared = []) {
  const countries = [...new Map(migrations.map((step) => findCountry(step.lieu?.pays || '')).filter(Boolean).map((country) => [country.code, country])).values()];
  const latest = new Set(); const uncertainPeople = [];
  const groups = new Map();
  migrations.filter((step) => personIdOf(step) && hasJourneyDate(step)).forEach((step) => { const id = personIdOf(step); groups.set(id, [...(groups.get(id) || []), step]); });
  groups.forEach((steps, id) => {
    const time = Math.max(...steps.map((step) => new Date(step.dateEvenement).getTime()));
    const last = steps.filter((step) => new Date(step.dateEvenement).getTime() === time);
    const codes = new Set(last.map((step) => findCountry(step.lieu?.pays || '')?.code));
    if (codes.size !== 1 || codes.has(undefined)) uncertainPeople.push(id);
    else latest.add([...codes][0]);
  });
  const courses = learningCourses.map((course) => {
    const catalogueId = languages.find((language) => language.iso === course.iso)?.id;
    const family = declared.some((language) => language.iso === course.iso || (language.id && [course.languageId, catalogueId, course.id].includes(language.id)));
    const places = countries.filter((country) => practical[country.code]?.includes(course.iso));
    return { course, family, places, latestPlaces: places.filter((country) => latest.has(country.code)) };
  }).sort((a, b) => Number(b.family) - Number(a.family) || Number(Boolean(b.latestPlaces.length)) - Number(Boolean(a.latestPlaces.length)) || b.places.length - a.places.length);
  return { countries, courses, uncertainPeople };
}
