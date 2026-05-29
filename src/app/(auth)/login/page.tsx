// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import loginHero from "@/images/MCTC Photos1/LCE07532.jpg";
import logo from "@/images/Logos/white logo.svg";
import {
  authPageClassName,
  authPanelClassName,
} from "@/components/auth/auth-panel-background";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className={authPageClassName}>

      {/* Left: form panel */}
      <div className={authPanelClassName}>
        {/* Logo */}
        <div className="relative z-10 shrink-0">
          <Link href="/" className="inline-flex items-center">
            <img src={logo.src} alt="MCTC logo" className="h-14 w-auto" />
          </Link>
        </div>

        {/* Form */}
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="w-full max-w-sm space-y-5">
            <div>
              <h1
                className={cn(
                  teko.className,
                  "text-3xl font-medium uppercase tracking-wide text-white",
                )}
              >
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-white/45">
                Sign in to manage your tournament roster.
              </p>
            </div>
            <LoginForm redirectTo={params.redirect} initialError={params.error} />
            <p className="text-center text-sm text-white/40">
              No account?{" "}
              <Link href="/signup" className="font-medium text-[#c45050] hover:underline">
                Create your account
              </Link>
            </p>
          </div>
        </div>

        <footer className="relative z-10 mt-auto shrink-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-4 text-xs text-white/30">
          <Link href="/privacy" className="hover:text-white/60 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/60 hover:underline">
            Terms &amp; Conditions
          </Link>
        </footer>
      </div>

      <AuthHeroPanel
        image={loginHero}
        imageAlt="MCTC athletes at tournament"
        priority
        eyebrow="Midwest Collegiate Taekwondo Championship"
        title={
          <>
            Compete. Register.
            <br />
            Represent your team.
          </>
        }
      />
    </div>
  );
}