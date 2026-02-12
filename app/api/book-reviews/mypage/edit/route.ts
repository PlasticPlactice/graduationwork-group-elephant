import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateEventStatus,
  EVENT_STATUS,
} from "@/lib/constants/eventStatus";

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

    const existingReview = await prisma.bookReview.findUnique({
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

    if (!existingReview) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    if (existingReview.event_id && existingReview.event) {
      const status = calculateEventStatus({
        start_period: existingReview.event.start_period,
        end_period: existingReview.event.end_period,
        first_voting_start_period:
          existingReview.event.first_voting_start_period,
        first_voting_end_period: existingReview.event.first_voting_end_period,
        second_voting_start_period:
          existingReview.event.second_voting_start_period,
        second_voting_end_period: existingReview.event.second_voting_end_period,
      });
      if (status !== EVENT_STATUS.POSTING) {
        return NextResponse.json(
          {
            message:
              "現在は書評投稿期間ではありません。投稿は投稿期間中のみ可能です。",
          },
          { status: 400 },
        );
      }
    }

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
