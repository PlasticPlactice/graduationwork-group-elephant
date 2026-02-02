import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureAdmin() {
  const existing = await prisma.admin.findFirst({
    where: { deleted_flag: false },
  });
  if (existing) return existing;

  const password = await bcrypt.hash("password", 10);
  return prisma.admin.create({
    data: {
      email: "admin@example.com",
      password,
    },
  });
}

async function main() {
  const admin = await ensureAdmin();

  const now = new Date();
  const items = [
    {
      title: "文庫Xイベントの投票が始まりました",
      detail:
        "投票期間中です。気になる書評に投票してみましょう。",
      notification_type: 0,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      title: "文庫Xイベントの結果を公開しました",
      detail:
        "今回選ばれた書評を公開しました。ぜひご覧ください。",
      notification_type: 0,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      title: "新しいお知らせを掲載しました",
      detail:
        "最新のイベント情報を更新しました。",
      notification_type: 0,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
    },
    {
      title: "○○様より本を寄贈いただきました",
      detail:
        "温かいご支援ありがとうございます。大切に活用させていただきます。",
      notification_type: 1,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      title: "寄贈図書が小児病棟へ届きました",
      detail:
        "子どもたちの読書体験に役立てられています。",
      notification_type: 1,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
    },
    {
      title: "新しい寄贈情報を更新しました",
      detail:
        "寄贈いただいた本の情報を公開しました。",
      notification_type: 1,
      public_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6),
    },
  ];

  await prisma.notification.createMany({
    data: items.map((item) => ({
      admin_id: admin.id,
      title: item.title,
      detail: item.detail,
      public_flag: true,
      notification_type: item.notification_type,
      draft_flag: false,
      public_date: item.public_date,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
