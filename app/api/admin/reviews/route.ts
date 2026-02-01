import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function GET() {
  try {
    // セッションチェック（管理者権限の確認）
    const session = await getServerSession(authOptions) as Session | null;
    const user = session?.user as
      | { id: string; role: string }
      | undefined;

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // データの取得
    const reviews = await prisma.bookReview.findMany({
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        book_title: true,
        nickname: true,
        evaluations_status: true,
        evaluations_count: true,
        review: true,
        author: true,
        publishers: true,
        isbn: true,
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
