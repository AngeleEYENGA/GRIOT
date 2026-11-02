import { culturalAnswer, culturalConcepts } from './cultural-knowledge';
import { AiService } from './ai.service';

describe('sourced cultural explanations', () => {
  it('defines clan directly, distinguishes lineage and provides references for every concept', () => {
    const clan = culturalAnswer('Qu’est-ce qu’un clan ?')!;
    expect(clan.answer).toMatch(/^Clan :/);
    expect(clan.explanation.focusIds).toEqual(['clan']);
    const comparison = culturalAnswer('Quelle différence entre clan et lignage ?')!;
    expect(comparison.answer).toContain('unités lignagères');
    for (const concept of culturalConcepts) expect(concept.sourceIds.every((id) => clan.explanation.sources.some((source) => source.id === id))).toBe(true);
    expect(clan.explanation.story).toHaveLength(3);
  });
  it('separates linguistic relationships from a universal ethnicity/tribe hierarchy', () => {
    const response = culturalAnswer('Fang est une ethnie avec les tribus Ewondo et Bulu ?')!;
    expect(response.answer).toContain('n’est pas une classification universelle');
    expect(response.explanation.linguisticExample?.labels).toEqual(['Boulou', 'Ewondo', 'Eton', 'Fang', 'Mvëlë']);
    expect(response.explanation.linguisticExample?.caption).toContain('pas une descendance entre personnes');
    expect(response.explanation.linguisticExample?.historicalNote).toContain('1960');
  });
  it('does not infer personal affiliation and does not intercept unrelated names or language learning', () => {
    const response = culturalAnswer('Déduis mon clan à partir de mon nom de famille')!;
    expect(response.answer).toContain('Je ne peux pas déterminer');
    expect(response.contextUsed).toBe(false);
    expect(culturalAnswer('Comment apprendre la langue fang ?')).toBeNull();
    expect(culturalAnswer('Quel est mon nom ?')).toBeNull();
    expect(culturalAnswer('Un enregistrement clandestin')).toBeNull();
  });
  it('documents local words without asserting that French categories map one to one', () => {
    const response = culturalAnswer('Ayong et mvog : quelle différence ?')!;
    expect(response.explanation.localWords).toContain('pas toujours à un seul mot français');
    expect(response.explanation.localWords).toContain('Yana');
  });
  it('answers public concepts without querying a private tree or verifying a token', async () => {
    const prisma = { membreArbre: { findFirst: jest.fn() } };
    const jwt = { verifyAsync: jest.fn() };
    const service = new AiService(prisma as any, jwt as any);
    const response = await service.ask({ query: 'Explique ethnie et tribu', arbreId: 'private-tree' }, 'Bearer private-token');
    expect(response.contextUsed).toBe(false);
    expect(prisma.membreArbre.findFirst).not.toHaveBeenCalled();
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });
  it('rejects inactive membership before using any family context', async () => {
    const prisma = { membreArbre: { findFirst: jest.fn().mockResolvedValue(null) }, personne: { count: jest.fn() } };
    const jwt = { verifyAsync: jest.fn().mockResolvedValue({ sub: 'user' }) };
    const service = new AiService(prisma as any, jwt as any);
    const response = await service.ask({ query: 'Quelles relations manquent ?', arbreId: 'tree' }, 'Bearer token');
    expect(prisma.membreArbre.findFirst).toHaveBeenCalledWith({ where: { arbreId: 'tree', utilisateurId: 'user', statut: 'actif' }, select: { id: true } });
    expect(prisma.personne.count).not.toHaveBeenCalled();
    expect(response.contextUsed).toBe(false);
    expect(response.explanation.kind).toBe('genealogy');
  });
});
