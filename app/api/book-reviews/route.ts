import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateEventStatus,
  EVENT_STATUS,
} from "@/lib/constants/eventStatus";

// mypage向け - 指定したユーザIDの書評をすべて取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userId = Number(session?.user?.id);

    console.log("Fetching reviews for user ID:", userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.bookReview.findMany({
      where: {
        user_id: userId,
        deleted_flag: false,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 * 新規作成
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "[BookReview POST] Request body:",
      JSON.stringify(body, null, 2),
    );

    // 入力値の検証
    if (!body.user_id) {
      return NextResponse.json(
        { message: "user_id is required" },
        { status: 400 },
      );
    }
    if (!body.isbn) {
      return NextResponse.json(
        { message: "isbn is required" },
        { status: 400 },
      );
    }

    // eventが指定されている場合、存在確認
    let eventData = undefined;
    if (body.event_id) {
      const eventExists = await prisma.event.findUnique({
        where: { id: Number(body.event_id) },
      });
      if (!eventExists) {
        return NextResponse.json(
          { message: `Event with id ${body.event_id} not found` },
          { status: 400 },
        );
      }

      const status = calculateEventStatus({
        start_period: eventExists.start_period,
        end_period: eventExists.end_period,
        first_voting_start_period: eventExists.first_voting_start_period,
        first_voting_end_period: eventExists.first_voting_end_period,
        second_voting_start_period: eventExists.second_voting_start_period,
        second_voting_end_period: eventExists.second_voting_end_period,
      });
      if (status !== EVENT_STATUS.POSTING) {
        return NextResponse.json(
          { message: "Review posting period is not active" },
          { status: 400 },
        );
      }

      eventData = {
        connect: {
          id: Number(body.event_id),
        },
      };
    }

    // Bookが存在するか確認
    const bookExists = await prisma.book.findUnique({
      where: { isbn: body.isbn },
    });
    if (!bookExists) {
      return NextResponse.json(
        { message: `Book with isbn ${body.isbn} not found` },
        { status: 400 },
      );
    }

    const review = await prisma.bookReview.create({
      data: {
        user: {
          connect: {
            id: body.user_id,
          },
        },
        book: {
          connect: {
            isbn: body.isbn,
          },
        },
        ...(eventData && { event: eventData }),
        review: body.review,
        book_title: body.book_title,
        book_title_ruby: body.book_title_ruby || null,
        author: body.author || null,
        author_ruby: body.author_ruby || null,
        all_pages: body.all_pages || null,
        publishers: body.publishers || null,
        book_height_size: body.book_height_size || null,
        book_width_size: body.book_width_size || null,
        caption: body.caption || null,
        evaluations_status: body.evaluations_status,
        evaluations_count: body.evaluations_count || 0,
        nickname: body.nickname,
        address: body.address,
        age: body.age,
        gender: body.gender,
        self_introduction: body.self_introduction,
        color: body.color,
        pattern: body.pattern,
        pattern_color: body.pattern_color,
        draft_flag: body.draft_flag || false,
      },
    });

    console.log(
      "[BookReview POST] Successfully created review with id:",
      review.id,
    );
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[BookReview POST] Error:", error);
    return NextResponse.json(
      {
        message: "Failed to create review",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reviews
 * 論理削除
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    await prisma.bookReview.update({
      where: { id: body.id },
      data: {
        deleted_flag: true,
      },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete review" },
      { status: 500 },
    );
  }
}
