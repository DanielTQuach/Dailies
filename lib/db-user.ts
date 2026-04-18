import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type DbUserResult =
  | { ok: true; user: { id: string; clerkUserId: string | null; email: string } }
  | { ok: false; status: 401 | 404 };

/**
 * Resolve the Prisma `User` for the current Clerk session (API routes / server code).
 */
export async function getDbUserForRequest(): Promise<DbUserResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401 };

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, clerkUserId: true, email: true },
  });
  if (!user) return { ok: false, status: 404 };

  return { ok: true, user };
}
