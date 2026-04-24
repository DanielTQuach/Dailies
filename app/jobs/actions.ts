"use server";

import { revalidatePath } from "next/cache";
import type { JobStage } from "@prisma/client";
import { ensureAppUser } from "@/lib/ensure-user";
import { isJobStage } from "@/lib/job-stages";
import {
  createJobApplicationForUser,
  deleteJobApplicationForUser,
  updateJobStageForUser,
} from "@/lib/jobs";

function optionalUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    throw new Error("Invalid URL — paste a full link including https://");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Invalid URL — only http(s) links are allowed.");
  }
  return u.toString();
}

export async function createJobAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) throw new Error("Company is required.");
  if (companyName.length > 120) throw new Error("Company name is too long.");

  const roleTitle = String(formData.get("roleTitle") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const stageRaw = String(formData.get("stage") ?? "SAVED").trim();
  if (!isJobStage(stageRaw)) throw new Error("Invalid stage.");

  const applyUrl = optionalUrl(String(formData.get("applyUrl") ?? ""));
  const jobDescriptionUrl = optionalUrl(String(formData.get("jobDescriptionUrl") ?? ""));

  await createJobApplicationForUser(user.id, {
    companyName,
    roleTitle: roleTitle || null,
    stage: stageRaw as JobStage,
    applyUrl,
    jobDescriptionUrl,
    notes: notes || null,
  });

  revalidatePath("/jobs");
}

export async function updateJobStageAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const jobId = String(formData.get("jobId") ?? "").trim();
  if (!jobId) throw new Error("Missing job.");

  const stageRaw = String(formData.get("stage") ?? "").trim();
  if (!isJobStage(stageRaw)) throw new Error("Invalid stage.");

  const updated = await updateJobStageForUser(user.id, jobId, stageRaw as JobStage);
  if (!updated) throw new Error("Job not found.");

  revalidatePath("/jobs");
}

export async function deleteJobAction(formData: FormData) {
  const user = await ensureAppUser();
  if (!user) throw new Error("Unauthorized");

  const jobId = String(formData.get("jobId") ?? "").trim();
  if (!jobId) throw new Error("Missing job.");

  const ok = await deleteJobApplicationForUser(user.id, jobId);
  if (!ok) throw new Error("Job not found.");

  revalidatePath("/jobs");
}
