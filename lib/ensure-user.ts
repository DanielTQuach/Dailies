import { auth, currentUser } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/**
 * Ensures a `User` row exists for the signed-in Clerk account.
 * Call from Server Components / Server Actions only (requires DB + Clerk session).
 */
export async function ensureAppUser() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL URL to .env.local (see .env.example), restart the dev server, then run npm run db:migrate if migrations are not applied yet."
    );
  }

  const { userId } = await auth();
  if (!userId) return null;

  const clerk = await currentUser();
  const email =
    clerk?.emailAddresses.find((e) => e.id === clerk?.primaryEmailAddressId)?.emailAddress ??
    clerk?.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const fullName = [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ").trim();

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: {
      clerkUserId: userId,
      email,
      name: fullName || null,
      onboardingCompleted: false,
    },
  });
}
