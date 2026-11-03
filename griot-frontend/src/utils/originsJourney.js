const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
export const personIdOf = (step) => step.personneId || step.personne?.id;
export const validCoordinates = (step) => Number.isFinite(step.lieu?.latitude) && Number.isFinite(step.lieu?.longitude) && Math.abs(step.lieu.latitude) <= 90 && Math.abs(step.lieu.longitude) <= 180;
export const hasJourneyDate = (step) => Boolean(step.dateEvenement && Number.isFinite(new Date(step.dateEvenement).getTime()));
export const personLabel = (person) => person ? `${person.prenom || ''} ${person.nom || ''}`.trim() : 'Personne non renseignée';
export const placeLabel = (step) => [step.lieu?.nom, step.lieu?.pays].filter(Boolean).join(', ');
export const journeyColors = ['#98502e', '#316b70', '#68549a', '#51713f', '#9b4563', '#795e27'];

export function ambiguousJourneyIds(steps) {
  const groups = new Map(); const ambiguous = new Set();
  steps.filter(hasJourneyDate).forEach((step) => {
    const key = `${personIdOf(step)}:${new Date(step.dateEvenement).getTime()}`;
    const group = groups.get(key) || []; group.push(step); groups.set(key, group);
  });
  groups.forEach((group) => {
    if (new Set(group.map((step) => normalize(placeLabel(step)))).size > 1) group.forEach((step) => ambiguous.add(step.id));
  });
  return ambiguous;
}

export function sortJourney(steps) {
  return [...steps].sort((a, b) => {
    if (hasJourneyDate(a) !== hasJourneyDate(b)) return hasJourneyDate(a) ? -1 : 1;
    if (hasJourneyDate(a)) {
      const difference = new Date(a.dateEvenement) - new Date(b.dateEvenement);
      if (difference) return difference;
    }
    return (a.ordre || 0) - (b.ordre || 0) || String(a.id).localeCompare(String(b.id));
  });
}

export function summarizeJourney(steps, people, selectedPerson = '') {
  const visible = sortJourney(steps.filter((step) => !selectedPerson || personIdOf(step) === selectedPerson));
  const dated = visible.filter(hasJourneyDate);
  const located = visible.filter(validCoordinates);
  const places = new Set(visible.map((step) => normalize(placeLabel(step))));
  const countries = new Set(visible.map((step) => normalize(step.lieu?.pays)).filter(Boolean));
  const peopleIds = new Set(visible.map(personIdOf));
  const declaredOrigins = people.filter((person) => (!selectedPerson || person.id === selectedPerson) && person.villageOrigine?.trim()).map((person) => {
    const matching = visible.filter((step) => personIdOf(step) === person.id && normalize(step.lieu?.nom) === normalize(person.villageOrigine));
    return { person, linked: matching.find(validCoordinates) || matching[0] };
  });
  const unplacedOrigins = declaredOrigins.filter((origin) => !origin.linked || !validCoordinates(origin.linked));
  return { visible, dated, located, ambiguous: ambiguousJourneyIds(visible), places: places.size, countries: countries.size, peopleIds, declaredOrigins, unplacedOrigins, undated: visible.filter((step) => !hasJourneyDate(step)), unmapped: visible.filter((step) => !validCoordinates(step)), first: dated[0], last: dated.at(-1) };
}

export function datedConnections(steps) {
  const groups = new Map();
  const ambiguous = ambiguousJourneyIds(steps);
  // Keep missing coordinates in the sequence: never draw a route across an unknown stage.
  sortJourney(steps.filter(hasJourneyDate)).forEach((step) => {
    const id = personIdOf(step);
    if (!id) return;
    const group = groups.get(id) || [];
    group.push(step); groups.set(id, group);
  });
  const connections = [];
  groups.forEach((group) => group.forEach((step, index) => {
    const previous = group[index - 1];
    if (previous && !ambiguous.has(previous.id) && !ambiguous.has(step.id) && normalize(placeLabel(previous)) !== normalize(placeLabel(step)) && validCoordinates(previous) && validCoordinates(step) && new Date(previous.dateEvenement) < new Date(step.dateEvenement)) connections.push([previous, step]);
  }));
  return connections;
}
