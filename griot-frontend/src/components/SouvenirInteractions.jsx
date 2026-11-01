import { useEffect, useState } from 'react';
import api from '../api/client';

const EMPTY_MEDIA = [];

function mediaLabel(type) {
  return {
    audio: 'Enregistrement audio',
    video: 'Vidéo',
    photo: 'Photo',
    document: 'Document',
  }[type] || 'Média';
}

export default function SouvenirInteractions({ arbreId, souvenir, role, userId }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [media, setMedia] = useState([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [shareText, setShareText] = useState('');
  const canComment = ['admin', 'editeur', 'contributeur'].includes(role);
  const mediaList = souvenir.medias || EMPTY_MEDIA;

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    const objectUrls = [];

    const loadInteractions = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      try {
        const [loadedComments, loadedMedia] = await Promise.all([
          api.getSouvenirComments(arbreId, souvenir.id),
          Promise.all(mediaList.map(async (item) => {
            try {
              const blob = await api.getSouvenirMediaBlob(arbreId, item.id);
              const url = URL.createObjectURL(blob);
              if (!active) {
                URL.revokeObjectURL(url);
                return { ...item, url: '', error: 'Le panneau a été fermé avant la fin du chargement.' };
              }
              objectUrls.push(url);
              return { ...item, url, error: '' };
            } catch (requestError) {
              return { ...item, url: '', error: requestError.message };
            }
          })),
        ]);
        if (active) {
          setComments(loadedComments);
          setMedia(loadedMedia);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInteractions();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [arbreId, mediaList, open, souvenir.id]);

  const addComment = async (event) => {
    event.preventDefault();
    const contenu = commentDraft.trim();
    if (!contenu) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const commentaire = await api.createSouvenirComment(arbreId, souvenir.id, contenu);
      setComments((current) => [...current, commentaire]);
      setCommentDraft('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteComment = async (commentId) => {
    setError('');
    setMessage('');
    try {
      await api.deleteSouvenirComment(arbreId, souvenir.id, commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const shareSouvenir = async () => {
    setError('');
    setMessage('');
    const text = [souvenir.titre, souvenir.contenu].filter(Boolean).join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: souvenir.titre, text });
      } catch (shareError) {
        if (shareError.name !== 'AbortError') setError(shareError.message);
      }
      return;
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setMessage('Le récit a été copié. Partagez-le uniquement avec les personnes de confiance.');
      } catch (shareError) {
        setShareText(text);
        setError(`Impossible de copier automatiquement le récit : ${shareError.message}`);
      }
      return;
    }
    setShareText(text);
  };

  return (
    <div className="griot-memory-interactions">
      <div className="griot-memory-actions">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
          {open ? 'Masquer les échanges' : `Échanges et médias (${(souvenir._count?.commentaires || 0) + mediaList.length})`}
        </button>
        <button type="button" onClick={shareSouvenir}>Partager le récit</button>
      </div>
      {message && <p className="griot-memory-feedback" role="status">{message}</p>}
      {shareText && (
        <label className="griot-memory-share-copy">
          Copiez le récit à partager
          <textarea readOnly value={shareText} onFocus={(event) => event.target.select()} />
        </label>
      )}
      {open && (
        <section className="griot-memory-interaction-panel" aria-label={`Médias et commentaires de ${souvenir.titre}`}>
          {error && <p className="griot-inline-error" role="alert">{error}</p>}
          {loading ? <p className="griot-muted" role="status">Chargement des médias et commentaires…</p> : (
            <>
              {media.length > 0 && (
                <div className="griot-memory-media-list">
                  {media.map((item) => (
                    <article key={item.id}>
                      {item.error ? <p className="griot-inline-error" role="alert">{item.error}</p> : (
                        <>
                          <span>{mediaLabel(item.type)}</span>
                          {item.type === 'audio' && <audio controls preload="metadata" src={item.url}>Votre navigateur ne prend pas en charge la lecture audio.</audio>}
                          {item.type === 'video' && <video controls preload="metadata" src={item.url}>Votre navigateur ne prend pas en charge la lecture vidéo.</video>}
                          {item.type === 'photo' && <img src={item.url} alt={`Illustration de ${souvenir.titre}`} />}
                          {item.type === 'document' && <a href={item.url} target="_blank" rel="noreferrer">Ouvrir le document</a>}
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
              <div className="griot-memory-comments">
                <h4>Commentaires ({comments.length})</h4>
                {comments.length === 0 ? <p className="griot-muted">Aucun commentaire pour le moment.</p> : (
                  <ul>
                    {comments.map((comment) => (
                      <li key={comment.id}>
                        <div><strong>{comment.auteur.prenom} {comment.auteur.nom}</strong><time dateTime={comment.dateCreation}>{new Date(comment.dateCreation).toLocaleDateString('fr-FR')}</time></div>
                        <p>{comment.contenu}</p>
                        {(comment.auteurId === userId || ['admin', 'editeur'].includes(role)) && (
                          <button type="button" onClick={() => deleteComment(comment.id)}>Supprimer</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {canComment ? (
                  <form onSubmit={addComment}>
                    <label className="sr-only" htmlFor={`memory-comment-${souvenir.id}`}>Ajouter un commentaire</label>
                    <textarea
                      id={`memory-comment-${souvenir.id}`}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      maxLength={2000}
                      required
                      placeholder="Ajouter un commentaire…"
                    />
                    <button className="griot-button griot-button-primary" disabled={saving}>{saving ? 'Envoi…' : 'Commenter'}</button>
                  </form>
                ) : <p className="griot-muted">Votre rôle ne permet pas de commenter ce souvenir.</p>}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
