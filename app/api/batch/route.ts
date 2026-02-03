import { NextRequest, NextResponse } from "next/server";
import { updateExpiredNotifications } from "@/src/batch/updateNotificationStatus";
import { updateTermsSchedule } from "@/src/batch/updateTermsSchedule";
// TODO: feature/event-batch ブランチマージ後に有効化
// import { updateEventStatus } from "@/src/batch/updateEventStatus";
// import { updateExpiredEvents } from "@/src/batch/updateExpiredEvents";
import {
  logBatchInfo,
  logBatchSuccess,
  logBatchError,
} from "@/src/batch/logger";

/**
 * バッチ処理API エンドポイント
 *
 * POST /api/batch
 *
 * ヘッダー必須:
 *   Authorization: Bearer {BATCH_SECRET_TOKEN}
 *
 * 現在実行されるバッチ処理:
 *   1. updateExpiredNotifications() - 期限切れ通知の更新
 *   2. updateTermsSchedule() - 利用規約スケジュール更新
 *
 * TODO: feature/event-batch マージ後に追加予定:
 *   3. updateEventStatus() - イベントステータス自動更新
 *   4. updateExpiredEvents() - 期限切れイベント処理
 *
 * 使用方法（curlコマンド）:
 *   curl -X POST \
 *     -H "Authorization: Bearer YOUR_BATCH_SECRET_TOKEN" \
 *     http://162.43.4.61:8082/api/batch
 *
 * crontab 設定例（毎時0分に実行）:
 *   0 * * * * curl -X POST \
 *     -H "Authorization: Bearer YOUR_BATCH_SECRET_TOKEN" \
 *     http://162.43.4.61:8082/api/batch >> /var/log/batch.log 2>&1
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // ========================================
    // 1. トークン認証
    // ========================================
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const batchSecretToken = process.env.BATCH_SECRET_TOKEN;

    if (!batchSecretToken) {
      logBatchError("BATCH_SECRET_TOKEN が設定されていません");
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "BATCH_SECRET_TOKEN is not configured",
          timestamp,
        },
        { status: 500 },
      );
    }

    if (!token || token !== batchSecretToken) {
      logBatchError(
        `不正なトークンでのアクセス試行: ${token ? "トークンが一致しません" : "トークンが提供されていません"}`,
      );
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid or missing authentication token",
          timestamp,
        },
        { status: 401 },
      );
    }

    logBatchInfo("====== バッチ処理 API リクエスト開始 ======");
    logBatchInfo(`タイムスタンプ: ${timestamp}`);

    // ========================================
    // 2. バッチ処理を順序実行
    // ========================================
    const results = {
      updateExpiredNotifications: null as {
        success: boolean;
        duration: number;
      } | null,
      updateTermsSchedule: null as {
        success: boolean;
        duration: number;
      } | null,
      // TODO: feature/event-batch マージ後に有効化
      // updateEventStatus: null as { success: boolean; duration: number } | null,
      // updateExpiredEvents: null as {
      //   success: boolean;
      //   duration: number;
      // } | null,
    };

    // 2-1. 期限切れ通知の更新
    try {
      logBatchInfo("1/2: updateExpiredNotifications を実行中...");
      const t1 = Date.now();
      await updateExpiredNotifications();
      const duration = Date.now() - t1;
      results.updateExpiredNotifications = { success: true, duration };
      logBatchSuccess(`updateExpiredNotifications: 成功 (${duration}ms)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.updateExpiredNotifications = { success: false, duration: 0 };
      logBatchError(`updateExpiredNotifications: 失敗 - ${errorMsg}`);
    }

    // 2-2. 利用規約スケジュール更新
    try {
      logBatchInfo("2/2: updateTermsSchedule を実行中...");
      const t2 = Date.now();
      await updateTermsSchedule();
      const duration = Date.now() - t2;
      results.updateTermsSchedule = { success: true, duration };
      logBatchSuccess(`updateTermsSchedule: 成功 (${duration}ms)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.updateTermsSchedule = { success: false, duration: 0 };
      logBatchError(`updateTermsSchedule: 失敗 - ${errorMsg}`);
    }

    // TODO: feature/event-batch マージ後に有効化
    // // 2-3. イベントステータス自動更新
    // try {
    //   logBatchInfo("3/4: updateEventStatus を実行中...");
    //   const t3 = Date.now();
    //   await updateEventStatus();
    //   const duration = Date.now() - t3;
    //   results.updateEventStatus = { success: true, duration };
    //   logBatchSuccess(`updateEventStatus: 成功 (${duration}ms)`);
    // } catch (error) {
    //   const errorMsg = error instanceof Error ? error.message : String(error);
    //   results.updateEventStatus = { success: false, duration: 0 };
    //   logBatchError(`updateEventStatus: 失敗 - ${errorMsg}`);
    // }

    // TODO: feature/event-batch マージ後に有効化
    // // 2-4. 期限切れイベント処理
    // try {
    //   logBatchInfo("4/4: updateExpiredEvents を実行中...");
    //   const t4 = Date.now();
    //   await updateExpiredEvents();
    //   const duration = Date.now() - t4;
    //   results.updateExpiredEvents = { success: true, duration };
    //   logBatchSuccess(`updateExpiredEvents: 成功 (${duration}ms)`);
    // } catch (error) {
    //   const errorMsg = error instanceof Error ? error.message : String(error);
    //   results.updateExpiredEvents = { success: false, duration: 0 };
    //   logBatchError(`updateExpiredEvents: 失敗 - ${errorMsg}`);
    // }

    // ========================================
    // 3. 実行結果をまとめてレスポンス
    // ========================================
    const totalDuration = Date.now() - startTime;
    const successCount = Object.values(results).filter(
      (r) => r?.success,
    ).length;
    const totalBatchCount = 2; // TODO: feature/event-batch マージ後は 4 に変更
    const allSuccess = successCount === totalBatchCount;

    const response = {
      success: allSuccess,
      message: allSuccess
        ? "All batch processes completed successfully"
        : `${successCount}/${totalBatchCount} batch processes completed successfully`,
      timestamp,
      totalDurationMs: totalDuration,
      results,
    };

    logBatchInfo(`====== バッチ処理完了 ======`);
    logBatchInfo(`総実行時間: ${totalDuration}ms`);
    logBatchInfo(`成功数: ${successCount}/${totalBatchCount}`);
    logBatchSuccess("バッチ処理 API リクエスト終了");

    return NextResponse.json(response, {
      status: allSuccess ? 200 : 207, // 207 = Multi-Status (部分的成功)
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const totalDuration = Date.now() - startTime;

    logBatchError(`バッチ処理 API エラー: ${errorMsg}`);

    return NextResponse.json(
      {
        error: "Batch execution failed",
        message: errorMsg,
        timestamp,
        totalDurationMs: totalDuration,
      },
      { status: 500 },
    );
  }
}

/**
 * GET メソッドは許可しない
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Use POST /api/batch with Authorization header",
    },
    { status: 405 },
  );
}
