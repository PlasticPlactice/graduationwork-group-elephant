import { NextResponse } from "next/server";
// removed unused auth imports
import { prisma } from "@/lib/prisma";

// 書評一つだけ取得
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { params } = context;
    const { id } = await params;

    const bookReviewId = Number(id);

    if (Number.isNaN(bookReviewId)) {
      return NextResponse.json(
        { message: "Invalid review id" },
        { status: 400 },
      );
    }

    const review = await prisma.bookReview.findFirst({
      where: {
        id: bookReviewId,
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(review);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch review" },
      { status: 500 },
    );
  }
}
