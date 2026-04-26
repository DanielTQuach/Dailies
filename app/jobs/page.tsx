import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { listJobApplicationsForUser } from "@/lib/jobs";
import { JobsClient } from "./jobs-client";

export default async function JobsPage() {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const jobs = await listJobApplicationsForUser(user.id);
  return <JobsClient jobs={jobs} />;
}
