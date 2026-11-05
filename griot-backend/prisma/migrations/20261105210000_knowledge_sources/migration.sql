-- CreateEnum
CREATE TYPE "PerimetreSource" AS ENUM ('legacy_restreint', 'arbre', 'editorial');

-- CreateEnum
CREATE TYPE "NatureDocumentaire" AS ENUM ('indeterminee', 'primaire', 'secondaire', 'tertiaire');

-- CreateEnum
CREATE TYPE "StatutDocumentaire" AS ENUM ('a_examiner', 'source_identifiee', 'contenu_extrait', 'attente_verification', 'verifie', 'conteste', 'obsolete', 'archive');

-- CreateEnum
CREATE TYPE "RoleDocumentaire" AS ENUM ('curateur', 'validateur', 'administrateur');

-- AlterEnum
ALTER TYPE "TypeSource" ADD VALUE 'autre';

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "arbreId" TEXT,
ADD COLUMN     "auteurId" TEXT,
ADD COLUMN     "auteurs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "categorieDocument" TEXT NOT NULL DEFAULT 'autre',
ADD COLUMN     "cleDedup" TEXT,
ADD COLUMN     "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateModification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doi" TEXT,
ADD COLUMN     "droitsUsage" TEXT,
ADD COLUMN     "langueDocument" TEXT,
ADD COLUMN     "licence" TEXT,
ADD COLUMN     "nature" "NatureDocumentaire" NOT NULL DEFAULT 'indeterminee',
ADD COLUMN     "organisme" TEXT,
ADD COLUMN     "perimetre" "PerimetreSource" NOT NULL DEFAULT 'legacy_restreint',
ADD COLUMN     "periode" TEXT,
ADD COLUMN     "publication" TEXT,
ADD COLUMN     "publie" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "statutDocumentaire" "StatutDocumentaire" NOT NULL DEFAULT 'a_examiner',
ADD COLUMN     "territoires" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "versions_source" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "metadonnees" JSONB NOT NULL,
    "empreinteMetadonnees" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "acteurId" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versions_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations_source" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "acteurId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "accessibilite" TEXT NOT NULL,
    "contenuConsulte" BOOLEAN NOT NULL DEFAULT false,
    "provenance" TEXT NOT NULL DEFAULT 'declaration_manuelle',
    "note" TEXT,
    "dateEnregistrement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_documentaire" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "acteurId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_documentaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilitations_documentaires" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "role" "RoleDocumentaire" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habilitations_documentaires_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "versions_source_sourceId_numero_key" ON "versions_source"("sourceId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "versions_source_id_sourceId_key" ON "versions_source"("id", "sourceId");

-- CreateIndex
CREATE INDEX "consultations_source_sourceId_dateEnregistrement_idx" ON "consultations_source"("sourceId", "dateEnregistrement");

-- CreateIndex
CREATE INDEX "journal_documentaire_sourceId_dateCreation_idx" ON "journal_documentaire"("sourceId", "dateCreation");

-- CreateIndex
CREATE UNIQUE INDEX "habilitations_documentaires_utilisateurId_role_key" ON "habilitations_documentaires"("utilisateurId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "sources_cleDedup_key" ON "sources"("cleDedup");

-- CreateIndex
CREATE INDEX "sources_arbreId_dateCreation_id_idx" ON "sources"("arbreId", "dateCreation", "id");

-- CreateIndex
CREATE INDEX "sources_perimetre_publie_statutDocumentaire_idx" ON "sources"("perimetre", "publie", "statutDocumentaire");

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions_source" ADD CONSTRAINT "versions_source_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations_source" ADD CONSTRAINT "consultations_source_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations_source" ADD CONSTRAINT "consultations_source_versionId_sourceId_fkey" FOREIGN KEY ("versionId", "sourceId") REFERENCES "versions_source"("id", "sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_documentaire" ADD CONSTRAINT "journal_documentaire_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilitations_documentaires" ADD CONSTRAINT "habilitations_documentaires_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "sources" ADD CONSTRAINT "sources_documentary_scope_check" CHECK (("perimetre" = 'arbre' AND "arbreId" IS NOT NULL AND "auteurId" IS NOT NULL) OR ("perimetre" <> 'arbre' AND "arbreId" IS NULL));

ALTER TABLE "sources" ALTER COLUMN "auteurs" SET NOT NULL, ALTER COLUMN "territoires" SET NOT NULL, ALTER COLUMN "themes" SET NOT NULL;
ALTER TABLE "sources" ADD CONSTRAINT "sources_positive_revision_check" CHECK ("revision" > 0);
ALTER TABLE "sources" ADD CONSTRAINT "sources_publication_check" CHECK (NOT "publie" OR ("perimetre" = 'editorial' AND "statutDocumentaire" = 'verifie'));
ALTER TABLE "versions_source" ADD CONSTRAINT "versions_source_snapshot_check" CHECK ("numero" > 0 AND "empreinteMetadonnees" ~ '^[a-f0-9]{64}$');
ALTER TABLE "consultations_source" ADD CONSTRAINT "consultations_source_manual_provenance_check" CHECK (
 "operation" IN ('controle_acces', 'lecture_manuelle')
 AND "accessibilite" IN ('accessible', 'restreinte', 'indisponible', 'modifiee')
 AND "provenance" = 'declaration_manuelle'
 AND "contenuConsulte" = ("operation" = 'lecture_manuelle')
 AND ("operation" <> 'lecture_manuelle' OR "accessibilite" IN ('accessible', 'modifiee'))
);
