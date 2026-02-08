-- AlterTable
ALTER TABLE "BookReview" ADD COLUMN     "draft_flag" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BookReview_draft_flag_idx" ON "BookReview"("draft_flag");
