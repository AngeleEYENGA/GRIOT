import countryData from '../data/countries.json' with { type: 'json' };

export const normalizePlace = (text = '') => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });
export const countries = countryData.map((item) => ({ ...item, label: displayNames.of(item.code) || item.name })).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
export function findCountry(value) {
  const query = normalizePlace(value);
  return countries.find((item) => [item.code, item.name, item.label].some((name) => normalizePlace(name) === query));
}

let citiesPromise;
export function loadCities() {
  if (!citiesPromise) {
    citiesPromise = fetch('/data/cities.json').then((response) => {
      if (!response.ok) throw new Error('Catalogue indisponible');
      return response.json();
    }).then((rows) => rows.map(([id, name, countryCode, latitude, longitude, region, population, asciiName]) => ({
      id, name, countryCode, latitude, longitude, region, population,
      search: normalizePlace(`${name} ${asciiName}`),
    }))).catch((error) => { citiesPromise = null; throw error; });
  }
  return citiesPromise;
}

export function searchCities(cities, query, country = '', limit = 8) {
  const normalized = normalizePlace(query);
  if (normalized.length < 2) return [];
  const selected = findCountry(country);
  // An unrecognised country must not silently suggest cities from another country.
  if (country.trim() && !selected) return [];
  return cities.filter((city) => (!selected || city.countryCode === selected.code) && city.search.includes(normalized))
    .sort((a, b) => Number(normalizePlace(b.name) === normalized) - Number(normalizePlace(a.name) === normalized) || Number(b.search.startsWith(normalized)) - Number(a.search.startsWith(normalized)) || b.population - a.population)
    .slice(0, limit);
}

export function distanceKm(latitude, longitude, city) {
  const radians = (value) => value * Math.PI / 180;
  const deltaLat = radians(city.latitude - latitude);
  const deltaLon = radians(city.longitude - longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(latitude)) * Math.cos(radians(city.latitude)) * Math.sin(deltaLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function nearestCity(cities, latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return cities.reduce((nearest, city) => {
    const distance = distanceKm(latitude, longitude, city);
    return !nearest || distance < nearest.distance ? { city, distance } : nearest;
  }, null);
}
