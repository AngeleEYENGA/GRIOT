export const relationGroups = [
  {
    label: 'Parents et enfants',
    options: [
      { value: 'parent', label: 'Parent (lien non précisé)', phrase: 'est parent de', inverse: 'enfant de', graph: 'parent' },
      { value: 'pere', label: 'Père', phrase: 'est le père de', inverse: 'enfant de', graph: 'parent' },
      { value: 'mere', label: 'Mère', phrase: 'est la mère de', inverse: 'enfant de', graph: 'parent' },
      { value: 'enfant', label: 'Enfant (lien non précisé)', phrase: 'est enfant de', inverse: 'parent de', graph: 'child' },
      { value: 'fils', label: 'Fils', phrase: 'est le fils de', inverse: 'parent de', graph: 'child' },
      { value: 'fille', label: 'Fille', phrase: 'est la fille de', inverse: 'parent de', graph: 'child' },
    ],
  },
  {
    label: 'Fratrie',
    options: [
      { value: 'frere', label: 'Frère', phrase: 'est le frère de', inverse: 'fratrie de' },
      { value: 'soeur', label: 'Sœur', phrase: 'est la sœur de', inverse: 'fratrie de' },
      { value: 'demi_frere', label: 'Demi-frère', phrase: 'est le demi-frère de', inverse: 'demi-fratrie de' },
      { value: 'demi_soeur', label: 'Demi-sœur', phrase: 'est la demi-sœur de', inverse: 'demi-fratrie de' },
    ],
  },
  {
    label: 'Grands-parents et petits-enfants',
    options: [
      { value: 'grand_pere', label: 'Grand-père', phrase: 'est le grand-père de', inverse: 'petit-enfant de' },
      { value: 'grand_mere', label: 'Grand-mère', phrase: 'est la grand-mère de', inverse: 'petit-enfant de' },
      { value: 'petit_fils', label: 'Petit-fils', phrase: 'est le petit-fils de', inverse: 'grand-parent de' },
      { value: 'petite_fille', label: 'Petite-fille', phrase: 'est la petite-fille de', inverse: 'grand-parent de' },
      { value: 'arriere_grand_pere', label: 'Arrière-grand-père', phrase: 'est l’arrière-grand-père de', inverse: 'arrière-petit-enfant de' },
      { value: 'arriere_grand_mere', label: 'Arrière-grand-mère', phrase: 'est l’arrière-grand-mère de', inverse: 'arrière-petit-enfant de' },
      { value: 'arriere_petit_fils', label: 'Arrière-petit-fils', phrase: 'est l’arrière-petit-fils de', inverse: 'arrière-grand-parent de' },
      { value: 'arriere_petite_fille', label: 'Arrière-petite-fille', phrase: 'est l’arrière-petite-fille de', inverse: 'arrière-grand-parent de' },
    ],
  },
  {
    label: 'Oncles, tantes et cousins',
    options: [
      { value: 'oncle_maternel', label: 'Oncle maternel', phrase: 'est l’oncle maternel de', inverse: 'neveu ou nièce de' },
      { value: 'oncle_paternel', label: 'Oncle paternel', phrase: 'est l’oncle paternel de', inverse: 'neveu ou nièce de' },
      { value: 'tante_maternelle', label: 'Tante maternelle', phrase: 'est la tante maternelle de', inverse: 'neveu ou nièce de' },
      { value: 'tante_paternelle', label: 'Tante paternelle', phrase: 'est la tante paternelle de', inverse: 'neveu ou nièce de' },
      { value: 'neveu', label: 'Neveu', phrase: 'est le neveu de', inverse: 'oncle ou tante de' },
      { value: 'niece', label: 'Nièce', phrase: 'est la nièce de', inverse: 'oncle ou tante de' },
      { value: 'cousin', label: 'Cousin', phrase: 'est le cousin de', inverse: 'cousinage avec' },
      { value: 'cousine', label: 'Cousine', phrase: 'est la cousine de', inverse: 'cousinage avec' },
    ],
  },
  {
    label: 'Alliance et autres',
    options: [
      { value: 'conjoint', label: 'Conjoint·e', phrase: 'est le/la conjoint·e de', inverse: 'conjoint·e de', graph: 'spouse' },
      { value: 'beau_pere', label: 'Beau-père', phrase: 'est le beau-père de', inverse: 'belle-famille de' },
      { value: 'belle_mere', label: 'Belle-mère', phrase: 'est la belle-mère de', inverse: 'belle-famille de' },
      { value: 'beau_fils', label: 'Beau-fils', phrase: 'est le beau-fils de', inverse: 'belle-famille de' },
      { value: 'belle_fille', label: 'Belle-fille', phrase: 'est la belle-fille de', inverse: 'belle-famille de' },
      { value: 'beau_frere', label: 'Beau-frère', phrase: 'est le beau-frère de', inverse: 'belle-famille de' },
      { value: 'belle_soeur', label: 'Belle-sœur', phrase: 'est la belle-sœur de', inverse: 'belle-famille de' },
      { value: 'autre', label: 'Autre lien…', phrase: '', inverse: 'lien personnalisé avec' },
    ],
  },
];

const relationsByValue = new Map(
  relationGroups.flatMap((group) => group.options).map((option) => [option.value, option]),
);

export function getRelationDescription(type, precision) {
  if (type === 'autre') return `a le lien « ${precision || 'personnalisé'} » avec`;
  return relationsByValue.get(type)?.phrase || 'est lié(e) à';
}

export function getInverseRelationDescription(type, precision) {
  if (type === 'autre') return `a le lien « ${precision || 'personnalisé'} » avec`;
  return relationsByValue.get(type)?.inverse || 'lien familial avec';
}

export function getGenealogyEdge(type, personneId1, personneId2) {
  const graph = relationsByValue.get(type)?.graph;
  if (graph === 'parent') return { parentId: personneId1, childId: personneId2, generationDistance: 1, isSpouse: false };
  if (graph === 'child') return { parentId: personneId2, childId: personneId1, generationDistance: 1, isSpouse: false };
  if (type === 'grand_pere' || type === 'grand_mere') {
    return { parentId: personneId1, childId: personneId2, generationDistance: 2, isSpouse: false };
  }
  if (type === 'petit_fils' || type === 'petite_fille') {
    return { parentId: personneId2, childId: personneId1, generationDistance: 2, isSpouse: false };
  }
  if (type === 'arriere_grand_pere' || type === 'arriere_grand_mere') {
    return { parentId: personneId1, childId: personneId2, generationDistance: 3, isSpouse: false };
  }
  if (type === 'arriere_petit_fils' || type === 'arriere_petite_fille') {
    return { parentId: personneId2, childId: personneId1, generationDistance: 3, isSpouse: false };
  }
  if (graph === 'spouse') return { parentId: personneId1, childId: personneId2, generationDistance: 0, isSpouse: true };
  return null;
}

export function getRelationLabel(type, precision) {
  if (type === 'autre' && precision) return precision;
  return relationsByValue.get(type)?.label || type;
}
