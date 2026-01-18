import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/elephant_db";

console.log("Connecting to database with connectionString:", connectionString);

const pool = new Pool({
  connectionString,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function seedNotifications() {
  console.log("🌱 テストデータの挿入を開始します...");

  try {
    // 既存データをクリア（開発環境のみ）
    console.log("🗑️ 既存データをクリア中...");
    await prisma.notificationFile.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.admin.deleteMany({});
    console.log("✅ 既存データをクリアしました");

    // Admin を作成
    const admin = await prisma.admin.create({
      data: {
        email: "admin@example.com",
        password: "password-12345",
      },
    });
    console.log("✅ Admin を作成しました");

    // File を作成（ダミー画像パス）
    const file = await prisma.file.create({
      data: {
        name: "notification-image",
        data_path: "/top/image.png",
        type: "image/png",
      },
    });
    console.log("✅ File を作成しました");

    // News （notification_type = 0）を複数件作成
    console.log("📰 ニュースデータを挿入中...");
    const newsData = [
      {
        title: "第１回文庫Xが開催されました！",
        detail: "多くの参加者にご来場いただきありがとうございました。",
      },
      {
        title: "新しい書籍が追加されました",
        detail: "図書館に新しい書籍が10冊追加されました。",
      },
      {
        title: "イベント開催のお知らせ",
        detail: "来月のイベント開催予定をお知らせします。",
      },
      {
        title: "メンテナンスのお知らせ",
        detail:
          "システムメンテナンスのため、一時的にサービスが利用できません。",
      },
      {
        title: "利用規約が更新されました",
        detail: "新しい利用規約が適用されました。ご確認ください。",
      },
    ];

    for (let i = 0; i < newsData.length; i++) {
      const newsNotification = await prisma.notification.create({
        data: {
          admin_id: admin.id,
          title: newsData[i].title,
          detail: newsData[i].detail,
          public_flag: true,
          public_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          notification_type: 0,
          draft_flag: false,
        },
      });

      // NotificationFile を関連付け
      await prisma.notificationFile.create({
        data: {
          file_id: file.id,
          notification_id: newsNotification.id,
          sort_order: 0,
        },
      });
    }
    console.log(`✅ ${newsData.length} 件のニュースデータを挿入しました`);

    // Donation （notification_type = 1）を複数件作成
    console.log("🎁 寄贈データを挿入中...");
    const donationData = [
      {
        title: "田中様よりご寄付をいただきました！",
        detail: "ご寄付ありがとうございます。大切に利用させていただきます。",
      },
      {
        title: "山田様から書籍のご寄付をいただきました",
        detail: "貴重な書籍をご寄付いただきありがとうございます。",
      },
      {
        title: "鈴木様からの寄贈",
        detail: "図書館の充実にご協力ありがとうございます。",
      },
      {
        title: "佐藤様より本をご寄付いただきました",
        detail: "多くの利用者に読んでいただきたいと思います。",
      },
      {
        title: "伊藤様からのご寄贈",
        detail: "温かいご支援をいただきありがとうございます。",
      },
    ];

    for (let i = 0; i < donationData.length; i++) {
      const donationNotification = await prisma.notification.create({
        data: {
          admin_id: admin.id,
          title: donationData[i].title,
          detail: donationData[i].detail,
          public_flag: true,
          public_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          notification_type: 1,
          draft_flag: false,
        },
      });

      // NotificationFile を関連付け
      await prisma.notificationFile.create({
        data: {
          file_id: file.id,
          notification_id: donationNotification.id,
          sort_order: 0,
        },
      });
    }
    console.log(`✅ ${donationData.length} 件の寄贈データを挿入しました`);

    console.log("🎉 テストデータの挿入が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedNotifications();
