import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BookReviewDetail } from "@/lib/types/bookReview";

// 書評一つだけ取得
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: { id?: string };
    } | null;

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    const { id } = await params;

    const bookReviewId = Number(id);

    if (Number.isNaN(bookReviewId)) {
      return NextResponse.json(
        { message: "Invalid review id" },
        { status: 400 },
      );
    }

    const userId = Number(session!.user!.id);

    const review: BookReviewDetail | null = await prisma.bookReview.findFirst({
      where: {
        id: bookReviewId,
        user_id: userId, // 他人のレビュー防止
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
