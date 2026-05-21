import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import logo from "@/images/Logos/white logo.svg";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <img src={logo.src} alt="MCTC logo" className="h-10 w-auto" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            MCTC Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold">Create coach account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register to manage your club&apos;s athlete rosters.
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

