import { PrefetchAuthRoutes } from "@/components/auth/prefetch-auth-routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-transition h-svh overflow-hidden">
      <PrefetchAuthRoutes />
      {children}
    </div>
  );
}
