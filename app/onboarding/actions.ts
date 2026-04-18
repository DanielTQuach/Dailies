"use server";

import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { prisma } from "@/lib/prisma";

export async function completeOnboarding(formData: FormData) {
  const existing = await ensureAppUser();
  if (!existing) redirect("/sign-in");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Display name is required.");
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      name,
      onboardingCompleted: true,
    },
  });

  redirect("/dashboard");
}
