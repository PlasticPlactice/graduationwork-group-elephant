import { updateExpiredNotifications } from "./updateNotificationStatus";
import { logBatchInfo, logBatchSuccess, logBatchError } from "./logger";

let cronTaskStarted = false;

/**
 * 起動時に即座にバッチ処理を実行し、その後は定期実行（毎時間0分）
 */
export async function startNotificationScheduler() {
  try {
    // すでに実行済みの場合はスキップ（複数回呼び出し防止）
    if (cronTaskStarted) {
      logBatchInfo("バッチスケジューラーはすでに起動済みです");
      return;
    }

    // アプリ起動時に即座に実行
    logBatchInfo("アプリケーション起動時のバッチ処理を実行します");
    await updateExpiredNotifications();

    // その後、定期的に実行（毎時間0分）
    // 形式: '0 * * * *' = 毎時間0分、'*/15 * * * *' = 15分ごと
    try {
      const cron = await import("node-cron");
      cron.default.schedule("0 * * * *", async () => {
        logBatchInfo("スケジュール実行されたバッチ処理を実行します");
        try {
          await updateExpiredNotifications();
        } catch (error) {
          logBatchError(
            `スケジュール実行中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
    } catch (cronError) {
      logBatchError(
        `node-cronの読み込みに失敗しました。定期実行は無効です: ${cronError instanceof Error ? cronError.message : String(cronError)}`,
      );
      // node-cronが失敗しても起動時実行は成功しているため、継続する
    }

    cronTaskStarted = true;
    logBatchSuccess("お知らせスケジューラーを開始しました（毎時間0分に実行）");
  } catch (error) {
    logBatchError(
      `スケジューラー初期化でエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}
