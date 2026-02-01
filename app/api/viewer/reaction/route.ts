import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// reactionをすべて取得 + 何個あるか確認してる
export async function GET() {
  try {
    const reviews = await prisma.reaction.findMany({
      orderBy: {
        created_at: "asc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, book_review_id, reaction_id } = body;

    const bookReviewId = Number(body.book_review_id);
    const reactionId = Number(body.reaction_id);
    const userId = Number(body.user_id);

    if (Number.isNaN(bookReviewId) || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // 1. バリデーション: IDがない場合は弾く
    if (!book_review_id || !reaction_id) {
      return NextResponse.json(
        { message: "BookReview ID and Reaction ID are required" },
        { status: 400 },
      );
    }

    // 2. 既存の「いいね」があるか確認する
    // ※ ここで userId がある場合は where に userId も加えます
    const existingReaction = await prisma.bookReviewReaction.findFirst({
      where: {

        book_review_id: bookReviewId,
        reaction_id: reactionId,
        user: {
          id: userId,
        },
      },
    });

    if (existingReaction) {
      // --- パターンA: 既にいいね済みの場合は「削除（取り消し）」する ---
      await prisma.bookReviewReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return NextResponse.json(
        { message: "Reaction removed", action: "removed" },
        { status: 200 },
      );
    } else {
      // --- パターンB: まだ無い場合は「作成」する ---
      const newReaction = await prisma.bookReviewReaction.create({
        data: {
          bookReview: {
            connect: { id: bookReviewId },
          },
          reaction: {
            connect: { id: reactionId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      return NextResponse.json(
        { message: "Reaction added", data: newReaction, action: "added" },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Reaction API Error:", error);
    return NextResponse.json(
      { message: "Failed to process reaction" },
      { status: 500 },
    );
  }
}
