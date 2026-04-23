"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { connectGithubAction, syncGithubAction, type GithubConnectState, type GithubSyncState } from "./actions";

type GithubAccountProps = {
  externalId: string | null;
  connectionStatus: string;
  lastSyncedAt: string | null;
  completedDays: number;
};

function SubmitButton({ idle, pendingLabel }: { idle: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-zinc-300 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {pending ? pendingLabel : idle}
    </button>
  );
}

export function GithubIntegrationRow({
  externalId,
  connectionStatus,
  lastSyncedAt,
  completedDays,
}: GithubAccountProps) {
  const [connectState, connectAction] = useActionState(connectGithubAction, null as GithubConnectState | null);
  const [syncState, syncAction] = useActionState(syncGithubAction, null as GithubSyncState | null);

  const connected = connectionStatus === "connected" && Boolean(externalId?.trim());
  const lastLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

  return (
    <>
      <tr className="border-b border-zinc-100 dark:border-zinc-800/80">
        <td className="p-2.5 align-top">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">GitHub</p>
          <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">Sync coding activity from your public GitHub events.</p>
        </td>
        <td className="p-2.5 align-top">
          <span
            className={
              connected
                ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
                : "inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }
          >
            {connected ? "connected" : "disconnected"}
          </span>
          <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">Last sync: {lastLabel}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
            Active days: <span className="font-mono text-zinc-900 dark:text-zinc-100">{completedDays}</span>
          </p>
        </td>
        <td className="p-2.5 align-top">
          <div className="flex max-w-xs flex-col gap-2">
            <form action={connectAction} className="flex flex-wrap items-end gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor="github-username" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                  Username
                </label>
                <input
                  id="github-username"
                  name="githubUsername"
                  type="text"
                  defaultValue={externalId ?? ""}
                  placeholder="octocat"
                  autoComplete="off"
                  className="w-full min-w-[8rem] rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-[11px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>
              <SubmitButton idle="Save" pendingLabel="Saving…" />
            </form>
            {connectState?.error ? (
              <p className="text-[10px] text-red-600 dark:text-red-400">{connectState.error}</p>
            ) : connectState?.ok ? (
              <div className="space-y-0.5 text-[10px]">
                <p className="text-emerald-700 dark:text-emerald-400">Saved your GitHub username.</p>
                {connectState.syncWarning ? (
                  <p className="text-amber-700 dark:text-amber-300">Sync: {connectState.syncWarning}</p>
                ) : (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Sync pulled {connectState.syncEvents ?? 0} events across {connectState.syncDays ?? 0} active days.
                  </p>
                )}
              </div>
            ) : null}

            <form action={syncAction} className="flex items-center gap-2">
              <SubmitButton idle="Run sync" pendingLabel="Syncing…" />
            </form>
            {syncState?.error ? (
              <p className="text-[10px] text-red-600 dark:text-red-400">{syncState.error}</p>
            ) : syncState?.ok ? (
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Synced {syncState.events ?? 0} events across {syncState.daysBackfilled ?? 0} days.
              </p>
            ) : null}
          </div>
        </td>
      </tr>
    </>
  );
}
