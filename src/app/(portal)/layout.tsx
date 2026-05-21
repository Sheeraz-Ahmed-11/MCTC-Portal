export const dynamic = "force-dynamic";

import { PortalNav } from "@/components/layout/portal-nav";
import { getSessionUser, ensureProfile } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const profile = user ? await ensureProfile(user) : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <PortalNav email={profile?.email ?? user?.email} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
