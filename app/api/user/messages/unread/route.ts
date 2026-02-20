import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export const runtime = "nodejs";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 審査通過(type=1)かつ未読のメッセージを取得
    // 1ユーザーにつき1件ずつ表示する想定で findFirst を使用
    const unreadMessage = await prisma.userMessage.findFirst({
      where: {
        user_id: Number(user.id),
        is_read: false,
        message: {
          type: 1, // 審査通過
        },
      },
      include: {
        message: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ unreadMessage });
  } catch (error) {
    console.error("Failed to fetch unread message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
