import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prismaクライアントのパスに合わせてね

export async function PUT(
  request: Request,
  props : { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params

    const { type } = await request.json(); // "increment" or "decrement"
    const reviewId = Number(params.id); // 文字列の場合もあるので適宜 Number() 変換

    if (isNaN(reviewId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    if (type === "increment") {
      // プラスする場合: 単純にインクリメント
      await prisma.bookReview.update({
        where: { id: Number(reviewId) }, // IDの型に合わせてね
        data: {
          evaluations_count: {
            increment: 1, // ★これが重要 (Atomic Update)
          },
        },
      });
    } else if (type === "decrement") {
      // マイナスする場合: 0未満にならないように注意したいが、
      // Prismaの decrement だけだとマイナス突入する可能性がある。
      // 性善説なら decrement: 1 だけでOKだが、安全策をとるなら一度取得してから確認でもOK。
      // 今回はシンプルに decrement で行きます。
      await prisma.bookReview.update({
        where: { id: Number(reviewId) },
        data: {
          evaluations_count: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
