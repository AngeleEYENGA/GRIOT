-- CreateEnum
CREATE TYPE "RoleArbre" AS ENUM ('admin', 'editeur', 'contributeur', 'lecteur');

-- CreateEnum
CREATE TYPE "StatutMembre" AS ENUM ('actif', 'invite', 'en_attente');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('actif', 'suspendu', 'supprime');

-- CreateEnum
CREATE TYPE "AvatarType" AS ENUM ('photo', 'avatar_personnalise', 'avatar_auto', 'initiales');

-- CreateEnum
CREATE TYPE "StatutVerification" AS ENUM ('non_verifie', 'verifie_famille', 'verifie_chefferie');

-- CreateEnum
CREATE TYPE "CategorieSouvenir" AS ENUM ('histoire', 'cuisine', 'danse', 'musique', 'proverbe', 'mariage', 'funerailles', 'naissance', 'vetements', 'rituel');

-- CreateEnum
CREATE TYPE "TypeMedia" AS ENUM ('photo', 'audio', 'video', 'document');

-- CreateEnum
CREATE TYPE "TypeSource" AS ENUM ('acte_civil', 'archive_nationale', 'chefferie', 'temoignage', 'livre', 'journal', 'universite', 'photo', 'video', 'entretien');

-- CreateEnum
CREATE TYPE "FiabiliteSource" AS ENUM ('officielle', 'institutionnelle', 'familiale', 'non_verifiee');

-- CreateEnum
CREATE TYPE "StatutPreuve" AS ENUM ('en_attente', 'validee', 'rejetee');

-- CreateEnum
CREATE TYPE "TypeRelation" AS ENUM ('parent', 'enfant', 'conjoint');

-- CreateEnum
CREATE TYPE "ThemeVisuel" AS ENUM ('moderne', 'traditionnel_africain', 'aquarelle', 'minimaliste', 'archives_anciennes', 'royal');

-- CreateEnum
CREATE TYPE "ActionSync" AS ENUM ('creation', 'modification', 'suppression');

