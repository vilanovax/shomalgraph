import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// توجه: db.$connect() را در اینجا فراخوانی نمی‌کنیم
// چون این فایل ممکن است در edge runtime (middleware) استفاده شود
// و Prisma Client در edge runtime نیاز به Prisma Accelerate یا Driver Adapters دارد
// اتصال به صورت lazy انجام می‌شود (اولین query)
