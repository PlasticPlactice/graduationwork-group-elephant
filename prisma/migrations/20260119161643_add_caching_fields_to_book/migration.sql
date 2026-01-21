-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "cached_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" VARCHAR(1000),
ADD COLUMN     "published_date" VARCHAR(255),
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'FOUND';

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");
