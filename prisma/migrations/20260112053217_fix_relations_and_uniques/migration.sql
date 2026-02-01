/*
  Warnings:

  - You are about to alter the column `email` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `isbn_ruby` on the `Book` table. All the data in the column will be lost.
  - You are about to alter the column `isbn` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `title` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `title_ruby` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `author` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `author_ruby` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `publisher` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `height_size` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `width_size` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `isbn` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `book_title` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `book_title_ruby` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `author` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `author_ruby` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `publishers` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `book_height_size` column on the `BookReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `book_width_size` column on the `BookReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `nickname` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `address` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `color` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `pattern` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `pattern_color` on the `BookReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `user_id` on the `BookReviewReaction` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `reaction` on the `Reaction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `icon_path` on the `Reaction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `account_id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `nickname` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `address` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `color` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `pattern` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `pattern_color` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `updated_at` on the `UserMessage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reaction_id,book_review_id]` on the table `BookReviewReaction` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `evaluations_status` on the `BookReview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `address` on table `BookReview` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `age` to the `BookReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `BookReview` table without a default value. This is not possible if the table is not empty.
  - Made the column `self_introduction` on table `BookReview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `BookReview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pattern` on table `BookReview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pattern_color` on table `BookReview` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `end_period` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `first_voting_start_period` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `first_voting_end_period` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `second_voting_start_period` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `second_voting_end_period` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `public_date` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `notification_type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `sort_order` on table `NotificationFile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `sub_address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `age` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `self_introduction` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `user_status` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "BookReview" DROP CONSTRAINT "BookReview_isbn_fkey";

-- DropForeignKey
ALTER TABLE "BookReviewReaction" DROP CONSTRAINT "BookReviewReaction_user_id_fkey";

-- DropIndex
DROP INDEX "Book_isbn_idx";

-- DropIndex
DROP INDEX "BookReviewReaction_reaction_id_book_review_id_user_id_key";

-- DropIndex
DROP INDEX "BookReviewReaction_user_id_idx";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isbn_ruby",
ALTER COLUMN "isbn" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "title_ruby" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "author" DROP NOT NULL,
ALTER COLUMN "author" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "author_ruby" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "publisher" SET DATA TYPE VARCHAR(255),
DROP COLUMN "height_size",
ADD COLUMN     "height_size" INTEGER,
DROP COLUMN "width_size",
ADD COLUMN     "width_size" INTEGER,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "BookReview" ALTER COLUMN "isbn" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "book_title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "book_title_ruby" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "author" DROP NOT NULL,
ALTER COLUMN "author" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "author_ruby" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "publishers" SET DATA TYPE VARCHAR(255),
DROP COLUMN "book_height_size",
ADD COLUMN     "book_height_size" INTEGER,
DROP COLUMN "book_width_size",
ADD COLUMN     "book_width_size" INTEGER,
DROP COLUMN "evaluations_status",
ADD COLUMN     "evaluations_status" INTEGER NOT NULL,
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DATA TYPE VARCHAR(255),
DROP COLUMN "age",
ADD COLUMN     "age" INTEGER NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" INTEGER NOT NULL,
ALTER COLUMN "self_introduction" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "pattern" SET NOT NULL,
ALTER COLUMN "pattern" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "pattern_color" SET NOT NULL,
ALTER COLUMN "pattern_color" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "BookReviewReaction" DROP COLUMN "user_id",
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL,
ALTER COLUMN "start_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "end_period" SET NOT NULL,
ALTER COLUMN "end_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "first_voting_start_period" SET NOT NULL,
ALTER COLUMN "first_voting_start_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "first_voting_end_period" SET NOT NULL,
ALTER COLUMN "first_voting_end_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "second_voting_start_period" SET NOT NULL,
ALTER COLUMN "second_voting_start_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "second_voting_end_period" SET NOT NULL,
ALTER COLUMN "second_voting_end_period" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "public_date" SET NOT NULL,
ALTER COLUMN "public_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "public_date" SET DATA TYPE TIMESTAMPTZ(3),
DROP COLUMN "notification_type",
ADD COLUMN     "notification_type" INTEGER NOT NULL,
ALTER COLUMN "draft_flag" SET DEFAULT false,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "NotificationFile" ALTER COLUMN "sort_order" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "PasswordReset" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "reaction" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "icon_path" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sub_address" VARCHAR(255) NOT NULL,
ALTER COLUMN "account_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "age" SET NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" INTEGER NOT NULL,
ALTER COLUMN "self_introduction" SET NOT NULL,
ALTER COLUMN "color" DROP DEFAULT,
ALTER COLUMN "color" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "pattern" DROP DEFAULT,
ALTER COLUMN "pattern" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "pattern_color" DROP DEFAULT,
ALTER COLUMN "pattern_color" SET DATA TYPE VARCHAR(255),
DROP COLUMN "user_status",
ADD COLUMN     "user_status" INTEGER NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "UserMessage" DROP COLUMN "updated_at",
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "BookReviewReaction_reaction_id_book_review_id_key" ON "BookReviewReaction"("reaction_id", "book_review_id");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "User_user_status_idx" ON "User"("user_status");

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;
