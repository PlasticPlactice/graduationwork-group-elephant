import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ------------------------------------------------
  // 作成したいユーザーの情報（ここを変更してください）
  const accountId = "0000000000"; 
  const password = "pass@000";
  const nickname = "卒展タロウ";
  // ------------------------------------------------

  console.log(`一般ユーザー (${accountId}) を作成中...`);
  // 安全のため接続先ホスト名だけ表示
  console.log(`接続先DB: ${process.env.DATABASE_URL?.split("@")[1]}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { account_id: accountId },
    update: {
        // 既に存在する場合にパスワード等を更新したい場合はコメントを外す
        // password: hashedPassword,
    },
    create: {
      account_id: accountId,
      password: hashedPassword,
      nickname: nickname,
      
      // 必須項目のデフォルト値
      // 必要に応じて変更してください
      address: "岩手県",
      sub_address: "盛岡市",
      age: 20,
      gender: 1, // 1:男性, 2:女性 (システムの定義に合わせる)
      self_introduction: "卒展用アカウントです。よろしくお願いします。",
      color: "#3B82F6",     // テーマカラーなど
      pattern: "default",      // 背景パターンなど
      pattern_color: "#FFFFFF",
      user_status: 0,    // 1:通常(Active)
    },
  });

  console.log(`✅ ユーザー作成完了: ID=${user.id}, AccountID=${user.account_id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
