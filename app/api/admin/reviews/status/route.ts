import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  REVIEW_STATUS,
  REVIEW_STATUS_LABELS,
} from "@/lib/constants/reviewStatus";

export const runtime = "nodejs";
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

    const body = await req.json();
    const { reviewIds, status, action } = body;

    // バリデーション
    if (!reviewIds || !Array.isArray(reviewIds)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    // 対象の書評からユーザーIDを取得（重複排除）
    const reviews = await prisma.bookReview.findMany({
      where: { id: { in: reviewIds } },
      select: { id: true, user_id: true, evaluations_status: true },
    });

    const userIdsAll = Array.from(new Set(reviews.map((r) => r.user_id)));

    await prisma.$transaction(async (tx) => {
      if (action === "increment") {
        const maxStatus = Math.max(
          ...(Object.values(REVIEW_STATUS) as unknown as number[]),
        );
        const statusToUsers = new Map<number, Set<number>>();

        for (const r of reviews) {
          const newStatus = Math.min(
            (r.evaluations_status ?? 0) + 1,
            maxStatus,
          );
          await tx.bookReview.update({
            where: { id: r.id },
            data: { evaluations_status: newStatus },
          });

          if (!statusToUsers.has(newStatus))
            statusToUsers.set(newStatus, new Set());
          statusToUsers.get(newStatus)!.add(r.user_id);
        }

        // ステータスが評価前でないものについて、それぞれのステータスごとに通知を作成
        for (const [s, usersSet] of statusToUsers.entries()) {
          if (s === REVIEW_STATUS.BEFORE) continue;
          const statusLabel = REVIEW_STATUS_LABELS[s];
          const messageContent = `あなたの書評のステータスが「${statusLabel}」に変更されました。`;

          const newMessage = await tx.message.create({
            data: {
              admin_id: adminId,
              message: messageContent,
              type: 1,
              draft_flag: false,
            },
          });

          await tx.userMessage.createMany({
            data: Array.from(usersSet).map((userId) => ({
              user_id: userId,
              message_id: newMessage.id,
              is_read: false,
            })),
          });
        }
      } else {
        // 既存API互換: 全件を同一ステータスに更新
        if (typeof status !== "number") {
          throw new Error("Invalid status");
        }

        await tx.bookReview.updateMany({
          where: { id: { in: reviewIds } },
          data: { evaluations_status: status },
        });

        if (status !== REVIEW_STATUS.BEFORE && userIdsAll.length > 0) {
          const statusLabel = REVIEW_STATUS_LABELS[status];
          const messageContent = `あなたの書評のステータスが「${statusLabel}」に変更されました。`;

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
            data: userIdsAll.map((userId) => ({
              user_id: userId,
              message_id: newMessage.id,
              is_read: false,
            })),
          });
        }
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
