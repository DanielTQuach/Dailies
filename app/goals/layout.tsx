import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";

export default async function GoalsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return <>{children}</>;
}
