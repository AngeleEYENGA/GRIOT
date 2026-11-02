export default function DocumentBrand({ title, subtitle, footer = false }) {
  if (footer) return <div className="griot-document-footer"><span>GRIOT · GAM Labs</span><span>Préserver. Transmettre. Relier.</span><span>contact.gamlabs@proton.me</span></div>;
  return <div className="griot-document-header"><div className="griot-document-wordmark">GRIOT <span>MÉMOIRE NUMÉRIQUE</span></div><div><h1>{title}</h1><p>{subtitle}</p></div><small>Collection familiale · Document privé</small></div>;
}
