import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalNav } from "@/components/layout/portal-nav";
import { authPanelClassName } from "@/components/auth/auth-panel-background";
import { ensureProfile, getSessionUser, mustCompleteOnboarding } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const onOnboarding =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  const user = await getSessionUser();
  const profile = user ? await ensureProfile(user) : null;
  const onboardingLocked = profile ? mustCompleteOnboarding(profile) : false;

  if (onboardingLocked && !onOnboarding) {
    redirect("/onboarding");
  }

  if (onOnboarding) {
    return (
      <div className={`${authPanelClassName} min-h-svh`}>
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <PortalNav
        email={profile?.email ?? user?.email}
        fullName={profile?.fullName}
        avatarUrl={profile?.avatarUrl}
        role={profile?.role}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
