import { prisma } from "@/lib/prisma";

export async function listProgressForGoal(userId: string, goalId: string, take = 100) {
  const owns = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!owns) return null;

  return prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function listProgressForGoalPage(
  userId: string,
  goalId: string,
  options?: { take?: number; cursor?: string }
) {
  const owns = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!owns) return null;

  const take = options?.take ?? 100;
  const rows = await prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(options?.cursor
      ? {
          cursor: { id: options.cursor },
          skip: 1,
        }
      : {}),
    take: take + 1,
  });

  const hasMore = rows.length > take;
  const entries = hasMore ? rows.slice(0, take) : rows;
  return {
    entries,
    nextCursor: hasMore ? entries[entries.length - 1]?.id ?? null : null,
  };
}

export async function createProgressEntryForUser(
  userId: string,
  goalId: string,
  input: { amount?: number; note?: string | null }
) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!goal) return null;

  const amount = input.amount ?? 1;
  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
    throw new Error("amount must be between 1 and 1000000");
  }

  return prisma.progressEntry.create({
    data: {
      goalId,
      amount: Math.floor(amount),
      note: input.note === null || input.note === undefined ? null : String(input.note).trim() || null,
    },
  });
}
