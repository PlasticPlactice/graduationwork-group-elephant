import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // セッションチェック（管理者権限の確認）
    const session = await getServerSession(authOptions);
    const user = (session as { user?: { id: string; role: string } } | null)?.user as
      | { id: string; role: string }
      | undefined;

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminId = Number(user.id);

    const { reviewIds, message } = await req.json();

    // バリデーション
    if (
      !reviewIds ||
      !Array.isArray(reviewIds) ||
      reviewIds.length === 0 ||
      !message
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    // 対象の書評からユーザーIDを取得（重複排除）
    const reviews = await prisma.bookReview.findMany({
      where: { id: { in: reviewIds } },
      select: { user_id: true },
    });

    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));

    if (userIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "対象のユーザーが見つかりませんでした。ページを更新して最新のデータを選択し直してください。",
        },
        { status: 400 },
      );
    }

    // トランザクションでメッセージとユーザー紐付けを作成
    await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          admin_id: adminId,
          message: message,
          type: 0, // 0:通常メッセージ
          draft_flag: false, // 即時送信のためドラフトではない
        },
      });

      await tx.userMessage.createMany({
        data: userIds.map((userId) => ({
          user_id: userId,
          message_id: newMessage.id,
          is_read: false,
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
