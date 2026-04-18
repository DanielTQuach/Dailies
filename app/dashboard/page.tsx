import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ensureAppUser } from "@/lib/ensure-user";

export default async function DashboardPage() {
  const appUser = await ensureAppUser();
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses.find((e) => e.id === clerkUser?.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {appUser?.name ?? email}
          {email ? <span className="text-zinc-500"> ({email})</span> : null}
        </p>
      </div>
      <Link
        href="/"
        className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
      >
        Back to home
      </Link>
    </div>
  );
}
