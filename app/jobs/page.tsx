import { redirect } from "next/navigation";
import { JobsTrackerClient } from "@/components/jobs/jobs-tracker-client";
import { ensureAppUser } from "@/lib/ensure-user";
import { listJobApplicationsForUser } from "@/lib/jobs";

export default async function JobsPage() {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const apps = await listJobApplicationsForUser(user.id);
  const serialized = apps.map((a) => ({
    id: a.id,
    companyName: a.companyName,
    roleTitle: a.roleTitle,
    stage: a.stage,
    applyUrl: a.applyUrl,
    jobDescriptionUrl: a.jobDescriptionUrl,
    notes: a.notes,
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Track applications across stages, keep apply + JD links tidy, and move opportunities through your pipeline.
      </p>
      <JobsTrackerClient applications={serialized} />
    </div>
  );
}
