import { useEffect, useState } from 'react';

export default function SynthPronunciation({ item, locale }) {
  const [voices, setVoices] = useState([]); const [status, setStatus] = useState('');
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const refresh = () => setVoices(synth.getVoices());
    refresh(); synth.addEventListener('voiceschanged', refresh);
    return () => { synth.removeEventListener('voiceschanged', refresh); synth.cancel(); };
  }, []);
  // Require the requested locale: never silently substitute French or Cantonese for Mandarin.
  const voice = voices.find((entry) => entry.lang.toLowerCase().replace('_', '-') === locale.toLowerCase());
  const speak = () => {
    if (!voice) return;
    const synth = window.speechSynthesis; synth.cancel();
    const utterance = new SpeechSynthesisUtterance(item.expression);
    utterance.voice = voice; utterance.lang = locale; utterance.rate = .8;
    utterance.onerror = () => setStatus('La lecture a échoué. Consultez la source ou réessayez avec une connexion.');
    utterance.onend = () => setStatus('Lecture terminée. À votre tour de répéter.');
    setStatus('Écoute en cours…'); synth.speak(utterance);
  };
  return <div className="griot-tutor-model">{item.pronunciation && <p>Pinyin : <strong>{item.pronunciation}</strong></p>}<button type="button" className="griot-button griot-button-outline" disabled={!voice} onClick={speak}>Écouter · voix de synthèse</button><small>{voice ? `${voice.name} · ${locale}. Synthèse de l’appareil ; le service vocal peut nécessiter Internet.` : `Aucune voix ${locale} disponible sur cet appareil. La leçon écrite reste accessible ; consultez les ressources de la source.`}</small>{status && <p role="status">{status}</p>}</div>;
}
