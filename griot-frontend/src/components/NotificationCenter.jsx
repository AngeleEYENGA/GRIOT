import { useState } from 'react';
import api from '../api/client';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState('');

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const result = await api.getNotifications();
      setNotifications(result.items);
      setUnread(result.unread);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = async (notification) => {
    setProcessingId(notification.id);
    setError('');
    try {
      if (notification.type === 'invitation_arbre' && notification.arbreId && notification.cibleId) {
        await api.acceptMemberInvite(notification.arbreId, notification.cibleId);
      } else if (
        notification.type === 'invitation_institution'
        && notification.institutionId
        && notification.cibleId
      ) {
        await api.acceptInstitutionInvite(notification.institutionId, notification.cibleId);
      }
      if (!notification.lue) await api.markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, lue: true } : item
      )));
      if (!notification.lue) setUnread((count) => Math.max(0, count - 1));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div className="griot-notifications">
      <button
        type="button"
        className="griot-notifications-trigger"
        aria-label={`Notifications${unread ? `, ${unread} non lue${unread === 1 ? '' : 's'}` : ''}`}
        aria-expanded={open}
        onClick={toggle}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unread > 0 && <span className="griot-notifications-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <section className="griot-notifications-panel" aria-label="Vos notifications">
          <header><h2>Notifications</h2><button type="button" onClick={() => setOpen(false)} aria-label="Fermer">×</button></header>
          {error && <p className="griot-inline-error" role="alert">{error}</p>}
          {loading ? <p className="griot-muted">Chargement des notifications…</p> : notifications.length === 0 ? (
            <p className="griot-muted">Aucune notification pour le moment.</p>
          ) : (
            <div className="griot-notifications-list">
              {notifications.map((notification) => {
                const isInvitation = ['invitation_arbre', 'invitation_institution'].includes(notification.type);
                return (
                  <article key={notification.id} className={!notification.lue ? 'is-unread' : ''}>
                    <p>{notification.contenu}</p>
                    <time dateTime={notification.dateCreation}>{new Date(notification.dateCreation).toLocaleDateString('fr-FR')}</time>
                    {!notification.lue && (
                      <button
                        type="button"
                        disabled={processingId === notification.id}
                        onClick={() => handleNotification(notification)}
                      >
                        {processingId === notification.id
                          ? 'Traitement…'
                          : isInvitation ? 'Accepter l’invitation' : 'Marquer comme lue'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
