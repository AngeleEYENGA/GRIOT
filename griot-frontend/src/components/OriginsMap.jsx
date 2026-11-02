import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { datedConnections, hasJourneyDate, personIdOf, personLabel, placeLabel, validCoordinates } from '../utils/originsJourney';

export default function OriginsMap({ migrations, selectedId, onSelectStep, personColors, fitKey }) {
  const host = useRef(null);
  const map = useRef(null);
  const routes = useRef(null);
  const [error, setError] = useState('');
  const onSelect = useRef(onSelectStep);
  onSelect.current = onSelectStep;
  useEffect(() => {
    const instance = L.map(host.current, { scrollWheelZoom: false, minZoom: 1, maxZoom: 12 }).setView([8, 15], 2);
    map.current = instance;
    routes.current = L.layerGroup().addTo(instance);
    let active = true;
    fetch('/data/world.geojson').then((response) => {
      if (!response.ok) throw new Error('Fond cartographique indisponible');
      return response.json();
    }).then((data) => {
      if (!active) return;
      L.geoJSON(data, { style: { color: '#9c987f', weight: .7, fillColor: '#d4d7bf', fillOpacity: .7 }, onEachFeature: (feature, layer) => {
        const label = document.createElement('span'); label.textContent = feature.properties.name;
        layer.bindTooltip(label);
      } }).addTo(instance).bringToBack();
    }).catch(() => { if (active) setError('Fond non disponible. Les points et parcours restent visibles. Préparez le mode hors ligne pour conserver la carte.'); });
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(host.current);
    return () => { active = false; resize.disconnect(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current || !routes.current) return;
    const layer = routes.current; layer.clearLayers();
    const points = migrations.filter(validCoordinates);
    const dated = migrations.filter(hasJourneyDate);
    datedConnections(migrations).forEach(([first, second]) => {
      L.polyline([[first.lieu.latitude, first.lieu.longitude], [second.lieu.latitude, second.lieu.longitude]], { color: personColors[personIdOf(first)] || '#98502e', weight: 3, opacity: .7, dashArray: '7 7' }).addTo(layer);
    });
    points.forEach((item) => {
      const color = personColors[personIdOf(item)] || '#98502e';
      const popup = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = placeLabel(item); popup.append(title);
      const detail = document.createElement('p'); detail.textContent = `${personLabel(item.personne)} · ${hasJourneyDate(item) ? new Date(item.dateEvenement).toLocaleDateString('fr-FR') : 'Date à retrouver'}`; popup.append(detail);
      const pin = document.createElement('span'); pin.className = `griot-origin-pin${item.id === selectedId ? ' is-selected' : ''}${!hasJourneyDate(item) ? ' is-undated' : ''}`; pin.textContent = hasJourneyDate(item) ? String(dated.findIndex((step) => step.id === item.id) + 1) : '?'; pin.style.setProperty('--pin-color', color);
      const marker = L.marker([item.lieu.latitude, item.lieu.longitude], { icon: L.divIcon({ html: pin, className: 'griot-origin-marker', iconSize: [30, 30], iconAnchor: [15, 15] }), title: `${placeLabel(item)} · ${personLabel(item.personne)}`, zIndexOffset: item.id === selectedId ? 1000 : 0 }).bindPopup(popup, { autoPan: false }).on('click', () => onSelect.current(item.id)).addTo(layer);
      if (item.id === selectedId) marker.openPopup();
    });
    if (selectedId) {
      const selected = points.find((point) => point.id === selectedId);
      if (selected) map.current.setView([selected.lieu.latitude, selected.lieu.longitude], Math.max(map.current.getZoom(), 4), { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    } else if (points.length) map.current.fitBounds(points.map((point) => [point.lieu.latitude, point.lieu.longitude]), { padding: [30, 30], maxZoom: 6, animate: false });
  }, [migrations, selectedId, personColors, fitKey]);
  return <section className="griot-live-map-card griot-origins-map-card"><div ref={host} className="griot-live-map" role="region" aria-label="Carte interactive des parcours familiaux" />{!migrations.some(validCoordinates) && <div className="griot-origins-map-empty"><strong>Les lieux attendent leurs repères.</strong><span>{migrations.length ? 'Les étapes sont conservées dans la chronologie. Ajoutez leurs coordonnées pour les retrouver ici.' : 'Commencez par un village connu ou une étape transmise par un proche.'}</span></div>}{error && <p role="status">{error}</p>}<small>Fond simplifié : <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>. Les traits relient uniquement des étapes datées d’une même personne, sans reconstituer son trajet exact.</small></section>;
}
