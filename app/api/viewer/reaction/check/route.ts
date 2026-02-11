import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  // ... user_id と bookReviewId を取得 ...
  const { searchParams } = new URL(req.url);
  const bookReviewId = searchParams.get("bookReviewId");

  if(!bookReviewId) {
    return NextResponse.json(
        { message: "bookReviewId is required" },
        { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  
  const userId = Number(session?.user?.id);

  // ★変更点: findMany で該当するものを全部とってくる
  const myReactions = await prisma.bookReviewReaction.findMany({
    where: {
      user_id: Number(userId),
      book_review_id: Number(bookReviewId),
    },
    select: {
      reaction_id: true,
    },
  });

  // 結果例: [{ reactionId: 1 }, { reactionId: 3 }] 
  // これを配列 [1, 3] に変換して返すとフロントが楽
  const reactionIds = myReactions.map(r => r.reaction_id);

  return NextResponse.json({ reactionIds });
}
