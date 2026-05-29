"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { signupAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/auth/password-field";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowConfirmationScreen(true);
    }
  }, [state.message]);

  const passwordsMismatch =
    showConfirm &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  if (state.message && showConfirmationScreen) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h1
            className={cn(
              teko.className,
              "text-2xl font-medium uppercase tracking-wide text-white lg:text-3xl",
            )}
          >
            Check your email
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {state.message}
          </p>
        </div>
        {state.pendingEmail ? (
          <ResendConfirmationForm
            defaultEmail={state.pendingEmail}
            emailOnly
          />
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowConfirmationScreen(false)}
          className={cn(
            teko.className,
            "w-full rounded-none border-white/20 text-lg uppercase tracking-wide text-white hover:bg-white/10",
          )}
        >
          Change email
        </Button>
        <Link
          href="/login"
          className={cn(
            teko.className,
            "inline-flex w-full items-center justify-center rounded-none bg-[#a33030] px-4 py-2.5 text-lg uppercase tracking-wide text-white hover:bg-[#8a2828]",
          )}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1
          className={cn(
            teko.className,
            "text-2xl font-medium uppercase tracking-wide text-white lg:text-3xl",
          )}
        >
          Create account
        </h1>
        <p className="mt-1.5 text-sm text-white/45">
          Register as a team manager to submit your athlete roster.
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        {state.error ? (
          <p className="bg-primary/10 px-3 py-2 text-sm text-primary">
            {state.error}
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-none"
          />
        </div>
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          showStrength
          value={password}
          onValueChange={(value) => {
            setPassword(value);
            if (value) setShowConfirm(true);
          }}
          onFocus={() => setShowConfirm(true)}
        />
        {showConfirm || confirmPassword ? (
          <div className="animate-in fade-in slide-in-from-top-1 space-y-2 duration-200">
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Re-type password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onValueChange={setConfirmPassword}
            />
            {passwordsMismatch ? (
              <p className="text-xs font-medium text-red-400">Passwords do not match</p>
            ) : null}
          </div>
        ) : null}
        <Button
          type="submit"
          className={cn(teko.className, "w-full rounded-none text-lg uppercase tracking-wide")}
          disabled={pending}
        >
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/40">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-[#c45050] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
