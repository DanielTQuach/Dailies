"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { createProgressEntryForUser } from "@/lib/progress";

export async function quickLogProgress(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const goalId = String(formData.get("goalId") ?? "").trim();
  if (!goalId) throw new Error("Pick a goal.");

  const note = String(formData.get("note") ?? "").trim();

  await createProgressEntryForUser(user.id, goalId, {
    amount: 1,
    note: note || null,
  });

  revalidatePath("/dashboard");
}
