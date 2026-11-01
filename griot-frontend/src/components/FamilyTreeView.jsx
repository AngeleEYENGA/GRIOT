import { useMemo, useState } from 'react';
import { getGenealogyEdge, getRelationLabel } from '../utils/familyRelations';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 106;
const NODE_GAP = 48;
const GENERATION_GAP = 210;

function getGenerations(personnes, relations) {
  const childrenByParent = new Map();
  const parentIds = new Set();
  const personIds = new Set(personnes.map((person) => person.id));

  relations.forEach((relation) => {
    const edge = getGenealogyEdge(relation.typeRelation, relation.personneId1, relation.personneId2);
    if (!edge || edge.isSpouse) return;
    const parentId = edge?.parentId;
    const childId = edge?.childId;

    if (parentId && childId && personIds.has(parentId) && personIds.has(childId)) {
      const children = childrenByParent.get(parentId) || [];
      children.push({ childId, generationDistance: edge.generationDistance });
      childrenByParent.set(parentId, children);
      parentIds.add(childId);
    }
  });

  const generations = new Map();
  const assignDescendants = (rootId) => {
    const queue = [rootId];
    for (let index = 0; index < queue.length; index += 1) {
      const personId = queue[index];
      (childrenByParent.get(personId) || []).forEach(({ childId, generationDistance }) => {
        if (!generations.has(childId)) {
          generations.set(childId, generations.get(personId) + generationDistance);
          queue.push(childId);
        }
      });
    }
  };

  personnes
    .filter((person) => !parentIds.has(person.id))
    .forEach((root) => {
      if (!generations.has(root.id)) {
        generations.set(root.id, 0);
        assignDescendants(root.id);
      }
    });

  personnes.forEach((person) => {
    if (!generations.has(person.id)) {
      generations.set(person.id, 0);
      assignDescendants(person.id);
    }
  });

  return generations;
}

