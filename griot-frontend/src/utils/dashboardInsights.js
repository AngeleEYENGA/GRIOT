export function getUpcomingBirthdays(personnes, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return personnes.filter((person) => person.dateNaissance && !person.dateDeces).flatMap((person) => {
    const birth = new Date(person.dateNaissance);
    if (Number.isNaN(birth.getTime()) || birth > now) return [];
    const month = birth.getUTCMonth();
    const day = birth.getUTCDate();
    let date = new Date(today.getFullYear(), month, day);
    if (date < today) date = new Date(today.getFullYear() + 1, month, day);
    return [{ person, date, age: date.getFullYear() - birth.getUTCFullYear(), today: date.getTime() === today.getTime() }];
  }).sort((a, b) => a.date - b.date).slice(0, 4);
}

export function getProfileCoverage(personnes) {
  return [
    { label: 'Une biographie', hint: 'Le parcours, le métier, les valeurs, les moments qui comptent.', count: personnes.filter((p) => p.biographie?.trim()).length },
    { label: 'Une date de naissance', hint: 'Un repère pour relier les générations et retrouver les anniversaires.', count: personnes.filter((p) => p.dateNaissance).length },
    { label: 'Un lieu d’origine', hint: 'Un village ou une ville pour situer les racines de votre famille.', count: personnes.filter((p) => p.villageOrigine?.trim()).length },
  ].map((item) => ({ ...item, total: personnes.length, percent: personnes.length ? Math.round(item.count / personnes.length * 100) : 0 }));
}
