"use server";

import { revalidatePath } from "next/cache";
import { ensureAppUser } from "@/lib/ensure-user";
import { createGoal, deleteGoalForUser } from "@/lib/goals";
import { createProgressEntryForUser } from "@/lib/progress";

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

export async function logProgressAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const goalId = String(formData.get("goalId") ?? "").trim();
  if (!goalId) throw new Error("Missing goal id.");

  const note = String(formData.get("note") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const amount = amountRaw === "" ? 1 : Number.parseInt(amountRaw, 10);
  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error("Amount must be a positive integer.");
  }

  await createProgressEntryForUser(user.id, goalId, {
    amount,
    note: note || null,
  });

  revalidatePath("/goals");
}
