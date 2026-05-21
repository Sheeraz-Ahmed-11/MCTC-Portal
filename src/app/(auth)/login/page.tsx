import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import hero from "@/images/MCTC Photos1/LCE07532.jpg";
import logo from "@/images/Logos/white logo.svg";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl border border-border bg-muted px-3 py-3 text-sm font-semibold text-black transition hover:border-primary hover:bg-primary/10"
          >
            <img src={logo.src} alt="MCTC logo" className="h-9 w-auto" />
            <span>MCTC Portal</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center gap-1 text-center mb-4">
              <h1 className="text-2xl font-bold">Sign in to your account</h1>
              <p className="text-sm text-muted-foreground">
                Manage tournament rosters for Spring and Fall events.
              </p>
            </div>
            <LoginForm
              redirectTo={params.redirect}
              initialError={params.error}
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              No account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src={hero.src}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
