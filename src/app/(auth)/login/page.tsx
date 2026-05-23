// src/app/(auth)/login/page.tsx
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

      {/* Left: form panel */}
      <div className="flex flex-col bg-[#0f0f0f] p-8 md:p-12">

        {/* Logo */}
        <div className="mb-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl border border-white/8 bg-[#1a1a1a] px-3 py-2.5 transition hover:bg-[#222]"
          >
            <img src={logo.src} alt="MCTC logo" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-white">MCTC Portal</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-white/45">
                Sign in to manage your tournament roster.
              </p>
            </div>
            <LoginForm redirectTo={params.redirect} initialError={params.error} />
            <p className="mt-6 text-center text-sm text-white/40">
              No account?{" "}
              <Link href="/signup" className="font-medium text-[#c45050] hover:underline">
                Register your team
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-auto text-center text-xs text-white/25">
          MCTC Portal — Spring &amp; Fall tournament roster management
        </p>
      </div>

      {/* Right: photo panel */}
      <div className="relative hidden lg:block">
        <img
          src={hero.src}
          alt="MCTC tournament"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#a33030]/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Minnesota Collegiate Taekwondo Championship
          </p>
          <p className="mt-2 text-2xl font-bold leading-snug text-white">
            Compete. Register.<br />Represent your team.
          </p>
        </div>
      </div>
    </div>
  );
}