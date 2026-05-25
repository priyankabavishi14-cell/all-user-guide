-- CreateTable
CREATE TABLE "reader_types" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reader_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reader_type_page_selections" (
    "id" TEXT NOT NULL,
    "reader_type_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,

    CONSTRAINT "reader_type_page_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reader_types_token_key" ON "reader_types"("token");

-- CreateIndex
CREATE INDEX "reader_types_project_id_idx" ON "reader_types"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "reader_type_page_selections_reader_type_id_page_id_key" ON "reader_type_page_selections"("reader_type_id", "page_id");

-- AddForeignKey
ALTER TABLE "reader_types" ADD CONSTRAINT "reader_types_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_type_page_selections" ADD CONSTRAINT "reader_type_page_selections_reader_type_id_fkey" FOREIGN KEY ("reader_type_id") REFERENCES "reader_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_type_page_selections" ADD CONSTRAINT "reader_type_page_selections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
