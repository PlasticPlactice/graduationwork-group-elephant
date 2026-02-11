import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/api/authMiddleware";
import type { Session } from "next-auth";

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
        nickname: true,
        age: true,
        address: true,
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

    if (typeof review !== "string") {
      return NextResponse.json(
        { error: "Invalid review body" },
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
      data: { review },
      select: { id: true, review: true },
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
