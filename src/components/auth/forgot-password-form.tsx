"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="bg-primary/10 px-3 py-2 text-sm text-primary">
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
          className="rounded-none"
        />
      </div>
      <Button
        type="submit"
        className={cn(teko.className, "w-full rounded-none text-xl uppercase tracking-wide")}
        disabled={pending}
      >
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
