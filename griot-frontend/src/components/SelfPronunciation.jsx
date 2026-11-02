import { useEffect, useRef, useState } from 'react';

export default function SelfPronunciation() {
  const [recording, setRecording] = useState(false); const [url, setUrl] = useState(''); const [error, setError] = useState('');
  const recorder = useRef(null); const tracks = useRef(null); const timer = useRef(null); const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; clearTimeout(timer.current); if (recorder.current?.state === 'recording') recorder.current.stop(); tracks.current?.getTracks().forEach((track) => track.stop()); }; }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const start = async () => {
    setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Le micro n’est pas disponible dans ce navigateur. Vous pouvez pratiquer à voix haute sans enregistrement.');
      tracks.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) { tracks.current.getTracks().forEach((track) => track.stop()); return; }
      const media = new MediaRecorder(tracks.current); recorder.current = media; const chunks = []; let failed = false;
      media.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      media.onerror = () => { failed = true; if (active.current) setError('Enregistrement interrompu.'); tracks.current?.getTracks().forEach((track) => track.stop()); if (active.current) setRecording(false); clearTimeout(timer.current); };
      media.onstop = () => { tracks.current?.getTracks().forEach((track) => track.stop()); clearTimeout(timer.current); if (active.current) { setRecording(false); if (!failed && chunks.length) setUrl(URL.createObjectURL(new Blob(chunks, { type: media.mimeType }))); } };
      media.start(); setRecording(true); setUrl(''); timer.current = setTimeout(() => { if (media.state === 'recording') media.stop(); }, 10000);
    } catch (e) { tracks.current?.getTracks().forEach((track) => track.stop()); if (active.current) setError(e.message); }
  };
  return <div className="griot-tutor-speaking"><h5>J’ose le dire à voix haute</h5><p>Écoutez d’abord un modèle lorsqu’il est disponible. Répétez, puis réécoutez votre essai. GRIOT ne note pas encore votre prononciation.</p><button type="button" className="griot-button griot-button-outline" onClick={() => recording ? recorder.current?.stop() : start()}>{recording ? 'Arrêter mon essai' : 'M’enregistrer pour moi (10 s)'}</button>{recording && <p role="status">Micro actif · arrêt automatique après 10 secondes.</p>}{url && <><audio controls src={url} aria-label="Réécouter mon essai personnel" /><button type="button" className="griot-culture-text-button" onClick={() => setUrl('')}>Effacer mon essai</button></>}<small>Essai temporaire sur cet appareil. Aucun envoi ni partage ; il disparaît à la sortie de cet exercice.</small>{error && <p role="alert" className="griot-culture-error">{error}</p>}</div>;
}
