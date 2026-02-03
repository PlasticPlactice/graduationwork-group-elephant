-- AlterTable
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "type" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserMessage" ADD COLUMN IF NOT EXISTS "is_read" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserMessage_is_read_idx" ON "UserMessage"("is_read");
