import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);

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
        user_status: 0, // 退会済みステータス
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
      { status: 500 }
    );
  }
}
