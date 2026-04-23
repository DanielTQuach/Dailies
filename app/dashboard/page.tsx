import { currentUser } from "@clerk/nextjs/server";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getDashboardData } from "@/lib/dashboard-data";
import { ensureAppUser } from "@/lib/ensure-user";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const appUser = await ensureAppUser();
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses.find((e) => e.id === clerkUser?.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    null;

  if (!appUser) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <EmptyState title="Not signed in" description="Sign in to view your dashboard." />
      </div>
    );
  }

  let data;
  try {
    data = await getDashboardData(appUser.id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div className="mx-auto max-w-4xl p-8">
        <EmptyState title="Could not load dashboard" description={message} />
      </div>
    );
  }

  const displayName = appUser.name ?? email ?? "there";

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <DashboardClient displayName={displayName} email={email} data={data} />
    </div>
  );
}
