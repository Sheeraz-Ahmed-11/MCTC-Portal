"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xl shadow-black/5"
    >
      {state.error ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}