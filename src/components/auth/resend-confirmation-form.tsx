"use client";

import { useActionState } from "react";
import { resendConfirmationAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

type ResendConfirmationFormProps = {
  /** Prefill email (e.g. after signup or failed login) */
  defaultEmail?: string;
  /** Hide email field when email is already known */
  emailOnly?: boolean;
  className?: string;
};

export function ResendConfirmationForm({
  defaultEmail = "",
  emailOnly = false,
  className,
}: ResendConfirmationFormProps) {
  const [state, formAction, pending] = useActionState(
    resendConfirmationAction,
    initialState,
  );

  const email = state.pendingEmail ?? defaultEmail;

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      {!emailOnly ? (
        <div className="space-y-2">
          <Label htmlFor="resend-email" className="text-white/70">
            Email
          </Label>
          <Input
            id="resend-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={email}
            key={email}
            placeholder="you@school.edu"
            className="rounded-none"
          />
        </div>
      ) : (
        <input type="hidden" name="email" value={email} />
      )}
      {state.error ? (
        <p className="bg-primary/10 px-3 py-2 text-sm text-primary">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-white/70">{state.message}</p>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        className={cn(
          teko.className,
          "w-full rounded-none border-white/20 text-base uppercase tracking-wide text-white hover:bg-white/10",
        )}
        disabled={pending}
      >
        {pending ? "Sending…" : "Resend confirmation email"}
      </Button>
    </form>
  );
}
