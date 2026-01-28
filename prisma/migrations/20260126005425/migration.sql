/*
  Warnings:

  - A unique constraint covering the columns `[user_id,reaction_id,book_review_id]` on the table `BookReviewReaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `BookReviewReaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BookReviewReaction_reaction_id_book_review_id_key";

-- AlterTable
ALTER TABLE "BookReviewReaction" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookReviewReaction_user_id_reaction_id_book_review_id_key" ON "BookReviewReaction"("user_id", "reaction_id", "book_review_id");

-- AddForeignKey
ALTER TABLE "BookReviewReaction" ADD CONSTRAINT "BookReviewReaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
