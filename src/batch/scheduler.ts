import cron from "node-cron";
import { updateExpiredNotifications } from "./updateNotificationStatus";
import { logBatchInfo, logBatchSuccess, logBatchError } from "./logger";

/**
 * 起動時に即座にバッチ処理を実行し、その後は定期実行（毎時間0分）
 */
export async function startNotificationScheduler() {
  try {
    // アプリ起動時に即座に実行
    logBatchInfo("アプリケーション起動時のバッチ処理を実行します");
    await updateExpiredNotifications();

    // その後、定期的に実行（毎時間0分）
    // 形式: '0 * * * *' = 毎時間0分、'*/15 * * * *' = 15分ごと
    cron.schedule("0 * * * *", async () => {
      logBatchInfo("スケジュール実行されたバッチ処理を実行します");
      try {
        await updateExpiredNotifications();
      } catch (error) {
        logBatchError(
          `スケジュール実行中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    logBatchSuccess("お知らせスケジューラーを開始しました（毎時間0分に実行）");
  } catch (error) {
    logBatchError(
      `スケジューラー初期化でエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}
