import { prisma } from "@/lib/prisma";
import { logBatchInfo, logBatchSuccess, logBatchError } from "./logger";

/**
 * 公開終了日時に達したお知らせを自動で非公開にするバッチ処理
 */
export async function updateExpiredNotifications() {
  const startTime = Date.now();

  try {
    logBatchInfo("お知らせ公開終了バッチ処理を開始します");

    const now = new Date();

    const result = await prisma.notification.updateMany({
      where: {
        public_flag: true,
        public_end_date: {
          not: null,
          lte: now, // 現在時刻以下
        },
        deleted_flag: false,
      },
      data: {
        public_flag: false,
        updated_at: now,
      },
    });

    const duration = Date.now() - startTime;
    logBatchSuccess(
      `${result.count}件のお知らせを非公開にしました (${duration}ms)`,
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logBatchError(
      `バッチ処理でエラーが発生しました: ${error instanceof Error ? error.message : String(error)} (${duration}ms)`,
    );
    throw error;
  }
}
