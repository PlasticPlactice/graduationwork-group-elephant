-- CreateTable
CREATE TABLE "Terms" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "data_path" TEXT NOT NULL,
    "public_flag" BOOLEAN NOT NULL DEFAULT false,
    "admin_id" INTEGER NOT NULL,
    "applied_at" TIMESTAMPTZ(3),
    "scheduled_applied_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Terms_admin_id_idx" ON "Terms"("admin_id");

-- CreateIndex
CREATE INDEX "Terms_deleted_flag_idx" ON "Terms"("deleted_flag");

-- CreateIndex
CREATE INDEX "Terms_public_flag_idx" ON "Terms"("public_flag");

-- CreateIndex
CREATE INDEX "Terms_scheduled_applied_at_idx" ON "Terms"("scheduled_applied_at");

-- AddForeignKey
ALTER TABLE "Terms" ADD CONSTRAINT "Terms_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
