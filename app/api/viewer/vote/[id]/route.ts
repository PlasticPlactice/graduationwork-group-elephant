import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Prismaクライアントのパスに合わせてね
import {
  calculateEventStatus,
  EVENT_STATUS,
} from "@/lib/constants/eventStatus";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;

    const { type } = await request.json(); // "increment" or "decrement"
    const reviewId = Number(params.id); // 文字列の場合もあるので適宜 Number() 変換

    if (isNaN(reviewId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const review = await prisma.bookReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        event_id: true,
        event: {
          select: {
            start_period: true,
            end_period: true,
            first_voting_start_period: true,
            first_voting_end_period: true,
            second_voting_start_period: true,
            second_voting_end_period: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "指定の書評が見つかりませんでした。" },
        { status: 404 },
      );
    }

    if (!review.event_id || !review.event) {
      return NextResponse.json(
        { message: "投票にはイベントが紐づいている必要があります。" },
        { status: 400 },
      );
    }

    const status = calculateEventStatus({
      start_period: review.event.start_period,
      end_period: review.event.end_period,
      first_voting_start_period: review.event.first_voting_start_period,
      first_voting_end_period: review.event.first_voting_end_period,
      second_voting_start_period: review.event.second_voting_start_period,
      second_voting_end_period: review.event.second_voting_end_period,
    });
    if (status !== EVENT_STATUS.VOTING) {
      return NextResponse.json(
        {
          message:
            "現在は投票期間ではありません。投票は投票期間中のみ可能です。",
        },
        { status: 400 },
      );
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
