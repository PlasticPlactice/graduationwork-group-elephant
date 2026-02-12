import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api/authMiddleware";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const reviewId = Number(id);

    if (Number.isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const review = await prisma.bookReview.findFirst({
      where: {
        id: reviewId,
        deleted_flag: false,
      },
      select: {
        id: true,
        book_title: true,
        author: true,
        publishers: true,
        isbn: true,
        nickname: true,
        age: true,
        address: true,
        self_introduction: true,
        color: true,
        pattern: true,
        pattern_color: true,
        evaluations_status: true,
        evaluations_count: true,
        review: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to fetch review detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await context.params;
    const reviewId = Number(id);

    if (Number.isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const review = body?.review;
    const color = body?.color;
    const patternColor = body?.pattern_color;

    const hasReview = review !== undefined;
    const hasColor = color !== undefined;
    const hasPatternColor = patternColor !== undefined;

    if (!hasReview && !hasColor && !hasPatternColor) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }
    if (hasReview && typeof review !== "string") {
      return NextResponse.json(
        { error: "Invalid review body" },
        { status: 400 },
      );
    }
    if (hasColor && typeof color !== "string") {
      return NextResponse.json(
        { error: "Invalid color" },
        { status: 400 },
      );
    }
    if (hasPatternColor && typeof patternColor !== "string") {
      return NextResponse.json(
        { error: "Invalid pattern_color" },
        { status: 400 },
      );
    }

    const existing = await prisma.bookReview.findFirst({
      where: {
        id: reviewId,
        deleted_flag: false,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updated = await prisma.bookReview.update({
      where: { id: reviewId },
      data: {
        ...(hasReview ? { review } : {}),
        ...(hasColor ? { color } : {}),
        ...(hasPatternColor ? { pattern_color: patternColor } : {}),
      },
      select: { id: true, review: true, color: true, pattern_color: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update review detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
