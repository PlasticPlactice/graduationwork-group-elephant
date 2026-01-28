import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const user = (session as Session | null)?.user as { id: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const messageId = Number(id);

    if (isNaN(messageId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 指定されたUserMessageを既読にする
    await prisma.userMessage.updateMany({
      where: {
        id: messageId,
        user_id: Number(user.id), // 本人のメッセージのみ更新可能
      },
      data: {
        is_read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
