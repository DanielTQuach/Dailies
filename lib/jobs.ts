import type { JobStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JobApplicationListItem = {
  id: string;
  companyName: string;
  roleTitle: string | null;
  stage: JobStage;
  applyUrl: string | null;
  jobDescriptionUrl: string | null;
  notes: string | null;
  updatedAt: Date;
};

export async function listJobApplicationsForUser(internalUserId: string): Promise<JobApplicationListItem[]> {
  return prisma.jobApplication.findMany({
    where: { userId: internalUserId },
    orderBy: [{ stage: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      stage: true,
      applyUrl: true,
      jobDescriptionUrl: true,
      notes: true,
      updatedAt: true,
    },
  });
}

export async function createJobApplicationForUser(
  internalUserId: string,
  input: {
    companyName: string;
    roleTitle?: string | null;
    stage?: JobStage;
    applyUrl?: string | null;
    jobDescriptionUrl?: string | null;
    notes?: string | null;
  }
) {
  return prisma.jobApplication.create({
    data: {
      userId: internalUserId,
      companyName: input.companyName.trim(),
      roleTitle: input.roleTitle?.trim() || null,
      stage: input.stage ?? "SAVED",
      applyUrl: input.applyUrl?.trim() || null,
      jobDescriptionUrl: input.jobDescriptionUrl?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function updateJobStageForUser(internalUserId: string, jobId: string, stage: JobStage) {
  const existing = await prisma.jobApplication.findFirst({
    where: { id: jobId, userId: internalUserId },
  });
  if (!existing) return null;
  return prisma.jobApplication.update({
    where: { id: jobId },
    data: { stage },
  });
}

export async function deleteJobApplicationForUser(internalUserId: string, jobId: string) {
  const existing = await prisma.jobApplication.findFirst({
    where: { id: jobId, userId: internalUserId },
  });
  if (!existing) return false;
  await prisma.jobApplication.delete({ where: { id: jobId } });
  return true;
}
