import { getGenealogyEdge, getRelationLabel } from './familyRelations.js';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 106;
export const GENERATION_GAP = 210;

// Work on display units only: no relation in the family record is changed.
export function buildTreeLayout(people, relations) {
  const ids = new Set(people.map((person) => person.id));
  const representative = new Map(people.map((person) => [person.id, person.id]));
  const root = (id) => {
    while (representative.get(id) !== id) id = representative.get(id);
    return id;
  };
  const spouses = [];
  const parents = [];
  const seen = new Set();
  relations.forEach((relation) => {
    if (!ids.has(relation.personneId1) || !ids.has(relation.personneId2) || relation.personneId1 === relation.personneId2) return;
    const edge = getGenealogyEdge(relation.typeRelation, relation.personneId1, relation.personneId2);
    if (!edge) return;
    const key = edge.isSpouse ? `s:${[edge.parentId, edge.childId].sort().join(':')}` : `p:${edge.parentId}:${edge.childId}:${edge.generationDistance}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (edge.isSpouse) {
      spouses.push({ ...edge, relation });
      representative.set(root(edge.childId), root(edge.parentId));
    } else parents.push(edge);
  });
  const units = new Map();
  people.forEach((person) => {
    const key = root(person.id);
    if (!units.has(key)) units.set(key, { id: key, people: [], generation: 0 });
    units.get(key).people.push(person);
  });
  // Topological generations keep partners together even when only one has known ancestors.
  const incoming = new Map([...units.keys()].map((id) => [id, new Map()]));
  parents.forEach((edge) => {
    const from = root(edge.parentId); const to = root(edge.childId);
    if (from !== to) incoming.get(to).set(from, Math.max(incoming.get(to).get(from) || 0, edge.generationDistance));
  });
  const pending = new Set(units.keys());
  while (pending.size) {
    const ready = [...pending].filter((id) => [...incoming.get(id).keys()].every((parent) => !pending.has(parent)));
    if (!ready.length) break; // Invalid cycles stay visible without an infinite traversal.
    ready.forEach((id) => {
      units.get(id).generation = Math.max(0, ...[...incoming.get(id)].map(([parent, distance]) => units.get(parent).generation + distance));
      pending.delete(id);
    });
  }
  const rows = new Map();
  [...units.values()].forEach((unit) => {
    const row = rows.get(unit.generation) || [];
    row.push(unit); rows.set(unit.generation, row);
  });
  const positions = new Map();
  const unitWidth = (unit) => unit.people.length * NODE_WIDTH + (unit.people.length - 1) * 28;
  const rowWidth = (row) => row.reduce((sum, unit) => sum + unitWidth(unit), 0) + Math.max(0, row.length - 1) * 88;
  const width = Math.max(760, ...[...rows.values()].map(rowWidth)) + 48;
  [...rows.keys()].sort((a, b) => a - b).forEach((generation) => {
    const row = rows.get(generation);
    const ancestryCenter = (unit) => {
      const ancestors = [...incoming.get(unit.id).keys()].flatMap((id) => units.get(id).people.map((person) => positions.get(person.id))).filter(Boolean);
      return ancestors.length ? ancestors.reduce((sum, position) => sum + position.x, 0) / ancestors.length : width / 2;
    };
    row.sort((a, b) => ancestryCenter(a) - ancestryCenter(b));
    let x = (width - rowWidth(row)) / 2;
    row.forEach((unit) => {
      const personAncestry = (person) => {
        const ancestors = parents.filter((edge) => edge.childId === person.id).map((edge) => positions.get(edge.parentId)).filter(Boolean);
        return ancestors.length ? ancestors.reduce((sum, p) => sum + p.x, 0) / ancestors.length : width / 2;
      };
      unit.people.sort((a, b) => personAncestry(a) - personAncestry(b));
      unit.people.forEach((person, index) => positions.set(person.id, { x: x + index * (NODE_WIDTH + 28), y: 20 + generation * GENERATION_GAP }));
      x += unitWidth(unit) + 88;
    });
  });
  const families = new Map();
  const childParents = new Map();
  parents.filter((edge) => edge.generationDistance === 1).forEach((edge) => {
    const group = childParents.get(edge.childId) || new Set();
    group.add(edge.parentId); childParents.set(edge.childId, group);
  });
  childParents.forEach((group, child) => {
    const parentIds = [...group].sort(); const key = parentIds.join(':');
    if (!families.has(key)) families.set(key, { parents: parentIds, children: [] });
    families.get(key).children.push(child);
  });
  const paths = [];
  const labels = [];
  const addLabel = (text, x, y) => {
    if (!labels.some((label) => label.text === text && label.x === x && label.y === y)) labels.push({ text, x, y });
  };
  const rolesFor = (parentId, childId, side) => {
    const roles = new Set();
    relations.forEach((relation) => {
      const edge = getGenealogyEdge(relation.typeRelation, relation.personneId1, relation.personneId2);
      if (!edge || edge.isSpouse || edge.parentId !== parentId || edge.childId !== childId) return;
      if ((side === 'parent' && relation.personneId1 === parentId) || (side === 'child' && relation.personneId1 === childId)) roles.add(getRelationLabel(relation.typeRelation, relation.precision));
    });
    return [...roles].join(' / ') || (side === 'parent' ? 'Parent' : 'Enfant');
  };
  spouses.forEach((edge) => {
    const a = positions.get(edge.parentId); const b = positions.get(edge.childId);
    const left = a.x < b.x ? a : b; const right = a.x < b.x ? b : a;
    addLabel(getRelationLabel(edge.relation.typeRelation, edge.relation.precision), (left.x + NODE_WIDTH + right.x) / 2, left.y + NODE_HEIGHT + 18);
    // Route non-adjacent alliances above cards rather than through another partner.
    paths.push({ kind: 'spouse', label: 'Conjoints', d: right.x - left.x <= NODE_WIDTH + 29
      ? `M ${left.x + NODE_WIDTH} ${left.y + 53} H ${right.x}`
      : `M ${left.x + 110} ${left.y} V ${left.y - 12} H ${right.x + 110} V ${right.y}` });
  });
  families.forEach((family) => {
    const ps = family.parents.map((id) => positions.get(id));
    const cs = family.children.map((id) => positions.get(id));
    family.parents.forEach((id) => {
      const p = positions.get(id);
      const roles = [...new Set(family.children.map((child) => rolesFor(id, child, 'parent')))];
      addLabel(roles.join(' / '), p.x + NODE_WIDTH / 2, p.y + NODE_HEIGHT + 18);
    });
    family.children.forEach((id) => {
      const p = positions.get(id);
      const roles = [...new Set(family.parents.map((parent) => rolesFor(parent, id, 'child')))];
      addLabel(roles.filter((role) => role !== 'Enfant').join(' / ') || 'Enfant', p.x + NODE_WIDTH / 2, p.y - 12);
    });
    const sharedCouple = ps.length === 2 && spouses.some((edge) => family.parents.includes(edge.parentId) && family.parents.includes(edge.childId)) && Math.abs(ps[0].x - ps[1].x) === NODE_WIDTH + 28;
    const junctionX = ps.reduce((sum, p) => sum + p.x + 110, 0) / ps.length;
    const startY = Math.max(...ps.map((p) => p.y)) + NODE_HEIGHT;
    const railY = (startY + Math.min(...cs.map((p) => p.y))) / 2;
    let d = '';
    if (sharedCouple) d += `M ${junctionX} ${ps[0].y + 53} V ${railY} `;
    else ps.forEach((p) => { d += `M ${p.x + 110} ${p.y + NODE_HEIGHT} V ${railY} H ${junctionX} `; });
    const xs = [junctionX, ...cs.map((p) => p.x + 110)];
    d += `M ${Math.min(...xs)} ${railY} H ${Math.max(...xs)} `;
    cs.forEach((p) => { d += `M ${p.x + 110} ${railY} V ${p.y} `; });
    paths.push({ kind: 'family', label: 'Filiation', d });
  });
  parents.filter((edge) => edge.generationDistance > 1).forEach((edge) => {
    const a = positions.get(edge.parentId); const b = positions.get(edge.childId);
    addLabel(rolesFor(edge.parentId, edge.childId, 'parent'), (a.x + b.x) / 2 + 110, (a.y + NODE_HEIGHT + b.y) / 2);
    paths.push({ kind: 'ancestor', label: `${edge.generationDistance} générations`, d: `M ${a.x + 110} ${a.y + NODE_HEIGHT} C ${a.x + 110} ${b.y - 40}, ${b.x + 110} ${a.y + NODE_HEIGHT + 40}, ${b.x + 110} ${b.y}` });
  });
  return { positions, paths, labels, width, height: Math.max(170, (Math.max(0, ...rows.keys()) + 1) * GENERATION_GAP + 24) };
}
