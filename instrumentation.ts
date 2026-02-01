/**
 * Instrumentation: Next.js アプリケーション初期化時に実行される
 * バッチスケジューラーを起動する
 *
 * 参考: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // お知らせスケジューラーを起動（起動時即実行＋定期実行）
      const { startNotificationScheduler } =
        await import("./src/batch/scheduler");
      await startNotificationScheduler();
    } catch (error) {
      console.error("Failed to start notification scheduler:", error);
      // スケジューラー起動失敗してもアプリケーションは継続
    }
  }
}

export const runtime = "nodejs";
