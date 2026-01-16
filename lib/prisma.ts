import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

// Prismaクライアントのオプション（基本設定のみ、adapterなし）
const baseOptions: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as Prisma.LogLevel[])
      : (["error"] as Prisma.LogLevel[]),
};

// ビルド時は常にadapterなしのPrismaクライアントを作成
// 実行時（runtime）でDATABASE_URLがあれば、adapterを使用
let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // DATABASE_URLが設定されている場合のみadapterを使用（ビルド時はスキップ）
  if (connectionString && process.env.NODE_ENV !== undefined) {
    try {
      const pool = new Pool({ connectionString });
      prismaInstance = new PrismaClient({
        ...baseOptions,
        adapter: new PrismaPg(pool),
      });
    } catch (error) {
      console.warn(
        "Prisma adapter initialization failed, using default client:",
        error
      );
      prismaInstance = new PrismaClient(baseOptions);
    }
  } else {
    // DATABASE_URLがない、またはビルド時はadapterなし
    prismaInstance = new PrismaClient(baseOptions);
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
