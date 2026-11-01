import { useEffect, useId, useRef, useState } from 'react';
import { countries, findCountry, loadCities, nearestCity, searchCities } from '../utils/geography';

export default function PlaceFields({ value, onChange }) {
  const id = useId();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');
  const request = useRef(0);
  const current = useRef(value);
  current.current = value;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    loadCities().then((items) => { if (active) setCities(items); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; request.current += 1; };
  }, [reload]);
  const suggestions = focused ? searchCities(cities, value.lieu, value.pays) : [];
  const update = (patch) => {
    request.current += 1;
    setLocating(false);
    setMessage('');
    setActiveIndex(-1);
    onChange({ ...value, latitude: '', longitude: '', ...patch });
  };
  const choose = (city) => {
    const country = countries.find((item) => item.code === city.countryCode);
    update({ lieu: city.name, pays: country?.label || value.pays, latitude: String(city.latitude), longitude: String(city.longitude) });
    setMessage('Ville sélectionnée : les coordonnées ont été remplies. Vérifiez le lieu avant de l’enregistrer.');
    setFocused(false);
  };
  const locate = () => {
    if (!navigator.geolocation) { setMessage('La géolocalisation est indisponible. Vous pouvez saisir le lieu manuellement.'); return; }
    const token = ++request.current;
    setLocating(true);
    setFocused(false);
    setMessage('Recherche de votre position…');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (request.current !== token) return;
      const nearest = nearestCity(cities, coords.latitude, coords.longitude);
      const position = { latitude: String(Number(coords.latitude.toFixed(5))), longitude: String(Number(coords.longitude.toFixed(5))) };
      const country = nearest && countries.find((item) => item.code === nearest.city.countryCode);
      if (nearest && nearest.distance <= 75) {
        onChange({ ...current.current, ...position, lieu: nearest.city.name, pays: country?.label || current.current.pays });
        setMessage(`Ville proche proposée : ${nearest.city.name} (environ ${Math.round(nearest.distance)} km). Vérifiez la ville et le pays : la position actuelle ne prouve pas une origine familiale.`);
      } else {
        onChange({ ...current.current, ...position });
        setMessage('Coordonnées actuelles renseignées. Indiquez ou vérifiez la ville et le pays avant d’enregistrer.');
      }
      setLocating(false);
    }, (error) => {
      if (request.current !== token) return;
      setLocating(false);
      setMessage(error.code === 1 ? 'Accès à la position refusé. La saisie manuelle reste disponible.' : 'Position introuvable. Réessayez ou saisissez le lieu manuellement.');
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
  };

  return <div className="griot-place-fields">
    <div className="griot-place-inputs">
      <label htmlFor={`${id}-country`}>Pays<input id={`${id}-country`} list={`${id}-countries`} maxLength={120} autoComplete="country-name" value={value.pays} onChange={(event) => update({ pays: event.target.value })} placeholder="Commencez par choisir un pays" /></label>
      <datalist id={`${id}-countries`}>{countries.map((country) => <option key={country.code} value={country.label}>{country.code}</option>)}</datalist>
      <div className="griot-city-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <label htmlFor={`${id}-city`}>Ville ou village<input id={`${id}-city`} role="combobox" aria-expanded={suggestions.length > 0} aria-controls={`${id}-results`} aria-autocomplete="list" aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `${id}-result-${activeIndex}` : undefined} required maxLength={120} autoComplete="off" value={value.lieu} onFocus={() => setFocused(true)} onChange={(event) => { update({ lieu: event.target.value }); setFocused(true); }} onKeyDown={(event) => {
          if (event.key === 'Escape') { setFocused(false); setActiveIndex(-1); }
          if (!suggestions.length) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => index < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length); }
          if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) { event.preventDefault(); choose(suggestions[activeIndex]); }
        }} placeholder="Ex. Yaoundé, Douala, Paris…" aria-describedby={`${id}-hint`} /></label>
        {suggestions.length > 0 && <ul id={`${id}-results`} className="griot-city-results" role="listbox" aria-label="Villes suggérées">{suggestions.map((city, index) => <li key={city.id} role="option" id={`${id}-result-${index}`} aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()}><button type="button" tabIndex={-1} onClick={() => choose(city)}><strong>{city.name}</strong><small>{city.region} · {countries.find((country) => country.code === city.countryCode)?.label || city.countryCode}</small></button></li>)}</ul>}
      </div>
    </div>
    <p id={`${id}-hint`} className="griot-place-hint">{loading ? 'Chargement du catalogue des villes…' : loadError ? 'Catalogue indisponible : vous pouvez saisir un lieu librement.' : value.pays && !findCountry(value.pays) ? 'Choisissez un pays proposé pour filtrer les villes, ou conservez votre saisie libre.' : 'Saisissez au moins 2 lettres, puis sélectionnez une ville pour remplir les coordonnées. Les villages absents restent saisissables.'}</p>
    {loadError && <button type="button" className="griot-dashboard-text-link" onClick={() => setReload((value) => value + 1)}>Recharger les suggestions</button>}
    <div className="griot-place-geolocation"><button type="button" className="griot-button griot-button-outline" onClick={locate} disabled={locating || loading}>{locating ? 'Localisation en cours…' : '⌖ Utiliser ma position actuelle'}</button><small>Facultatif. Votre navigateur vous demandera l’autorisation. La recherche de ville reste sur cet appareil ; l’enregistrement transmet le lieu et ses coordonnées à votre arbre.</small></div>
    {message && <p className="griot-place-message" role="status">{message}</p>}
    <small className="griot-place-attribution">Catalogue de villes : <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Couverture non exhaustive.</small>
  </div>;
}
