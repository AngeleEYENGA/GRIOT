CREATE TYPE "RoleInstitution" AS ENUM ('administrateur', 'validateur', 'lecteur');
CREATE TYPE "StatutMembreInstitution" AS ENUM ('actif', 'invite');

ALTER TABLE "notifications"
    ADD COLUMN "cibleType" TEXT,
    ADD COLUMN "cibleId" TEXT,
    ADD COLUMN "arbreId" TEXT,
    ADD COLUMN "institutionId" TEXT;

CREATE TABLE "commentaires_souvenirs" (
    "id" TEXT NOT NULL,
    "souvenirId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commentaires_souvenirs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commentaires_souvenirs_souvenirId_dateCreation_idx"
    ON "commentaires_souvenirs"("souvenirId", "dateCreation");

ALTER TABLE "commentaires_souvenirs"
    ADD CONSTRAINT "commentaires_souvenirs_souvenirId_fkey"
    FOREIGN KEY ("souvenirId") REFERENCES "souvenirs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "commentaires_souvenirs"
    ADD CONSTRAINT "commentaires_souvenirs_auteurId_fkey"
    FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "membres_institution" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "role" "RoleInstitution" NOT NULL DEFAULT 'lecteur',
    "statut" "StatutMembreInstitution" NOT NULL DEFAULT 'invite',
    "dateInvitation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membres_institution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "membres_institution_institutionId_utilisateurId_key"
    ON "membres_institution"("institutionId", "utilisateurId");
CREATE INDEX "membres_institution_utilisateurId_statut_idx"
    ON "membres_institution"("utilisateurId", "statut");

ALTER TABLE "membres_institution"
    ADD CONSTRAINT "membres_institution_institutionId_fkey"
    FOREIGN KEY ("institutionId") REFERENCES "institutions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "membres_institution"
    ADD CONSTRAINT "membres_institution_utilisateurId_fkey"
    FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
