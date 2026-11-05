ALTER TABLE "arbres"
ADD COLUMN "presentationPublique" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "introductionPublique" TEXT,
ADD COLUMN "languesPubliques" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
