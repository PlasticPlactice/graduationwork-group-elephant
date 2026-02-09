/**
 * イベントステータスマイグレーションスクリプト
 *
 * 既存のイベントデータを新しい6段階ステータス（0-5）に移行します。
 * 各イベントの日時フィールドを基に適切なステータスを自動計算し、
 * public_flagも連動して更新します。
 *
 * 実行方法:
 * npx ts-node prisma/migrate-event-status.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  calculateEventStatus,
  isPublicStatus,
} from "../lib/constants/eventStatus";

const prisma = new PrismaClient();

async function migrateEventStatus() {
  console.log("🚀 イベントステータスマイグレーション開始...\n");

  try {
    // 削除されていない全イベントを取得
    const events = await prisma.event.findMany({
      where: {
        deleted_flag: false,
      },
      select: {
        id: true,
        title: true,
        status: true,
        public_flag: true,
        start_period: true,
        end_period: true,
        first_voting_start_period: true,
        first_voting_end_period: true,
        second_voting_start_period: true,
        second_voting_end_period: true,
      },
    });

    console.log(`📊 対象イベント数: ${events.length}件\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      // 日時ベースで新しいステータスを計算
      const newStatus = calculateEventStatus({
        start_period: event.start_period,
        end_period: event.end_period,
        first_voting_start_period: event.first_voting_start_period,
        first_voting_end_period: event.first_voting_end_period,
        second_voting_start_period: event.second_voting_start_period,
        second_voting_end_period: event.second_voting_end_period,
      });

      // public_flag を計算
      const newPublicFlag = isPublicStatus(newStatus);

      // 変更が必要かチェック
      if (event.status !== newStatus || event.public_flag !== newPublicFlag) {
        await prisma.event.update({
          where: { id: event.id },
          data: {
            status: newStatus,
            public_flag: newPublicFlag,
            updated_at: new Date(),
          },
        });

        console.log(
          `✅ イベント「${event.title}」(ID:${event.id}): ` +
            `status ${event.status} → ${newStatus}, ` +
            `public_flag ${event.public_flag} → ${newPublicFlag}`,
        );
        updatedCount++;
      } else {
        console.log(
          `⏭️  イベント「${event.title}」(ID:${event.id}): 変更不要 (status=${event.status}, public_flag=${event.public_flag})`,
        );
        skippedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✨ マイグレーション完了");
    console.log(`   - 更新: ${updatedCount}件`);
    console.log(`   - スキップ: ${skippedCount}件`);
    console.log(`   - 合計: ${events.length}件`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ マイグレーション中にエラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
migrateEventStatus().catch((error) => {
  console.error(error);
  process.exit(1);
});
