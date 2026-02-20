// Re-export Prisma BookReview type for use across server code.
import type { BookReview as PrismaBookReview } from "@prisma/client";

export type BookReviewDetail = PrismaBookReview;
