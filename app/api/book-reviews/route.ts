import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// mypage向け - 指定したユーザIDの書評をすべて取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userId = Number(session?.user?.id);

    console.log("Fetching reviews for user ID:", userId);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 }
      );
    }

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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
      { status: 500 }
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

    const review = await prisma.bookReview.create({
      data: {
        user: {
          connect: {
            id: body.user_id
          },
        },
        book: {
          connect: {
            isbn: body.isbn
          },
        },
        event_id: body.event_id,
        review: body.review,
        book_title: body.book_title,
        book_title_ruby: body.book_title_ruby,
        author: body.author,
        author_ruby: body.author_ruby,
        all_pages: body.all_page,
        publishers: body.publishers,
        book_height_size: body.bool_height_size,
        book_width_size: body.book_width_size,
        caption: body.caption,
        evaluations_status: body.evaluations_status,
        evaluations_count: body.evaluations_count,
        nickname: body.nickname,
        address: body.address,
        age: body.age,
        gender: body.gender,
        self_introduction: body.self_introduction,
        color: body.color,
        pattern: body.pattern,
        pattern_color: body.pattern_color,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 500 }
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
      return NextResponse.json(
        { message: "id is required" },
        { status: 400 }
      );
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
      { status: 500 }
    );
  }
}
