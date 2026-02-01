/**
 * バッチ処理の動作テストスクリプト
 * 実行: npx tsx src/batch/test-batch.ts
 */

import { updateExpiredNotifications } from "./updateNotificationStatus";
import { logBatchInfo, logBatchSuccess, logBatchError } from "./logger";

async function testBatch() {
  logBatchInfo("=== バッチ処理テスト開始 ===");

  try {
    // 1. 現在のお知らせ状況を確認
    const { prisma } = await import("@/lib/prisma");

    const beforeCount = await prisma.notification.count({
      where: { public_flag: true },
    });
    logBatchInfo(`公開中のお知らせ数: ${beforeCount}件`);

    // 2. バッチ処理を実行
    logBatchInfo("バッチ処理を実行します...");
    await updateExpiredNotifications();

    // 3. 処理後のお知らせ状況を確認
    const afterCount = await prisma.notification.count({
      where: { public_flag: true },
    });
    logBatchInfo(`処理後の公開中のお知らせ数: ${afterCount}件`);

    logBatchSuccess("テスト完了しました");
  } catch (error) {
    logBatchError(
      `テスト実行中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  } finally {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$disconnect();
  }
}

testBatch();
