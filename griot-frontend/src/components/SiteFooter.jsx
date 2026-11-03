export const CONTACT_EMAIL = 'contact.gamlabs@proton.me';

export default function SiteFooter({ compact = false }) {
  return <footer className={compact ? 'griot-sidebar-footer' : 'griot-site-footer'}>
    <div><p>© {new Date().getFullYear()} GAM Labs</p><a className="griot-footer-email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
    <nav aria-label={compact ? 'Informations GAM Labs' : 'À propos et contact'}><a href="#/a-propos">À propos de nous</a><a href="#/contact">Contact</a><a href="#/demonstrations">Arbres de démonstration</a></nav>
    <span>Préserver. Transmettre. Relier.</span>
  </footer>;
}
