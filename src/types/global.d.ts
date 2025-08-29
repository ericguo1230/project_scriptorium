import type { PrismaClient } from "@prisma/client";

declare global {
  let prismaGlobal: PrismaClient;
}
