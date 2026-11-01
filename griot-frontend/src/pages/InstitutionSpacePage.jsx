import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const initialStatistics = {
  population: 0,
  villages: 0,
  documents: 0,
  arbresSuivis: 0,
  preuvesEnAttente: 0,
};

export default function InstitutionSpacePage() {
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState('');

  const loadSpace = useCallback(async () => {
    setError('');
    try {
      setSpace(await api.getInstitutionSpace());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpace();
  }, [loadSpace]);

  const acceptInvitation = async (institution) => {
    setProcessingId(institution.membreId);
    setError('');
    try {
      await api.acceptInstitutionInvite(institution.id, institution.membreId);
      await loadSpace();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingId('');
    }
  };

  const reviewProof = async (institutionId, proofId, status) => {
    setProcessingId(proofId);
    setError('');
    try {
      await api.reviewInstitutionProof(institutionId, proofId, status);
      await loadSpace();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingId('');
    }
  };

  const memberships = space?.institutions || [];
  const statistics = space?.statistiques || initialStatistics;
  const activeMemberships = memberships.filter((institution) => institution.statut === 'actif');
  const invitations = memberships.filter((institution) => institution.statut === 'invite');
  const pendingProofs = space?.preuvesEnAttente || [];

  return (
    <div className="griot-institution-space">
      <header className="griot-institution-heading">
        <p className="griot-eyebrow">GOUVERNANCE INSTITUTIONNELLE</p>
        <h1>Espace chefferie</h1>
        <p>Consultez les arbres qui vous sont confiés et validez les preuves soumises à vos institutions.</p>
      </header>

      {error && <p className="griot-inline-error" role="alert">{error}</p>}
      {loading ? (
        <div className="griot-trees-loading" role="status" aria-label="Chargement de l’espace institutionnel"><span /></div>
      ) : memberships.length === 0 ? (
        <section className="griot-institution-empty">
          <span aria-hidden="true">⌂</span>
          <h2>Aucun accès institutionnel</h2>
          <p>Un administrateur d’arbre doit associer votre compte à une institution avant que vous puissiez consulter ou valider ses dossiers.</p>
        </section>
      ) : (
        <>
          {invitations.length > 0 && (
            <section className="griot-institution-invitations" aria-labelledby="institution-invitations-title">
              <h2 id="institution-invitations-title">Invitations reçues</h2>
              {invitations.map((institution) => (
                <article key={institution.id}>
                  <div><strong>{institution.nom}</strong><span>{institution.arbreNom} · {institution.role}</span></div>
                  <button
                    className="griot-button griot-button-primary"
                    disabled={processingId === institution.membreId}
                    onClick={() => acceptInvitation(institution)}
                  >{processingId === institution.membreId ? 'Acceptation…' : 'Accepter'}</button>
                </article>
              ))}
            </section>
          )}

          {activeMemberships.length > 0 && (
            <>
              <section className="griot-institution-stat-grid" aria-label="Statistiques des arbres confiés">
                <article><span>POPULATION ENREGISTRÉE</span><strong>{statistics.population.toLocaleString('fr-FR')}</strong><small>Personnes documentées</small></article>
                <article><span>VILLAGES ASSOCIÉS</span><strong>{statistics.villages.toLocaleString('fr-FR')}</strong><small>Origines renseignées</small></article>
                <article><span>DOCUMENTS</span><strong>{statistics.documents.toLocaleString('fr-FR')}</strong><small>Archives déposées</small></article>
                <article><span>ARBRES SUIVIS</span><strong>{statistics.arbresSuivis.toLocaleString('fr-FR')}</strong><small>Espaces autorisés</small></article>
              </section>

              <section className="griot-institution-panel">
                <header className="griot-institution-panel-heading">
                  <div><p className="griot-eyebrow">REVUE INSTITUTIONNELLE</p><h2>Preuves en attente de validation</h2></div>
                  <span>{statistics.preuvesEnAttente}</span>
                </header>
                {pendingProofs.length === 0 ? (
                  <div className="griot-institution-empty is-compact">
                    <h3>La file de validation est à jour</h3>
                    <p>Les nouvelles preuves apparaîtront ici après leur soumission par les familles.</p>
                  </div>
                ) : (
                  <div className="griot-institution-proof-list">
                    {pendingProofs.map((proof) => {
                      const arbreId = proof.personne?.arbre?.id || proof.souvenir?.arbre?.id;
                      const institution = activeMemberships.find((item) => item.arbreId === arbreId);
                      const canReview = institution && ['administrateur', 'validateur'].includes(institution.role);
                      return (
                        <article key={proof.id}>
                          <div>
                            <span className="griot-institution-tree-name">{proof.personne?.arbre?.nom || proof.souvenir?.arbre?.nom}</span>
                            <h3>{proof.type}</h3>
                            <p>{proof.personne ? `${proof.personne.prenom} ${proof.personne.nom}` : proof.souvenir?.titre} · {proof.auteur.prenom} {proof.auteur.nom}</p>
                          </div>
                          {proof.urlDocument && <a href={proof.urlDocument} target="_blank" rel="noreferrer">Consulter la source</a>}
                          {canReview && (
                            <div className="griot-institution-proof-actions">
                              <button disabled={processingId === proof.id} onClick={() => reviewProof(institution.id, proof.id, 'validee')}>Valider</button>
                              <button disabled={processingId === proof.id} onClick={() => reviewProof(institution.id, proof.id, 'rejetee')}>Rejeter</button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="griot-institution-panel">
                <header className="griot-institution-panel-heading"><div><p className="griot-eyebrow">VOS ACCÈS</p><h2>Institutions associées</h2></div></header>
                <div className="griot-institution-memberships">
                  {activeMemberships.map((institution) => (
                    <article key={institution.id}>
                      <span className="griot-institution-mark" aria-hidden="true">⌂</span>
                      <div><strong>{institution.nom}</strong><span>{institution.arbreNom} · {institution.type}</span></div>
                      <small>{institution.role}</small>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
