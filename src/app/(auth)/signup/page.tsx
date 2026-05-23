// src/app/(auth)/signup/page.tsx
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import logo from "@/images/Logos/white logo.svg";
import { Trophy, Users, CalendarDays, ShieldCheck } from "lucide-react";

export default function SignupPage() {
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
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-white/45">
                Register as a team manager to submit your athlete roster.
              </p>
            </div>
            <SignupForm />
            <p className="mt-6 text-center text-sm text-white/40">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-[#c45050] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-auto text-center text-xs text-white/25">
          MCTC Portal — Spring &amp; Fall tournament roster management
        </p>
      </div>

      {/* Right: maroon brand panel */}
      <div className="relative hidden bg-[#a33030] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circles" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circles)" />
        </svg>
        <div className="relative z-10 w-full max-w-xs text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <img src={logo.src} alt="MCTC" className="h-10 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Minnesota Collegiate<br />Taekwondo Championship
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            The official portal for team managers to submit and manage athlete rosters for Spring and Fall events.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: Users, value: "25+", label: "Teams" },
              { icon: Trophy, value: "300+", label: "Athletes" },
              { icon: CalendarDays, value: "2×", label: "Per year" },
              { icon: ShieldCheck, value: "100%", label: "Secure" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl bg-white/10 px-4 py-4 text-center">
                <Icon className="mx-auto mb-1.5 h-4 w-4 text-white/60" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}