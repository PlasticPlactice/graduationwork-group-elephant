import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// DATABASE_URL の検証
if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please define it before starting the application."
  );
}

let validatedConnectionString: string;

try {
  validatedConnectionString = new URL(connectionString).toString();
} catch (err) {
  throw new Error(
    `DATABASE_URL environment variable is not a valid URL: ${
      (err as Error).message
    }`
  );
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

const pool =
  globalForPrisma.pool ||
  new Pool({ connectionString: validatedConnectionString });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
