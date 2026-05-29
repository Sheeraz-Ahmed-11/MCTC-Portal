/** Auth redirect base URL — localhost in dev unless env explicitly points at localhost. */
export function getAuthSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_ORIGIN;

  if (process.env.NODE_ENV === "development") {
    if (
      configured &&
      (configured.includes("localhost") || configured.includes("127.0.0.1"))
    ) {
      return configured.replace(/\/$/, "");
    }
    return "http://localhost:3000";
  }

  return (configured ?? "http://localhost:3000").replace(/\/$/, "");
}

export function authCallbackUrl(nextPath = "/onboarding"): string {
  const next =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/onboarding";
  return `${getAuthSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
