import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  REVIEW_STATUS,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants/reviewStatus";
import { Session } from "next-auth";

export async function PATCH(req: Request) {
  try {
    // セッションチェック（管理者権限の確認）
    const session = (await getServerSession(authOptions)) as Session | null;
    const user = (session?.user as { id: string; role: string }) || undefined;

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminId = Number(user.id);

    const { reviewIds, status } = await req.json();

    // バリデーション
    if (!reviewIds || !Array.isArray(reviewIds) || typeof status !== "number") {
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

    await prisma.$transaction(async (tx) => {
      // 1. ステータス更新
      await tx.bookReview.updateMany({
        where: { id: { in: reviewIds } },
        data: { evaluations_status: status },
      });

      // 2. 通知メッセージの作成（評価前以外の場合）
      if (status !== REVIEW_STATUS.BEFORE && userIds.length > 0) {
        const statusLabel = REVIEW_STATUS_LABELS[status];
        const messageContent = `あなたの書評のステータスが「${statusLabel}」に変更されました。`;

        // ステータスに応じてメッセージタイプを決定
        const messageType = 1;

        const newMessage = await tx.message.create({
          data: {
            admin_id: adminId,
            message: messageContent,
            type: messageType,
            draft_flag: false,
          },
        });

        await tx.userMessage.createMany({
          data: userIds.map((userId) => ({
            user_id: userId,
            message_id: newMessage.id,
            is_read: false,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
