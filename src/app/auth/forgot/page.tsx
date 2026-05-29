import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import forgotHero from "@/images/MCTC Photos2/LCE08806.jpg";
import logo from "@/images/Logos/white logo.svg";
import {
  authPageClassName,
  authPanelClassName,
} from "@/components/auth/auth-panel-background";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  return (
    <div className={authPageClassName}>
      {/* Left: form panel */}
      <div className={authPanelClassName}>
        <div className="relative z-10 mb-auto">
          <Link href="/" className="inline-flex items-center">
            <img src={logo.src} alt="MCTC logo" className="h-14 w-auto" />
          </Link>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-2">
          <div className="w-full max-w-sm space-y-5">
            <div>
              <h1
                className={cn(
                  teko.className,
                  "text-3xl font-medium uppercase tracking-wide text-white",
                )}
              >
                Reset password
              </h1>
              <p className="mt-1.5 text-sm text-white/45">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
            <ForgotPasswordForm />
            <p className="text-center text-sm text-white/40">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-[#c45050] hover:underline">
                Back to sign in
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
        image={forgotHero}
        imageAlt="MCTC team at championship"
        eyebrow="Midwest Collegiate Taekwondo Championship"
        title={
          <>
            Recover access.
            <br />
            Stay on roster.
          </>
        }
      />
    </div>
  );
}
