import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/reviews
 * 更新
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "[BookReview PUT] Request body:",
      JSON.stringify(body, null, 2),
    );

    if (!body.id && !body.bookReview_id) {
      return NextResponse.json(
        { message: "id or bookReview_id is required" },
        { status: 400 },
      );
    }

    const reviewId = body.id || body.bookReview_id;

    const review = await prisma.bookReview.update({
      where: { id: reviewId },
      data: {
        review: body.review,
        color: body.color,
        pattern: body.pattern,
        pattern_color: body.pattern_color || body.patternColor,
        draft_flag: body.draft_flag,
      },
    });

    console.log(
      "[BookReview PUT] Successfully updated review with id:",
      review.id,
    );
    return NextResponse.json(review);
  } catch (error) {
    console.error("[BookReview PUT] Error:", error);
    return NextResponse.json(
      {
        message: "Failed to update review",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
