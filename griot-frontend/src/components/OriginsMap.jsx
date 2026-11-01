import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function validMapPoint(item) {
  return Number.isFinite(item.lieu?.latitude) && Number.isFinite(item.lieu?.longitude) && Math.abs(item.lieu.latitude) <= 90 && Math.abs(item.lieu.longitude) <= 180;
}

export default function OriginsMap({ migrations, replayIndex }) {
  const host = useRef(null);
  const map = useRef(null);
  const routes = useRef(null);
  const [error, setError] = useState('');
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
    const points = migrations.map((item, index) => ({ ...item, routeIndex: index })).filter(validMapPoint);
    const visible = points.filter((point) => replayIndex < 0 || point.routeIndex <= replayIndex);
    const groups = new Map();
    visible.forEach((item) => {
      const list = groups.get(item.personneId || item.personne?.id) || [];
      list.push([item.lieu.latitude, item.lieu.longitude]);
      groups.set(item.personneId || item.personne?.id, list);
      const popup = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = `${item.routeIndex + 1}. ${item.lieu.nom}`; popup.append(title);
      const detail = document.createElement('p'); detail.textContent = `${item.personne?.prenom || ''} ${item.personne?.nom || ''}${item.dateEvenement ? ` · ${new Date(item.dateEvenement).toLocaleDateString('fr-FR')}` : ' · Date non renseignée'}`; popup.append(detail);
      const marker = L.circleMarker([item.lieu.latitude, item.lieu.longitude], { radius: item.routeIndex === replayIndex ? 11 : 7, color: '#fff', weight: 2, fillColor: item.routeIndex === replayIndex ? '#c9932e' : '#943f27', fillOpacity: 1 }).bindPopup(popup).addTo(layer);
      if (item.routeIndex === replayIndex) marker.openPopup();
    });
    groups.forEach((positions) => { if (positions.length > 1) L.polyline(positions, { color: '#943f27', weight: 3, dashArray: '7 6' }).addTo(layer); });
    if (replayIndex >= 0) {
      const selected = visible.find((point) => point.routeIndex === replayIndex);
      if (selected) map.current.panTo([selected.lieu.latitude, selected.lieu.longitude], { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    } else if (points.length) map.current.fitBounds(points.map((point) => [point.lieu.latitude, point.lieu.longitude]), { padding: [30, 30], maxZoom: 6, animate: false });
  }, [migrations, replayIndex]);
  return <section className="griot-live-map-card"><h3>L’histoire de votre arbre, sur la carte</h3><p>Déplacez la carte, zoomez et touchez un point. Les traits relient les étapes d’une même personne ; ils ne décrivent pas un itinéraire routier.</p><div ref={host} className="griot-live-map" role="region" aria-label="Carte interactive des parcours familiaux" />{error && <p role="status">{error}</p>}<small>Fond : <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> (domaine public), représentation simplifiée. Les étapes détaillées restent disponibles sous la carte.</small></section>;
}
