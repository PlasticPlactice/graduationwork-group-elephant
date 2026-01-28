import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, book_review_id, reaction_id } = body;

    // 1. バリデーション: IDがない場合は弾く
    if (!user_id || !book_review_id || !reaction_id) {
      return NextResponse.json(
        { message: "BookReview ID and Reaction ID are required" },
        { status: 400 }
      );
    }

    // 2. 既存の「いいね」があるか確認する
    // ※ ここで userId がある場合は where に userId も加えます
    const existingReaction = await prisma.bookReviewReaction.findFirst({
      where: {
        book_review_id: book_review_id,
        reaction_id: reaction_id,
        user: {
          id: user_id,
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
        { status: 200 }
      );

    } else {
      // --- パターンB: まだ無い場合は「作成」する ---
      const newReaction = await prisma.bookReviewReaction.create({
        data: {
          bookReview: {
            connect: { id: book_review_id },
          },
          reaction: {
            connect: { id: reaction_id },
          },
          user: {
            connect: { id: user_id },
          },
        },
      });

      return NextResponse.json(
        { message: "Reaction added", data: newReaction, action: "added" },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error("Reaction API Error:", error);
    return NextResponse.json(
      { message: "Failed to process reaction" },
      { status: 500 }
    );
  }
}
