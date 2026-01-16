import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

// DATABASE_URL の検証（ランタイム時のみ）
function validateConnectionString(connStr: string | undefined): string {
  if (!connStr) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please define it before starting the application."
    );
  }

  try {
    return new URL(connStr).toString();
  } catch (err) {
    throw new Error(
      `DATABASE_URL environment variable is not a valid URL: ${
        (err as Error).message
      }`
    );
  }
}

// Pool の作成（遅延評価）
function getPool(): Pool {
  if (!globalForPrisma.pool) {
    const validatedConnectionString =
      validateConnectionString(connectionString);
    globalForPrisma.pool = new Pool({
      connectionString: validatedConnectionString,
    });
  }
  return globalForPrisma.pool;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: connectionString ? new PrismaPg(getPool()) : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
