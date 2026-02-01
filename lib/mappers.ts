// lib/mappers.ts
import { BookReview, User } from "@prisma/client"; // Prismaの型
import { Book, PatternType } from "@/components/bookshelf/bookData"; // 作ったUIの型

// Userを含んだBookReviewの型を定義
type BookReviewWithUser = BookReview & { user: User };

export const toBookCardDTO = (data: BookReviewWithUser): Book => {
  // 安全な型変換ロジック（前回のコードと同じ）
  const safePattern = (p: string): PatternType => {
    const validPatterns: PatternType[] = ["none", "stripe", "dot", "check"];
    return validPatterns.includes(p as PatternType) ? (p as PatternType) : "none";
  };

  return {
    id: data.id.toString(),
    user_id: data.user_id.toString(),
    review: data.review,
    pattern: safePattern(data.pattern),
    baseColor: data.color,
    patternColor: data.pattern_color,
  };
};
