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
  // お好みのメールアドレスとパスワードに書き換えてください
  const email = "admin@example.com"; 
  const password = "pass@000";
  // ------------------------------------------------

  console.log(`管理者ユーザー (${email}) を作成中...`);
  console.log(`接続先DB: ${process.env.DATABASE_URL?.split("@")[1]}`); // 安全のためホスト名だけ表示

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
        // すでに存在する場合にパスワードを更新したいなら以下のコメントを外す
        // password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log(`✅ 管理者作成完了: ID=${admin.id}, Email=${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
