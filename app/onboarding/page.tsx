import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");
  if (user.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome — finish setup
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Choose a display name. You can change this later in your profile when you add that flow.
        </p>
      </div>
      <OnboardingForm defaultName={user.name ?? ""} />
    </div>
  );
}
