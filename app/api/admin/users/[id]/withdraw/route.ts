import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { USER_STATUS } from "@/lib/constants/userStatus";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string; role?: string };
  } | null;
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    let reason = "";
    try {
      const body = await req.json();
      reason = (body?.reason ?? "").trim();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    if (!reason) {
      return NextResponse.json(
        { message: "アカウント停止理由を入力してください" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.user_status === USER_STATUS.BAN) {
      return NextResponse.json(
        { message: "このユーザーは既にアカウント停止されています。" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        user_status: USER_STATUS.BAN,
        deleted_flag: true,
        user_stop_reason: reason,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "ユーザーをアカウント停止処理しました。",
    });
  } catch (error) {
    console.error("Admin account suspension error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
