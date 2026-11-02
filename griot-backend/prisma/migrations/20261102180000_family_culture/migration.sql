CREATE TABLE "publications_famille" (
 "id" TEXT NOT NULL, "arbreId" TEXT NOT NULL, "auteurId" TEXT NOT NULL,
 "parentId" TEXT, "theme" TEXT NOT NULL DEFAULT 'discussion', "contenu" TEXT NOT NULL,
 "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "publications_famille_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "publications_famille_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "publications_famille_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "publications_famille_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "publications_famille"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "publications_famille_arbreId_dateCreation_idx" ON "publications_famille"("arbreId", "dateCreation");
CREATE TABLE "cartes_langue" (
 "id" TEXT NOT NULL, "arbreId" TEXT NOT NULL, "auteurId" TEXT NOT NULL,
 "langue" TEXT NOT NULL, "nomLangue" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'mot',
 "expression" TEXT NOT NULL, "traduction" TEXT NOT NULL, "explication" TEXT, "source" TEXT NOT NULL,
 "validee" BOOLEAN NOT NULL DEFAULT false, "audio" BYTEA, "audioMime" TEXT,
 "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "cartes_langue_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "cartes_langue_arbreId_fkey" FOREIGN KEY ("arbreId") REFERENCES "arbres"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "cartes_langue_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "cartes_langue_arbreId_langue_idx" ON "cartes_langue"("arbreId", "langue");
