ALTER TABLE "utilisateurs" ALTER COLUMN "motDePasseHash" DROP NOT NULL;

CREATE TABLE "identites_oauth" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identites_oauth_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "identites_oauth_fournisseur_sujet_key"
    ON "identites_oauth"("fournisseur", "sujet");
CREATE UNIQUE INDEX "identites_oauth_utilisateurId_fournisseur_key"
    ON "identites_oauth"("utilisateurId", "fournisseur");

ALTER TABLE "identites_oauth"
    ADD CONSTRAINT "identites_oauth_utilisateurId_fkey"
    FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;