-- AlterTable: add reader_slug column
ALTER TABLE "reader_types" ADD COLUMN "reader_slug" TEXT;

-- Backfill existing rows: slugify the name
UPDATE "reader_types"
SET "reader_slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(name), '[^a-z0-9\s\-]', '', 'gi'), '\s+', '-', 'g'));

-- Unique index per project (nulls allowed for safety)
CREATE UNIQUE INDEX "reader_types_project_id_reader_slug_key"
  ON "reader_types"("project_id", "reader_slug");
