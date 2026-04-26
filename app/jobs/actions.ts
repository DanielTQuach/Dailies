"use server";

import { JobStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ensureAppUser } from "@/lib/ensure-user";
import { JOB_STAGES, createJobApplicationForUser, updateJobStageForUser } from "@/lib/jobs";
import { parseJobListingFromUrl } from "@/lib/job-listing-parser";

export type JobCreateState = {
  ok?: boolean;
  error?: string;
};

export async function createJobAction(_prev: JobCreateState | null, formData: FormData): Promise<JobCreateState> {
  void _prev;
  const user = await ensureAppUser();
  if (!user) return { error: "You must be signed in." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Role title is required." };

  const stageRaw = String(formData.get("stage") ?? "APPLIED");
  const stage = JOB_STAGES.includes(stageRaw as JobStage) ? (stageRaw as JobStage) : "APPLIED";

  const url = String(formData.get("url") ?? "").trim();
  if (url) {
    try {
      new URL(url);
    } catch {
      return { error: "Job URL must be a valid URL." };
    }
  }

  await createJobApplicationForUser(user.id, {
    title,
    companyName: String(formData.get("companyName") ?? "").trim() || undefined,
    url: url || undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    salaryRange: String(formData.get("salaryRange") ?? "").trim() || undefined,
    notes: String(formData.get("notes") ?? "").trim() || undefined,
    stage,
  });

  revalidatePath("/jobs");
  return { ok: true };
}

export type JobStageState = {
  ok?: boolean;
  error?: string;
};

export async function updateJobStageAction(
  _prev: JobStageState | null,
  formData: FormData
): Promise<JobStageState> {
  void _prev;
  const user = await ensureAppUser();
  if (!user) return { error: "You must be signed in." };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing job id." };

  const stageRaw = String(formData.get("stage") ?? "").trim();
  if (!JOB_STAGES.includes(stageRaw as JobStage)) {
    return { error: "Invalid stage." };
  }

  await updateJobStageForUser(user.id, id, stageRaw as JobStage);
  revalidatePath("/jobs");
  return { ok: true };
}

export type JobParseState = {
  title?: string;
  companyName?: string;
  location?: string;
  salaryRange?: string;
  error?: string;
};

export async function parseJobListingAction(url: string): Promise<JobParseState> {
  const user = await ensureAppUser();
  if (!user) return { error: "You must be signed in." };
  const normalized = url.trim();
  if (!normalized) return { error: "Job URL is required." };
  try {
    new URL(normalized);
  } catch {
    return { error: "Job URL must be a valid URL." };
  }

  try {
    const parsed = await parseJobListingFromUrl(normalized);
    return {
      title: parsed.title,
      companyName: parsed.companyName,
      location: parsed.location,
      salaryRange: parsed.salaryRange,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to parse listing URL." };
  }
}
