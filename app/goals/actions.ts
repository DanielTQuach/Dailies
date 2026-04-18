"use server";

import { revalidatePath } from "next/cache";
import { ensureAppUser } from "@/lib/ensure-user";
import { createGoal, deleteGoalForUser } from "@/lib/goals";

export async function createGoalAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  const description = String(formData.get("description") ?? "").trim();

  await createGoal(user.id, {
    title,
    description: description || undefined,
  });

  revalidatePath("/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = String(formData.get("goalId") ?? "").trim();
  if (!goalId) throw new Error("Missing goal id.");

  await deleteGoalForUser(user.id, goalId);

  revalidatePath("/goals");
}
