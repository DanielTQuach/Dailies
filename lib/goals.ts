import { prisma } from "@/lib/prisma";

export async function listGoalsForUser(internalUserId: string) {
  return prisma.goal.findMany({
    where: { userId: internalUserId },
    orderBy: { createdAt: "desc" },
    include: {
      progressEntries: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createGoal(internalUserId: string, input: { title: string; description?: string }) {
  return prisma.goal.create({
    data: {
      userId: internalUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
    },
  });
}

export async function getGoalForUser(internalUserId: string, goalId: string) {
  return prisma.goal.findFirst({
    where: { id: goalId, userId: internalUserId },
  });
}

export async function updateGoalForUser(
  internalUserId: string,
  goalId: string,
  input: { title?: string; description?: string | null }
) {
  const existing = await getGoalForUser(internalUserId, goalId);
  if (!existing) return null;

  return prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description === null ? null : input.description.trim() }
        : {}),
    },
  });
}

export async function deleteGoalForUser(internalUserId: string, goalId: string) {
  const existing = await getGoalForUser(internalUserId, goalId);
  if (!existing) return false;
  await prisma.goal.delete({ where: { id: goalId } });
  return true;
}
