import { useMemo, useState } from 'react';
import { getGenealogyEdge } from '../utils/familyRelations';
import { printSection } from '../utils/exports';
import { buildTreeLayout, NODE_WIDTH, NODE_HEIGHT } from '../utils/treeLayout';
import DocumentBrand from './DocumentBrand';

export default function FamilyTreeView({ personnes, relations, onOpenProfile, treeName }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [focusPersonId, setFocusPersonId] = useState('');
  const [zoom, setZoom] = useState(1);
  const relatedIds = useMemo(() => new Set(
    relations.flatMap((relation) => [relation.personneId1, relation.personneId2]),
  ), [relations]);
  const branchIds = useMemo(() => {
    if (!['ancestors', 'descendants'].includes(filter)) return null;
    const visibleBranch = new Set();
    if (!focusPersonId) return visibleBranch;

    const pending = [focusPersonId];
    visibleBranch.add(focusPersonId);
    for (let index = 0; index < pending.length; index += 1) {
      const currentId = pending[index];
      relations.forEach((relation) => {
        const edge = getGenealogyEdge(relation.typeRelation, relation.personneId1, relation.personneId2);
        if (!edge || edge.isSpouse) return;
        const parentId = edge?.parentId;
        const childId = edge?.childId;
        const nextId = filter === 'ancestors' && childId === currentId
          ? parentId
          : filter === 'descendants' && parentId === currentId
            ? childId
            : null;
        if (nextId && !visibleBranch.has(nextId)) {
          visibleBranch.add(nextId);
          pending.push(nextId);
        }
      });
    }
    return visibleBranch;
  }, [filter, focusPersonId, relations]);
  const visiblePeople = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    let matchingIds = null;
    if (normalizedQuery) {
      matchingIds = new Set();
      personnes.forEach((person) => {
        const searchableText = [
          person.prenom,
          person.nom,
          person.villageOrigine,
          person.biographie,
        ].filter(Boolean).join(' ').toLocaleLowerCase('fr');
        if (searchableText.includes(normalizedQuery)) matchingIds.add(person.id);
      });
      relations.forEach((relation) => {
        if (matchingIds.has(relation.personneId1)) matchingIds.add(relation.personneId2);
        if (matchingIds.has(relation.personneId2)) matchingIds.add(relation.personneId1);
      });
    }

    return personnes.filter((person) => {
      if (matchingIds && !matchingIds.has(person.id)) return false;
      if (branchIds && !branchIds.has(person.id)) return false;
      if (filter === 'linked') return relatedIds.has(person.id);
      if (filter === 'unlinked') return !relatedIds.has(person.id);
      if (filter === 'deceased') return Boolean(person.dateDeces);
      return true;
    });
  }, [branchIds, filter, personnes, query, relatedIds, relations]);
  const layout = useMemo(() => buildTreeLayout(visiblePeople, relations), [visiblePeople, relations]);

  return (
    <section className="griot-family-tree" aria-labelledby="genealogy-title" style={{ '--tree-print-scale': Math.min(1, 980 / layout.width, 500 / layout.height), '--tree-print-height': `${layout.height * Math.min(1, 980 / layout.width, 500 / layout.height)}px` }}>
      <div className="griot-print-tree-title"><DocumentBrand title={treeName || 'Arbre familial'} subtitle={`Arbre généalogique · ${visiblePeople.length} personnes affichées · ${new Date().toLocaleDateString('fr-FR')}`} /></div>
      <div className="griot-family-tree-heading">
        <div>
          <h2 id="genealogy-title">Arbre généalogique</h2>
          <p>
            {visiblePeople.length} personne{visiblePeople.length !== 1 ? 's' : ''} affichée{visiblePeople.length !== 1 ? 's' : ''} sur {personnes.length}
          </p>
        </div>
        <div className="griot-family-tree-zoom">
          <button type="button" className="griot-print-tree-button" onClick={() => printSection('tree')}>Imprimer</button>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.65, current - 0.15))}
            disabled={zoom <= 0.65}
            aria-label="Dézoomer l’arbre"
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(1.6, current + 0.15))}
            disabled={zoom >= 1.6}
            aria-label="Zoomer l’arbre"
          >
            +
          </button>
        </div>
      </div>

      <p className="griot-tree-legend">Conjoints rapprochés · Une branche commune pour leurs enfants. Les autres liens restent consultables dans les profils et dans Relations familiales.</p>
      <div className={`griot-family-tree-filters${branchIds ? ' has-branch-filter' : ''}`}>
        <label className="sr-only" htmlFor="genealogy-search">Rechercher une personne</label>
        <input
          id="genealogy-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher par nom, village ou biographie"
        />
        <label className="sr-only" htmlFor="genealogy-filter">Filtrer les personnes</label>
        <select
          id="genealogy-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">Toutes les personnes</option>
          <option value="linked">Avec un lien familial</option>
          <option value="unlinked">Sans lien familial</option>
          <option value="deceased">Personnes décédées</option>
          <option value="ancestors">Branche des ancêtres</option>
          <option value="descendants">Branche des descendants</option>
        </select>
        {branchIds && (
          <>
            <label className="sr-only" htmlFor="genealogy-focus-person">Personne de référence</label>
            <select id="genealogy-focus-person" value={focusPersonId} onChange={(event) => setFocusPersonId(event.target.value)}>
              <option value="">Choisir une personne de référence</option>
              {personnes.map((person) => <option key={person.id} value={person.id}>{person.prenom} {person.nom}</option>)}
            </select>
          </>
        )}
      </div>

      {visiblePeople.length === 0 ? (
        <div className="griot-family-tree-empty">
          <p>
            {personnes.length === 0
              ? 'Ajoutez des personnes pour construire l’arbre.'
              : branchIds && !focusPersonId
                ? 'Choisissez une personne de référence pour afficher sa branche familiale.'
              : 'Aucune personne ne correspond à ces critères.'}
          </p>
        </div>
      ) : (
        <div className="griot-family-tree-canvas">
          <div
            className="relative"
            style={{ width: layout.width * zoom, height: layout.height * zoom }}
          >
            <div
              className="griot-family-tree-layer"
              style={{
                width: layout.width,
                height: layout.height,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              <svg
                aria-hidden="true"
                className="griot-family-tree-links"
                width={layout.width}
                height={layout.height}
              >
                {layout.paths.map((path, index) => <path key={index} d={path.d} fill="none" stroke="var(--griot-gold)" strokeWidth={path.kind === 'spouse' ? 3 : 1.8} strokeDasharray={path.kind === 'ancestor' ? '5 5' : undefined}><title>{path.label}</title></path>)}
              </svg>
              <div className="griot-family-tree-people">
                  {visiblePeople.map((person) => {
                    const initials = `${person.prenom?.[0] || ''}${person.nom?.[0] || ''}`.toLocaleUpperCase('fr');
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => onOpenProfile(person)}
                        aria-label={`Ouvrir le profil de ${person.prenom} ${person.nom}`}
                        className="griot-family-tree-node"
                        style={{ position: 'absolute', left: layout.positions.get(person.id).x, top: layout.positions.get(person.id).y, width: NODE_WIDTH, height: NODE_HEIGHT }}
                      >
                        <span className="griot-family-tree-avatar">
                          {initials}
                        </span>
                        <span className="griot-family-tree-person">
                          <span className="griot-family-tree-name">
                            {person.prenom} {person.nom}
                          </span>
                          <span className="griot-family-tree-origin">
                            {person.villageOrigine || (person.dateNaissance
                              ? new Date(person.dateNaissance).getFullYear()
                              : 'Profil à compléter')}
                          </span>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
      <footer className="griot-tree-print-footer"><DocumentBrand footer /></footer>
    </section>
  );
}
