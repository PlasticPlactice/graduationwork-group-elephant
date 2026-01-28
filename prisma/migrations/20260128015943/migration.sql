-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserMessage" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "UserMessage_is_read_idx" ON "UserMessage"("is_read");
