import { prisma } from "@/lib/prisma";
import {
  logBatchInfo,
  logBatchSuccess,
  logBatchError,
  logBatchWarn,
} from "./logger";
import { EVENT_STATUS } from "@/lib/constants/eventStatus";

/**
 * イベントのステータスを日時に基づいて自動更新し、参加者に通知を送信するバッチ処理
 *
 * ステータス遷移フロー（6段階）:
 * 0 (開催前) → 1 (投稿期間) → 2 (審査期間) → 3 (投票期間) → 4 (閲覧期間) → 5 (終了)
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

    // 1. 開催前 → 投稿期間 (status: 0 → 1)
    logBatchInfo("投稿期間開始イベントを検索中...");
    const toPostingEvents = await prisma.event.findMany({
      where: {
        status: EVENT_STATUS.BEFORE_START,
        start_period: { lte: now },
        first_voting_start_period: { lte: now },
        deleted_flag: false,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toPostingEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新 + public_flag を true に
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: EVENT_STATUS.POSTING,
              public_flag: true,
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
              `イベント「${event.title}」(ID:${event.id}): 投稿期間に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 投稿期間に更新 (参加者なしまたは管理者不在のため通知なし)`,
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

    // 2. 投稿期間 → 審査期間 (status: 1 → 2)
    logBatchInfo("審査期間開始イベントを検索中...");
    const toFirstReviewEvents = await prisma.event.findMany({
      where: {
        status: EVENT_STATUS.POSTING,
        first_voting_end_period: { lte: now },
        deleted_flag: false,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toFirstReviewEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新（public_flagはtrueのまま）
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: EVENT_STATUS.FIRST_REVIEW,
              updated_at: now,
            },
          });

          // 参加者に通知送信
          const userIds = Array.from(
            new Set(event.bookReviews.map((r) => r.user_id)),
          );

          if (admin && userIds.length > 0) {
            const messageContent = `『${event.title}』の書評投稿期間が終了しました。審査が開始されます。`;

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
              `イベント「${event.title}」(ID:${event.id}): 審査期間に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 審査期間に更新 (参加者なしまたは管理者不在のため通知なし)`,
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

    // 3. 審査期間 → 投票期間 (status: 2 → 3)
    logBatchInfo("投票期間開始イベントを検索中...");
    const toVotingEvents = await prisma.event.findMany({
      where: {
        status: EVENT_STATUS.FIRST_REVIEW,
        second_voting_start_period: { lte: now },
        deleted_flag: false,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toVotingEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新（public_flagはtrueのまま）
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: EVENT_STATUS.VOTING,
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
              `イベント「${event.title}」(ID:${event.id}): 投票期間に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 投票期間に更新 (参加者なしまたは管理者不在のため通知なし)`,
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

    // 4. 投票期間 → 閲覧期間 (status: 3 → 4)
    logBatchInfo("閲覧期間開始イベントを検索中...");
    const toViewingEvents = await prisma.event.findMany({
      where: {
        status: EVENT_STATUS.VOTING,
        second_voting_end_period: { lte: now },
        deleted_flag: false,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toViewingEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新（public_flagはtrueのまま）
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: EVENT_STATUS.VIEWING,
              updated_at: now,
            },
          });

          // 参加者に通知送信
          const userIds = Array.from(
            new Set(event.bookReviews.map((r) => r.user_id)),
          );

          if (admin && userIds.length > 0) {
            const messageContent = `『${event.title}』の投票期間が終了しました。`;

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
              `イベント「${event.title}」(ID:${event.id}): 閲覧期間に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 閲覧期間に更新 (参加者なしまたは管理者不在のため通知なし)`,
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

    // 5. 閲覧期間 → 終了 (status: 4 → 5)
    logBatchInfo("終了イベントを検索中...");
    const toEndedEvents = await prisma.event.findMany({
      where: {
        status: EVENT_STATUS.VIEWING,
        end_period: { lte: now },
        deleted_flag: false,
      },
      include: {
        bookReviews: {
          where: { deleted_flag: false },
          select: { user_id: true },
        },
      },
    });

    for (const event of toEndedEvents) {
      try {
        await prisma.$transaction(async (tx) => {
          // ステータス更新 + public_flag を false に
          await tx.event.update({
            where: { id: event.id },
            data: {
              status: EVENT_STATUS.ENDED,
              public_flag: false,
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
              `イベント「${event.title}」(ID:${event.id}): 終了に更新 → ${userIds.length}人に通知送信`,
            );
          } else {
            logBatchInfo(
              `イベント「${event.title}」(ID:${event.id}): 終了に更新 (参加者なしまたは管理者不在のため通知なし)`,
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
      toPosting: toPostingEvents.length,
      toFirstReview: toFirstReviewEvents.length,
      toVoting: toVotingEvents.length,
      toViewing: toViewingEvents.length,
      toEnded: toEndedEvents.length,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logBatchError(
      `バッチ処理でエラーが発生しました: ${error instanceof Error ? error.message : String(error)} (${duration}ms)`,
    );
    throw error;
  }
}
