import { useEffect, useRef, useState } from 'react';
import api from '../api/client';

export default function LanguageAudio({ treeId, card, canEdit, onSaved, onError }) {
  const [url, setUrl] = useState(''); const [recording, setRecording] = useState(false); const [busy, setBusy] = useState(false);
  const recorder = useRef(null); const stream = useRef(null); const timer = useRef(null); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); if (recorder.current?.state === 'recording') recorder.current.stop(); stream.current?.getTracks().forEach((track) => track.stop()); }; }, []);
  useEffect(() => { setUrl(''); }, [card.audioMime, card.validee]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const upload = async (file) => {
    if (!file) return;
    onError('');
    if (file.size > 512 * 1024) { onError('Choisissez un court enregistrement de moins de 512 Kio.'); return; }
    setBusy(true);
    try { await api.uploadLanguageAudio(treeId, card.id, file); if (mounted.current) { setUrl(''); onSaved(); } } catch (e) { if (mounted.current) onError(e.message); } finally { if (mounted.current) setBusy(false); }
  };
  const record = async () => {
    if (recording) { recorder.current?.stop(); return; }
    onError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Enregistrement indisponible sur cet appareil. Importez un fichier audio.');
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) { stream.current.getTracks().forEach((track) => track.stop()); return; }
      const mimeType = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((type) => MediaRecorder.isTypeSupported(type));
      const media = new MediaRecorder(stream.current, mimeType ? { mimeType } : {}); recorder.current = media;
      const chunks = [];
      media.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      media.onstop = () => {
        clearTimeout(timer.current); stream.current?.getTracks().forEach((track) => track.stop());
        if (!mounted.current) return;
        setRecording(false);
        const blob = new Blob(chunks, { type: media.mimeType });
        if (blob.size) upload(new File([blob], 'prononciation', { type: media.mimeType }));
      };
      media.onerror = () => { chunks.length = 0; onError('Enregistrement interrompu. Réessayez ou importez un fichier.'); media.ondataavailable = null; if (media.state === 'recording') media.stop(); };
      media.start(); setRecording(true); timer.current = setTimeout(() => { if (media.state === 'recording') media.stop(); }, 15000);
    } catch (e) { stream.current?.getTracks().forEach((track) => track.stop()); onError(e.message); }
  };
  const listen = async () => {
    onError('');
    setBusy(true);
    try { const blob = await api.getLanguageAudio(treeId, card.id); if (mounted.current) setUrl(URL.createObjectURL(blob)); } catch (e) { onError(e.message); } finally { if (mounted.current) setBusy(false); }
  };
  return <div className="griot-language-audio">{card.audioMime && !url && <button className="griot-button griot-button-outline" disabled={busy || recording} onClick={listen}>Écouter la prononciation</button>}{url && <audio controls src={url} aria-label={`Prononciation de ${card.expression}`} preload="metadata" />}{canEdit && <><button className="griot-culture-text-button" disabled={busy} onClick={record}>{recording ? 'Arrêter et envoyer' : 'Enregistrer une voix (15 s)'}</button><label className="griot-culture-text-button">Importer un audio<input type="file" accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm" disabled={busy || recording} onChange={(event) => { upload(event.target.files[0]); event.target.value = ''; }} /></label><small>512 Kio maximum. La voix est partagée avec les membres de cet arbre. Une nouvelle voix remet la fiche en attente de validation.</small></>}{recording && <p role="status">Micro actif · arrêt automatique après 15 secondes.</p>}{busy && <p role="status">Chargement de l’audio…</p>}</div>;
}
