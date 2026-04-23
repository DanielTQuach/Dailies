"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { prisma } from "@/lib/prisma";
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

export async function quickLogManualActivity(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const rawPoints = String(formData.get("manualPoints") ?? "").trim();
  const points = rawPoints ? Number.parseFloat(rawPoints) : 1;
  if (!Number.isFinite(points) || points <= 0) {
    throw new Error("Points must be a positive number.");
  }
  const clampedPoints = Math.min(5, points);

  const note = String(formData.get("manualNote") ?? "").trim();
  const now = new Date();
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.providerAccount.upsert({
    where: { userId_provider: { userId: user.id, provider: "MANUAL" } },
    create: {
      userId: user.id,
      provider: "MANUAL",
      connectionStatus: "connected",
      dataSourceType: "MANUAL",
      confidenceLevel: 1,
      lastSyncedAt: now,
      metadata: { source: "dashboard-manual-log" },
    },
    update: {
      connectionStatus: "connected",
      dataSourceType: "MANUAL",
      confidenceLevel: 1,
      lastSyncedAt: now,
      metadata: { source: "dashboard-manual-log" },
    },
  });

  await prisma.dailyActivity.upsert({
    where: {
      userId_date_provider: {
        userId: user.id,
        date: day,
        provider: "MANUAL",
      },
    },
    create: {
      userId: user.id,
      date: day,
      provider: "MANUAL",
      points: clampedPoints,
      completed: true,
      ...(note ? { meta: { note } } : {}),
    },
    update: {
      points: { increment: clampedPoints },
      completed: true,
      ...(note ? { meta: { note } } : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/integrations");
}
