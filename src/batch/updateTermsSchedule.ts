import { prisma } from "@/lib/prisma";
import {
  logBatchInfo,
  logBatchSuccess,
  logBatchError,
  logBatchWarn,
} from "./logger";

/**
 * スケジュール予約日時に達した利用規約を自動で公開するバッチ処理
 */
export async function updateTermsSchedule() {
  const startTime = Date.now();

  try {
    logBatchInfo("利用規約スケジュール適用バッチ処理を開始します");

    const now = new Date();

    // 1. scheduled_applied_at が現在時刻以下かつ public_flag=false の Terms を取得
    const termsToApply = await prisma.terms.findMany({
      where: {
        public_flag: false,
        scheduled_applied_at: {
          not: null,
          lte: now,
        },
        deleted_flag: false,
      },
    });

    if (termsToApply.length === 0) {
      logBatchInfo("適用対象の利用規約はありません");
      return { count: 0 };
    }

    logBatchInfo(
      `${termsToApply.length}件の利用規約を適用対象として検出しました`,
    );

    // 2. 既に public_flag=true の Terms を非公開に更新
    const updateOldTermsResult = await prisma.terms.updateMany({
      where: {
        public_flag: true,
        deleted_flag: false,
      },
      data: {
        public_flag: false,
        updated_at: now,
      },
    });

    logBatchInfo(
      `${updateOldTermsResult.count}件の既存公開利用規約を非公開にしました`,
    );

    // 3. 適用対象の Terms を公開に更新
    const updateResult = await prisma.terms.updateMany({
      where: {
        id: {
          in: termsToApply.map((t) => t.id),
        },
      },
      data: {
        public_flag: true,
        applied_at: now,
        updated_at: now,
      },
    });

    const duration = Date.now() - startTime;
    logBatchSuccess(
      `${updateResult.count}件の利用規約をスケジュール通り適用しました (${duration}ms)`,
    );

    return updateResult;
  } catch (error) {
    const duration = Date.now() - startTime;
    logBatchError(
      `バッチ処理でエラーが発生しました: ${error instanceof Error ? error.message : String(error)} (${duration}ms)`,
    );
    throw error;
  }
}
