import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
import { USER_STATUS } from "@/lib/constants/userStatus";

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string };
  } | null;
  const sessionUser = session?.user;

  if (!sessionUser?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
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
        { message: "退会理由を入力してください" },
        { status: 400 },
      );
    }

    const userId = parseInt(sessionUser.id);

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // deleted_flagをtrueに更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        deleted_flag: true,
        user_status: USER_STATUS.WITHDRAWN,
        user_stop_reason: reason,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Account successfully deleted",
      success: true,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
