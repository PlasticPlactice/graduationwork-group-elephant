import { prisma } from "@/lib/prisma";
import {
  logBatchInfo,
  logBatchSuccess,
  logBatchError,
  logBatchWarn,
} from "./logger";

/**
 * イベントのステータスを日時に基づいて自動更新し、参加者に通知を送信するバッチ処理
 */
export async function updateEventStatus() {
  const startTime = Date.now();

  try {
    logBatchInfo("イベントステータス自動更新バッチ処理を開始します");

    const now = new Date();
    let totalUpdated = 0;
    let totalNotified = 0;

    // 管理者を取得（通知の送信元として使用）
    const admin = await prisma.admin.findFirst({
      where: { deleted_flag: false },
      orderBy: { id: "asc" },
    });

    if (!admin) {
      logBatchWarn("管理者が見つからないため、通知送信をスキップします");
    }

    // 1. 開催前 → 一次審査中 (status: 0 → 1)
    logBatchInfo("一次審査開始イベントを検索中...");
    const toFirstVotingEvents = await prisma.event.findMany({
      where: {
        status: 0,
        first_voting_start_period: { lte: now },
        deleted_flag: false,
        public_flag: true,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toFirstVotingEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: 1,
              updated_at: now,
            },
          });

          // 参加者に通知送信
          const userIds = Array.from(
            new Set(event.bookReviews.map((r) => r.user_id)),
          );

          if (admin && userIds.length > 0) {
            const messageContent = `『${event.title}』の書評投稿期間が開始されました。`;

            const newMessage = await tx.message.create({
              data: {
                admin_id: admin.id,
                message: messageContent,
                type: 0, // 通常メッセージ
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

            totalNotified += userIds.length;
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 一次審査中に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 一次審査中に更新 (参加者なしまたは管理者不在のため通知なし)`,
            );
          }
        });

        totalUpdated++;
      } catch (error) {
        logBatchError(
          `イベント「${event.title}」(ID:${event.id})の更新中にエラー: ${error instanceof Error ? error.message : String(error)}`,
        );
        // エラーがあっても次のイベント処理を継続
      }
    }

    // 2. 一次審査中 → 二次審査中 (status: 1 → 2)
    logBatchInfo("二次審査開始イベントを検索中...");
    const toSecondVotingEvents = await prisma.event.findMany({
      where: {
        status: 1,
        second_voting_start_period: { lte: now },
        deleted_flag: false,
        public_flag: true,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toSecondVotingEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: 2,
              updated_at: now,
            },
          });

          // 参加者に通知送信
          const userIds = Array.from(
            new Set(event.bookReviews.map((r) => r.user_id)),
          );

          if (admin && userIds.length > 0) {
            const messageContent = `『${event.title}』の投票期間が開始されました。`;

            const newMessage = await tx.message.create({
              data: {
                admin_id: admin.id,
                message: messageContent,
                type: 0, // 通常メッセージ
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

            totalNotified += userIds.length;
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 二次審査中に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 二次審査中に更新 (参加者なしまたは管理者不在のため通知なし)`,
            );
          }
        });

        totalUpdated++;
      } catch (error) {
        logBatchError(
          `イベント「${event.title}」(ID:${event.id})の更新中にエラー: ${error instanceof Error ? error.message : String(error)}`,
        );
        // エラーがあっても次のイベント処理を継続
      }
    }

    // 3. 二次審査中 → 終了済 (status: 2 → 3)
    logBatchInfo("終了イベントを検索中...");
    const toFinishedEvents = await prisma.event.findMany({
      where: {
        status: 2,
        second_voting_end_period: { lte: now },
        deleted_flag: false,
        public_flag: true,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toFinishedEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: 3,
              updated_at: now,
            },
          });

          // 参加者に通知送信
          const userIds = Array.from(
            new Set(event.bookReviews.map((r) => r.user_id)),
          );

          if (admin && userIds.length > 0) {
            const messageContent = `『${event.title}』が終了しました。`;

            const newMessage = await tx.message.create({
              data: {
                admin_id: admin.id,
                message: messageContent,
                type: 0, // 通常メッセージ
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

            totalNotified += userIds.length;
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 終了済に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 終了済に更新 (参加者なしまたは管理者不在のため通知なし)`,
            );
          }
        });

        totalUpdated++;
      } catch (error) {
        logBatchError(
          `イベント「${event.title}」(ID:${event.id})の更新中にエラー: ${error instanceof Error ? error.message : String(error)}`,
        );
        // エラーがあっても次のイベント処理を継続
      }
    }

    const duration = Date.now() - startTime;
    logBatchSuccess(
      `合計${totalUpdated}件のイベントステータスを更新し、${totalNotified}件の通知を送信しました (${duration}ms)`,
    );

    return {
      totalUpdated,
      totalNotified,
      toFirstVoting: toFirstVotingEvents.length,
      toSecondVoting: toSecondVotingEvents.length,
      toFinished: toFinishedEvents.length,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logBatchError(
      `バッチ処理でエラーが発生しました: ${error instanceof Error ? error.message : String(error)} (${duration}ms)`,
    );
    throw error;
  }
}