-- CreateEnum
CREATE TYPE "StatutSync" AS ENUM ('en_attente', 'synchronise', 'conflit');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "motDePasseHash" TEXT NOT NULL,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'actif',
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "telephoneVerifie" BOOLEAN NOT NULL DEFAULT false,
    "mfaActive" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arbres" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "visibilite" TEXT NOT NULL DEFAULT 'prive',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arbres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membres_arbre" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "role" "RoleArbre" NOT NULL DEFAULT 'lecteur',
    "statut" "StatutMembre" NOT NULL DEFAULT 'invite',
    "dateInvitation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membres_arbre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnes" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "dateDeces" TIMESTAMP(3),
    "villageOrigine" TEXT,
    "avatarType" "AvatarType" NOT NULL DEFAULT 'initiales',
    "avatarCategorie" TEXT,
    "avatarValeur" TEXT,
    "biographie" TEXT,
    "statutVerification" "StatutVerification" NOT NULL DEFAULT 'non_verifie',

    CONSTRAINT "personnes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relations_familiales" (
    "id" TEXT NOT NULL,
    "personneId1" TEXT NOT NULL,
    "personneId2" TEXT NOT NULL,
    "typeRelation" "TypeRelation" NOT NULL,

    CONSTRAINT "relations_familiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "souvenirs" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "personneId" TEXT,
    "auteurId" TEXT NOT NULL,
    "categorie" "CategorieSouvenir" NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT,
    "statutVerification" "StatutVerification" NOT NULL DEFAULT 'non_verifie',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "souvenirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements_historiques" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "evenements_historiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "type" "TypeSource" NOT NULL,
    "nom" TEXT NOT NULL,
    "reference" TEXT,
    "fiabilite" "FiabiliteSource" NOT NULL DEFAULT 'non_verifiee',

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preuves" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "personneId" TEXT,
    "souvenirId" TEXT,
    "type" TEXT NOT NULL,
    "urlDocument" TEXT,
    "datePreuve" TIMESTAMP(3),
    "auteurId" TEXT NOT NULL,
    "statutValidation" "StatutPreuve" NOT NULL DEFAULT 'en_attente',

    CONSTRAINT "preuves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medias" (
    "id" TEXT NOT NULL,
    "souvenirId" TEXT,
    "personneId" TEXT,
    "type" "TypeMedia" NOT NULL,
    "url" TEXT NOT NULL,
    "tailleOctets" INTEGER,
    "dateUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lieux" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "pays" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "lieux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" TEXT NOT NULL,
    "personneId" TEXT NOT NULL,
    "lieuId" TEXT NOT NULL,
    "dateEvenement" TIMESTAMP(3),
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "dateCompletion" TIMESTAMP(3),

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "actionType" "ActionSync" NOT NULL,
    "payload" JSONB NOT NULL,
    "statut" "StatutSync" NOT NULL DEFAULT 'en_attente',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSync" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences_affichage" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "themeVisuel" "ThemeVisuel",
    "avatarsActives" BOOLEAN NOT NULL DEFAULT true,
    "modeAvatarPrefere" TEXT,
    "densiteAffichage" TEXT NOT NULL DEFAULT 'confortable',
    "informationsVisibles" JSONB,

    CONSTRAINT "preferences_affichage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identites_familiales" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "blasonUrl" TEXT,
    "banniereUrl" TEXT,
    "devise" TEXT,
    "themeOfficiel" "ThemeVisuel" NOT NULL DEFAULT 'moderne',
    "paletteCouleurs" TEXT,
    "styleAvatarDefaut" TEXT,
    "modifieParId" TEXT NOT NULL,
    "dateModification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identites_familiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "arbreId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statutVerification" "StatutVerification" NOT NULL DEFAULT 'non_verifie',

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "membres_arbre_utilisateurId_arbreId_key" ON "membres_arbre"("utilisateurId", "arbreId");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_affichage_utilisateurId_arbreId_key" ON "preferences_affichage"("utilisateurId", "arbreId");

-- CreateIndex
CREATE UNIQUE INDEX "identites_familiales_arbreId_key" ON "identites_familiales"("arbreId");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_arbreId_key" ON "institutions"("arbreId");

-- AddForeignKey
ALTER TABLE "arbres" ADD CONSTRAINT "arbres_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_arbre" ADD CONSTRAINT "membres_arbre_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_arbre" ADD CONSTRAINT "membres_arbre_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnes" ADD CONSTRAINT "personnes_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations_familiales" ADD CONSTRAINT "relations_familiales_personneId1_fkey" FOREIGN KEY ("personneId1") REFERENCES "personnes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations_familiales" ADD CONSTRAINT "relations_familiales_personneId2_fkey" FOREIGN KEY ("personneId2") REFERENCES "personnes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souvenirs" ADD CONSTRAINT "souvenirs_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souvenirs" ADD CONSTRAINT "souvenirs_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "personnes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souvenirs" ADD CONSTRAINT "souvenirs_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements_historiques" ADD CONSTRAINT "evenements_historiques_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preuves" ADD CONSTRAINT "preuves_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preuves" ADD CONSTRAINT "preuves_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "personnes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preuves" ADD CONSTRAINT "preuves_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "souvenirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preuves" ADD CONSTRAINT "preuves_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medias" ADD CONSTRAINT "medias_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "souvenirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medias" ADD CONSTRAINT "medias_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "personnes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "migrations" ADD CONSTRAINT "migrations_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "personnes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "migrations" ADD CONSTRAINT "migrations_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "lieux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences_affichage" ADD CONSTRAINT "preferences_affichage_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences_affichage" ADD CONSTRAINT "preferences_affichage_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identites_familiales" ADD CONSTRAINT "identites_familiales_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identites_familiales" ADD CONSTRAINT "identites_familiales_modifieParId_fkey" FOREIGN KEY ("modifieParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
