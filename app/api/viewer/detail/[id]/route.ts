import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

// 書評一つだけ取得
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const { params } = context;
    const { id } = await params;

    const bookReviewId = Number(id);

    if (Number.isNaN(bookReviewId)) {
      return NextResponse.json(
        { message: "Invalid review id" },
        { status: 400 }
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
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}
