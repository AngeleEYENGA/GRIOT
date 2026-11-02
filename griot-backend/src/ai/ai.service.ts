import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AskAiDto } from './dto/ask-ai.dto';

type TreeContext = {
  peopleCount: number;
  relationCount: number;
  samplePeople: string[];
};

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async ask(dto: AskAiDto, authorization?: string) {
    const query = dto.query.trim();
    const normalized = query.toLowerCase();

    const userId = await this.getUserIdFromAuthHeader(authorization);
    const treeContext = await this.getTreeContext(dto.arbreId, userId);

    const answer = this.buildAnswer(normalized, treeContext);

    return {
      answer,
      suggestions: [
        'Qui est la personne la plus ancienne de ma branche ?',
        'Quelles relations manquent dans mon arbre ?',
        'Comment améliorer la complétude de ma famille ?',
      ],
      contextUsed: Boolean(treeContext),
    };
  }

  private async getUserIdFromAuthHeader(authorization?: string): Promise<string | null> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }

  private async getTreeContext(arbreId?: string, userId?: string | null): Promise<TreeContext | null> {
    if (!arbreId || !userId) {
      return null;
    }

    const member = await this.prisma.membreArbre.findFirst({
      where: { arbreId, utilisateurId: userId },
      select: { id: true },
    });

    if (!member) {
      return null;
    }

    const [peopleCount, relationCount, samplePeople] = await Promise.all([
      this.prisma.personne.count({ where: { arbreId } }),
      this.prisma.relationFamiliale.count({
        where: {
          OR: [{ personne1: { arbreId } }, { personne2: { arbreId } }],
        },
      }),
      this.prisma.personne.findMany({
        where: { arbreId },
        take: 3,
        orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
        select: { prenom: true, nom: true },
      }),
    ]);

    return {
      peopleCount,
      relationCount,
      samplePeople: samplePeople.map((person) => `${person.prenom} ${person.nom}`.trim()),
    };
  }

  private buildAnswer(normalizedQuery: string, context: TreeContext | null): string {
    const hasContext = Boolean(context);
    const contextLine = hasContext
      ? `Dans votre arbre actuel: ${context!.peopleCount} personnes, ${context!.relationCount} relations.`
      : "Je peux déjà vous guider, et je serai encore plus précis quand vous serez connecté à un arbre.";

    if (/(langue|alphabet|prononciation|grammaire|conte|cuisine|culture|tradition)/.test(normalizedQuery)) {
      return `${contextLine} Ouvrez l’Espace collaboratif & langues de votre arbre : choisissez une langue, transmettez des mots ou des exemples avec un proche, ajoutez une voix et faites relire les fiches avant de jouer. Le salon accueille aussi les contes, recettes et traditions. Les suggestions par pays ne déterminent pas la langue natale de votre famille.`;
    }
    if (/(migration|guerre|catastrophe|pourquoi.*parti)/.test(normalizedQuery)) {
      return `${contextLine} Dans Espace collaboratif & langues, ouvrez L’histoire de nos parcours. GRIOT rapproche les lieux et dates renseignés de repères historiques sourcés. Ce contexte ne prouve pas le motif d’un départ : demandez des témoignages ou des archives, sans attribuer automatiquement une guerre ou une catastrophe au parcours d’un proche.`;
    }

    if (/(arri[eè]re|anc[eê]tre|grand[- ]p[èe]re|grand[- ]m[èe]re|qui [eé]tait)/.test(normalizedQuery)) {
      return `${contextLine} Pour retrouver un ancêtre précis, commencez par la personne cible puis remontez parent par parent. Ajoutez les lieux, dates et témoins de chaque génération pour fiabiliser la lignée.`;
    }

    if (/(migration|diaspora|carte|gabon|cameroun|congo|origine|village)/.test(normalizedQuery)) {
      return `${contextLine} Pour la carte des migrations, reliez chaque personne à un village d'origine et à une période. Vous obtiendrez ensuite un parcours générationnel plus lisible.`;
    }

    if (/(manque|compl[eé]t|compl[ée]tude|am[eé]liorer|quoi faire)/.test(normalizedQuery)) {
      const sample = hasContext && context!.samplePeople.length
        ? `Exemples récents: ${context!.samplePeople.join(', ')}.`
        : '';
      return `${contextLine} Priorité recommandée: 1) ajouter les parents manquants, 2) créer les relations parent/enfant et conjoint, 3) compléter les dates et villages. ${sample}`.trim();
    }

    if (/(r[eé]sum[eé]|branche|famille)/.test(normalizedQuery)) {
      return `${contextLine} Votre branche se structure autour des liens parent/enfant, puis des unions. Pour un résumé utile, je peux ensuite détailler génération par génération.`;
    }

    return `${contextLine} Posez-moi une question ciblée: ancêtres, migrations, relations manquantes, ou plan de complétude.`;
  }
}
