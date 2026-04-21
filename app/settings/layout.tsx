import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ensureAppUser } from "@/lib/ensure-user";

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return <AppShell title="Settings">{children}</AppShell>;
}
