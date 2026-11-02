import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const cultureThemes = { discussion: 'Discussion', langue: 'Langues', conte: 'Contes & anecdotes', cuisine: 'Cuisine', tradition: 'Traditions', migration: 'Parcours & histoire' };
export default function FamilySalon({ treeId, user, role, initialMessage = '', initialTheme = 'discussion', onDraft }) {
  const [posts, setPosts] = useState([]); const [cursor, setCursor] = useState(null);
  const [content, setContent] = useState(initialMessage); const [theme, setTheme] = useState(initialTheme);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState({}); const [reply, setReply] = useState({}); const [filter, setFilter] = useState('');
  const canWrite = ['admin', 'editeur', 'contributeur'].includes(role);
  const load = useCallback(async (next) => {
    setError(''); setLoading(true);
    try { const data = await api.getCulturePosts(treeId, next ? { cursor: next } : {}); setPosts((old) => next ? [...old, ...data.items] : data.items); setCursor(data.nextCursor); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [treeId]);
  useEffect(() => { load(); }, [load]);
  const openThread = async (id, next) => {
    setError('');
    try { const data = await api.getCulturePosts(treeId, { parentId: id, ...(next ? { cursor: next } : {}) }); setThreads((old) => ({ ...old, [id]: { ...data, items: next ? [...old[id].items, ...data.items] : data.items } })); } catch (e) { setError(e.message); }
  };
  const publish = async (event, parentId) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api.createCulturePost(treeId, { contenu: parentId ? reply[parentId] : content, theme: parentId ? posts.find((post) => post.id === parentId).theme : theme, ...(parentId ? { parentId } : {}) });
      if (parentId) { setReply({ ...reply, [parentId]: '' }); await openThread(parentId); } else { setContent(''); onDraft?.('', theme); }
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const remove = async (post, parentId) => {
    if (!confirm(parentId ? 'Supprimer cette réponse ?' : 'Supprimer ce message et ses réponses ?')) return;
    setBusy(true);
    try { await api.deleteCulturePost(treeId, post.id); if (parentId) await openThread(parentId); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const message = (post, parentId) => <article key={post.id} className={parentId ? 'griot-culture-reply' : 'griot-culture-post'}><header><span className="griot-culture-initials" aria-hidden="true">{post.auteur?.prenom?.[0]}{post.auteur?.nom?.[0]}</span><div><strong>{post.auteur?.prenom} {post.auteur?.nom}</strong><small>{new Date(post.dateCreation).toLocaleString('fr-FR')} · {cultureThemes[post.theme]}</small></div>{(post.auteurId === user.id || ['admin', 'editeur'].includes(role)) && <button disabled={busy} className="griot-culture-text-button" onClick={() => remove(post, parentId)}>Supprimer</button>}</header><p className="griot-culture-message">{post.contenu}</p>{!parentId && <><button className="griot-culture-text-button" onClick={() => threads[post.id] ? setThreads({ ...threads, [post.id]: null }) : openThread(post.id)}>{threads[post.id] ? 'Fermer les réponses' : `Réponses (${post._count?.reponses || 0})`}</button>{threads[post.id] && <div className="griot-culture-thread">{[...threads[post.id].items].reverse().map((item) => message(item, post.id))}{threads[post.id].nextCursor && <button className="griot-button griot-button-outline" onClick={() => openThread(post.id, threads[post.id].nextCursor)}>Réponses précédentes</button>}{canWrite && <form onSubmit={(event) => publish(event, post.id)}><label>Votre réponse<textarea required maxLength={4000} value={reply[post.id] || ''} onChange={(event) => setReply({ ...reply, [post.id]: event.target.value })} /></label><button disabled={busy || !reply[post.id]?.trim()} className="griot-button griot-button-primary">Répondre</button></form>}</div>}</>}</article>;
  return <div className="griot-culture-salon"><div className="griot-culture-section-title"><div><h3>Le salon de la famille</h3><p>Une recette, un mot, une question à un aîné… Faites vivre la mémoire ensemble.</p></div><button className="griot-button griot-button-outline" disabled={loading} onClick={() => load()}>Actualiser</button></div><p className="griot-culture-note">Espace réservé aux membres de cet arbre. Pour les enfants, privilégiez une utilisation accompagnée par un adulte. Les messages sont chargés à l’ouverture et avec « Actualiser ».</p>{error && <p role="alert" className="griot-culture-error">{error}</p>}{canWrite ? <form className="griot-culture-composer" onSubmit={(event) => publish(event)}><label>Partager avec la famille<textarea required maxLength={4000} value={content} onChange={(event) => { setContent(event.target.value); onDraft?.(event.target.value, theme); }} placeholder="Comment disait-on bonjour chez nous ? Qui se souvient de ce conte ?" /></label><div><label>Thème<select value={theme} onChange={(event) => { setTheme(event.target.value); onDraft?.(content, event.target.value); }}>{Object.entries(cultureThemes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="griot-button griot-button-primary" disabled={busy || !content.trim()}>Publier dans la famille</button></div></form> : <p className="griot-culture-note">Votre rôle permet de lire les échanges. Un responsable peut vous accorder le rôle de contributeur.</p>}<label className="griot-culture-filter">Afficher<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Tous les thèmes</option>{Object.entries(cultureThemes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>{loading && !posts.length && <p role="status">Chargement du salon…</p>}{!loading && !posts.length && !error && <div className="griot-culture-empty"><h4>La première histoire commence avec vous</h4><p>Invitez un proche à raconter un souvenir, partager une expression ou expliquer une tradition.</p></div>}{posts.filter((post) => !filter || post.theme === filter).map((post) => message(post))}{cursor && <button disabled={loading} className="griot-button griot-button-outline" onClick={() => load(cursor)}>Messages plus anciens</button>}</div>;
}
