import { prisma } from "@/lib/prisma";
import { logBatchInfo, logBatchSuccess, logBatchError } from "./logger";

/**
 * 終了期間に達したイベントを自動で非公開にするバッチ処理
 */
export async function updateExpiredEvents() {
  const startTime = Date.now();

  try {
    logBatchInfo("イベント公開終了バッチ処理を開始します");

    const now = new Date();

    const result = await prisma.event.updateMany({
      where: {
        public_flag: true,
        end_period: {
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
      `${result.count}件のイベントを非公開にしました (${duration}ms)`,
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
