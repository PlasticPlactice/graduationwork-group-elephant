import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const userSession = session?.user;

  // 認証チェック
  if (!userSession?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 管理者権限チェック
  if (userSession.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // ユーザー詳細情報取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        account_id: true,
        nickname: true,
        age: true,
        gender: true,
        address: true,
        sub_address: true,
        self_introduction: true,
        user_status: true,
        deleted_flag: true,
        created_at: true,
        updated_at: true,
        bookReviews: {
          select: {
            id: true,
            review: true,
            book_title: true,
            author: true,
            evaluations_status: true,
            evaluations_count: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
