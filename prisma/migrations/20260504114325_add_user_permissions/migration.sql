-- CreateTable
CREATE TABLE "project_users" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "access_type" TEXT NOT NULL DEFAULT 'full',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_permissions" (
    "id" TEXT NOT NULL,
    "project_user_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,

    CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viewer_sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "project_user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viewer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_users_project_id_idx" ON "project_users"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_users_project_id_email_key" ON "project_users"("project_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "page_permissions_project_user_id_page_id_key" ON "page_permissions"("project_user_id", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "viewer_sessions_session_token_key" ON "viewer_sessions"("session_token");

-- CreateIndex
CREATE INDEX "viewer_sessions_project_user_id_idx" ON "viewer_sessions"("project_user_id");

-- AddForeignKey
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_permissions" ADD CONSTRAINT "page_permissions_project_user_id_fkey" FOREIGN KEY ("project_user_id") REFERENCES "project_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_permissions" ADD CONSTRAINT "page_permissions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewer_sessions" ADD CONSTRAINT "viewer_sessions_project_user_id_fkey" FOREIGN KEY ("project_user_id") REFERENCES "project_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
