import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/reviews
 * 更新
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { message: "id is required" },
        { status: 400 }
      );
    }

    const review = await prisma.bookReview.update({
      where: { id: body.id },
      data: {
        review: body.review,
        caption: body.caption,
        evaluations_status: body.evaluations_status,
        evaluations_count: body.evaluations_count,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update review" },
      { status: 500 }
    );
  }
}
