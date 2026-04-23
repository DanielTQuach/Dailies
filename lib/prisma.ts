import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** True when this Prisma client includes newer delegates (e.g. after a migration + generate). */
function clientHasProviderDelegates(client: PrismaClient) {
  return "providerAccount" in client;
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && clientHasProviderDelegates(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  if (!clientHasProviderDelegates(client)) {
    throw new Error(
      "Prisma Client is out of date (missing provider tables). Stop `npm run dev`, run `npx prisma generate`, then start the dev server again."
    );
  }

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
