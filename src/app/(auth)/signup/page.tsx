// src/app/(auth)/signup/page.tsx
import { SignupForm } from "@/components/auth/signup-form";
import {
  authPageClassName,
  authPanelClassName,
} from "@/components/auth/auth-panel-background";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import Link from "next/link";
import signupHero from "@/images/MCTC Photos2/LCE09058.jpg";
import logo from "@/images/Logos/white logo.svg";
export default function SignupPage() {
  return (
    <div className={authPageClassName}>
      {/* Left: form panel */}
      <div className={authPanelClassName}>
        <div className="relative z-10 shrink-0">
          <Link href="/" className="inline-flex items-center">
            <img src={logo.src} alt="MCTC logo" className="h-14 w-auto" />
          </Link>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="w-full max-w-sm">
            <SignupForm />
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
        image={signupHero}
        imageAlt="MCTC championship event"
        eyebrow="Midwest Collegiate Taekwondo Championship"
        title={
          <>
            Register your team.
            <br />
            Build your roster.
          </>
        }
      />
    </div>
  );
}
