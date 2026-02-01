import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // プロジェクトのprismaインスタンスの場所に合わせる

export async function POST(req: Request) {
  try {
    // Bodyからデータを取得
    const { user_id, book_review_id } = await req.json();

    const userId = Number(user_id);
    const bookReviewId = Number(book_review_id);

    if (Number.isNaN(bookReviewId) || Number.isNaN(userId)) {
        return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
        );
    }

    // バリデーション（念のため）
    if (!book_review_id) {
      return NextResponse.json(
        { message: "book_review_id is required" }, 
        { status: 400 }
      );
    }

    // 2. 自分がどのリアクションをしているか取得する（user_idがある場合のみ）
    // 結果例: [{ reaction_id: "1" }, { reaction_id: "3" }]
    let myReactions: number[] = [];
    if (user_id) {
      const myReactionData = await prisma.bookReviewReaction.findMany({
        where: {
          book_review_id: bookReviewId,
          user_id: userId,
        },
        select: {
          reaction_id: true,
        },
      });
      // 使いやすいように配列にする ["1", "3"]
      myReactions = myReactionData.map((r) => r.reaction_id);
    }

    // 2. 各reaction_idごとの数を集計する
    // 結果例: [{ reaction_id: "1", _count: { _all: 3 } }, { reaction_id: "2", ... }]
    const reactionCounts = await prisma.bookReviewReaction.groupBy({
      by: ['reaction_id'],
      where: {
        book_review_id: bookReviewId,
      },
      _count: {
        _all: true,
      },
    });

    // 3. データを整形してマージする
    // APIとして返す形を作る
    const result = reactionCounts.map((item) => ({
      reaction_id: item.reaction_id,
      count: item._count._all,                 // 数
      is_reacted: myReactions.includes(item.reaction_id), // 自分が押したか (true/false)
    }));

    // 4. reaction_id 順に並び替える (昇順)
    result.sort((a, b) => {
        if (a.reaction_id < b.reaction_id) return -1;
        if (a.reaction_id > b.reaction_id) return 1;
        return 0;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server Error" }, 
      { status: 500 }
    );
  }
}
