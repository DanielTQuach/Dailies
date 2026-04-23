"use server";

import { revalidatePath } from "next/cache";
import { ensureAppUser } from "@/lib/ensure-user";
import { syncGithubForUser } from "@/lib/github-sync";
import { prisma } from "@/lib/prisma";
import { githubAdapter } from "@/lib/providers/github";

export type GithubConnectState = {
  error?: string;
  ok?: boolean;
  /** Present when save worked but the follow-up sync failed (e.g. rate limit). */
  syncWarning?: string;
  syncEvents?: number;
  syncDays?: number;
};

export async function connectGithubAction(
  _prev: GithubConnectState | null,
  formData: FormData
): Promise<GithubConnectState> {
  void _prev;
  const user = await ensureAppUser();
  if (!user) return { error: "You must be signed in." };

  const username = String(formData.get("githubUsername") ?? "").trim();
  if (!username) {
    return { error: "GitHub username is required." };
  }

  const ds = githubAdapter.defaultDataSource;
  const conf = githubAdapter.defaultConfidence;

  await prisma.providerAccount.upsert({
    where: { userId_provider: { userId: user.id, provider: "GITHUB" } },
    create: {
      userId: user.id,
      provider: "GITHUB",
      externalId: username,
      connectionStatus: "connected",
      dataSourceType: ds,
      confidenceLevel: conf,
      lastSyncedAt: null,
    },
    update: {
      externalId: username,
      connectionStatus: "connected",
      dataSourceType: ds,
      confidenceLevel: conf,
    },
  });

  try {
    const result = await syncGithubForUser(user.id);
    revalidatePath("/integrations");
    revalidatePath("/dashboard");
    return { ok: true, syncEvents: result.events, syncDays: result.daysBackfilled };
  } catch (e) {
    revalidatePath("/integrations");
    revalidatePath("/dashboard");
    return {
      ok: true,
      syncWarning:
        e instanceof Error
          ? e.message
          : "Could not sync GitHub yet. Open Integrations and use Run sync, or try again after a minute.",
    };
  }
}

export type GithubSyncState = {
  error?: string;
  ok?: boolean;
  daysBackfilled?: number;
  events?: number;
};

export async function syncGithubAction(
  _prev: GithubSyncState | null,
  _formData: FormData
): Promise<GithubSyncState> {
  void _prev;
  void _formData;
  const user = await ensureAppUser();
  if (!user) return { error: "You must be signed in." };

  try {
    const result = await syncGithubForUser(user.id);
    revalidatePath("/integrations");
    revalidatePath("/dashboard");
    return { ok: true, daysBackfilled: result.daysBackfilled, events: result.events };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sync failed" };
  }
}
