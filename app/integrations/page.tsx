import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { prisma } from "@/lib/prisma";
import { GithubIntegrationRow } from "./github-integration-row";

const OTHER_ROWS: { key: string; label: string; detail: string }[] = [
  {
    key: "LEETCODE",
    label: "LeetCode",
    detail: "Connect your LeetCode profile.",
  },
  {
    key: "NEETCODE",
    label: "NeetCode",
    detail: "Track progress with NeetCode.",
  },
];

export default async function IntegrationsPage() {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const github = await prisma.providerAccount.findUnique({
    where: { userId_provider: { userId: user.id, provider: "GITHUB" } },
  });
  const githubCompletedDays = await prisma.dailyActivity.count({
    where: {
      userId: user.id,
      provider: "GITHUB",
      completed: true,
    },
  });
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[560px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <th className="p-2.5 font-medium text-zinc-900 dark:text-zinc-50">Provider</th>
              <th className="p-2.5 font-medium text-zinc-900 dark:text-zinc-50">Status</th>
              <th className="p-2.5 font-medium text-zinc-900 dark:text-zinc-50">Actions</th>
            </tr>
          </thead>
          <tbody>
            <GithubIntegrationRow
              externalId={github?.externalId ?? null}
              connectionStatus={github?.connectionStatus ?? "disconnected"}
              lastSyncedAt={github?.lastSyncedAt?.toISOString() ?? null}
              completedDays={githubCompletedDays}
            />
            {OTHER_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80">
                <td className="p-2.5 align-top">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{row.label}</p>
                  <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{row.detail}</p>
                </td>
                <td className="p-2.5 align-top">
                  <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    disconnected
                  </span>
                </td>
                <td className="p-2.5 align-top text-zinc-500 dark:text-zinc-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
