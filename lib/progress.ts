import { prisma } from "@/lib/prisma";

export async function listProgressForGoal(userId: string, goalId: string) {
  const owns = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!owns) return null;

  return prisma.progressEntry.findMany({
    where: { goalId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
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