export default function FamilyTreeView({ personnes, relations, onOpenProfile }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [focusPersonId, setFocusPersonId] = useState('');
  const [zoom, setZoom] = useState(1);
  const generations = useMemo(
    () => getGenerations(personnes, relations),
    [personnes, relations],
  );
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
  const layout = useMemo(() => {
    const rows = new Map();
    visiblePeople.forEach((person) => {
      const generation = generations.get(person.id) || 0;
      const row = rows.get(generation) || [];
      row.push(person);
      rows.set(generation, row);
    });

    rows.forEach((row) => {
      row.sort((first, second) => (
        `${first.prenom} ${first.nom}`.localeCompare(`${second.prenom} ${second.nom}`, 'fr')
      ));
    });

    const rowWidths = [...rows.values()].map((row) => (
      row.length * NODE_WIDTH + Math.max(0, row.length - 1) * NODE_GAP
    ));
    const width = Math.max(760, ...rowWidths) + 48;
    const height = Math.max(170, (Math.max(0, ...rows.keys()) + 1) * GENERATION_GAP + 24);
    const positions = new Map();

    rows.forEach((row, generation) => {
      const rowWidth = row.length * NODE_WIDTH + Math.max(0, row.length - 1) * NODE_GAP;
      const startX = (width - rowWidth) / 2;
      row.forEach((person, index) => {
        positions.set(person.id, {
          x: startX + index * (NODE_WIDTH + NODE_GAP),
          y: 20 + generation * GENERATION_GAP,
        });
      });
    });

    return { rows, positions, width, height };
  }, [generations, visiblePeople]);
  const visibleIds = useMemo(
    () => new Set(visiblePeople.map((person) => person.id)),
    [visiblePeople],
  );
  const visibleRelations = relations.filter((relation) => (
    visibleIds.has(relation.personneId1) && visibleIds.has(relation.personneId2)
  ));

  return (
    <section className="griot-family-tree" aria-labelledby="genealogy-title">
      <div className="griot-family-tree-heading">
        <div>
          <h2 id="genealogy-title">Arbre généalogique</h2>
          <p>
            {visiblePeople.length} personne{visiblePeople.length !== 1 ? 's' : ''} affichée{visiblePeople.length !== 1 ? 's' : ''} sur {personnes.length}
          </p>
        </div>
        <div className="griot-family-tree-zoom">
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
                {visibleRelations.map((relation) => {
                  const edge = getGenealogyEdge(relation.typeRelation, relation.personneId1, relation.personneId2);
                  const firstPosition = layout.positions.get(relation.personneId1);
                  const secondPosition = layout.positions.get(relation.personneId2);
                  if (!firstPosition || !secondPosition) return null;

                  if (!edge) {
                    const sameGeneration = firstPosition.y === secondPosition.y;
                    const firstIsLeft = firstPosition.x <= secondPosition.x;
                    const startX = sameGeneration
                      ? firstPosition.x + (firstIsLeft ? NODE_WIDTH : 0)
                      : firstPosition.x + NODE_WIDTH / 2;
                    const startY = sameGeneration
                      ? firstPosition.y + NODE_HEIGHT / 2
                      : firstPosition.y + (firstPosition.y < secondPosition.y ? NODE_HEIGHT : 0);
                    const endX = sameGeneration
                      ? secondPosition.x + (firstIsLeft ? 0 : NODE_WIDTH)
                      : secondPosition.x + NODE_WIDTH / 2;
                    const endY = sameGeneration
                      ? secondPosition.y + NODE_HEIGHT / 2
                      : secondPosition.y + (secondPosition.y < firstPosition.y ? NODE_HEIGHT : 0);
                    const curveY = (startY + endY) / 2;
                    return (
                      <g key={relation.id}>
                        <path
                          d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${curveY}, ${endX} ${endY}`}
                          fill="none"
                          stroke="var(--griot-terracotta)"
                          strokeDasharray="5 5"
                          strokeWidth="1.5"
                        />
                        <text
                          x={(startX + endX) / 2}
                          y={curveY - 5}
                          textAnchor="middle"
                          fill="var(--griot-terracotta-deep)"
                          fontSize="11"
                        >
                          {getRelationLabel(relation.typeRelation, relation.precision)}
                        </text>
                      </g>
                    );
                  }

                  const isSpouse = edge.isSpouse;
                  const spouseLeft = firstPosition.x <= secondPosition.x ? firstPosition : secondPosition;
                  const spouseRight = firstPosition.x <= secondPosition.x ? secondPosition : firstPosition;
                  const parentPosition = layout.positions.get(edge.parentId);
                  const childPosition = layout.positions.get(edge.childId);
                  const startX = isSpouse ? spouseLeft.x + NODE_WIDTH : parentPosition.x + NODE_WIDTH / 2;
                  const startY = isSpouse
                    ? spouseLeft.y + NODE_HEIGHT / 2
                    : parentPosition.y + NODE_HEIGHT;
                  const endX = isSpouse ? spouseRight.x : childPosition.x + NODE_WIDTH / 2;
                  const endY = isSpouse ? spouseRight.y + NODE_HEIGHT / 2 : childPosition.y;
                  const curveY = (startY + endY) / 2;

                  return (
                    <g key={relation.id}>
                      <path
                        d={`M ${startX} ${startY} C ${startX} ${curveY}, ${endX} ${curveY}, ${endX} ${endY}`}
                        fill="none"
                        stroke="var(--griot-gold)"
                        strokeWidth="2"
                      />
                      <text
                        x={(startX + endX) / 2}
                        y={curveY - 5}
                        textAnchor="middle"
                        fill="var(--griot-ink-soft)"
                        fontSize="12"
                      >
                        {getRelationLabel(relation.typeRelation, relation.precision)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {[...layout.rows.entries()].map(([generation, row]) => (
                <div
                  key={generation}
                  className="griot-family-tree-generation"
                  style={{ top: 20 + generation * GENERATION_GAP }}
                >
                  {row.map((person) => {
                    const initials = `${person.prenom?.[0] || ''}${person.nom?.[0] || ''}`.toLocaleUpperCase('fr');
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => onOpenProfile(person)}
                        aria-label={`Ouvrir le profil de ${person.prenom} ${person.nom}`}
                        className="griot-family-tree-node"
                        style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
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
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
