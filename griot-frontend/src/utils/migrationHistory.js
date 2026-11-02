import contexts from '../data/historicalContexts.json' with { type: 'json' };
import { findCountry, normalizePlace } from './geography.js';
import { hasJourneyDate, personIdOf, personLabel, placeLabel, sortJourney } from './originsJourney.js';

export function historicalJourneys(people, migrations) {
  return people.map((person) => {
    const all = migrations.filter((step) => personIdOf(step) === person.id);
    const steps = sortJourney(all.filter(hasJourneyDate));
    const episodes = [];
    steps.forEach((to, index) => {
      const from = steps[index - 1];
      if (!from || new Date(from.dateEvenement) >= new Date(to.dateEvenement) || normalizePlace(placeLabel(from)) === normalizePlace(placeLabel(to))) return;
      const start = new Date(from.dateEvenement); const end = new Date(to.dateEvenement);
      const countries = [findCountry(from.lieu?.pays || '')?.code, findCountry(to.lieu?.pays || '')?.code].filter(Boolean);
      const events = contexts.filter((event) => countries.includes(event.country) && new Date(event.start) <= end && new Date(event.end) >= start);
      episodes.push({ from, to, events, narrative: `${personLabel(person)} est signalé(e) à ${placeLabel(from)} le ${start.toLocaleDateString('fr-FR')}, puis à ${placeLabel(to)} le ${end.toLocaleDateString('fr-FR')}. Ce sont deux présences renseignées dans l’arbre ; la date du départ, le trajet et son motif restent à documenter.` });
    });
    return { person, episodes, undated: all.length - steps.length, steps };
  });
}
export function migrationQuestions(episode) {
  return [
    { title: 'Famille et transmission', question: 'Un mariage, un regroupement familial ou un accueil chez un proche est-il mentionné ?' },
    { title: 'Études et travail', question: 'Existe-t-il un diplôme, un contrat, une lettre ou un témoignage lié à ce changement de lieu ?' },
    ...(episode.events.length ? [{ title: 'Contexte de la période', question: 'Un témoin ou une archive relie-t-il explicitement ce parcours à l’un des événements ci-dessus ?' }] : []),
  ];
}
