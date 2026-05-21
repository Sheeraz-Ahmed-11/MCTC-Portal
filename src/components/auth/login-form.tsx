"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function LoginForm({
  redirectTo,
  initialError,
}: {
  redirectTo?: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(loginAction, {
    ...initialState,
    error: initialError,
  });

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xl shadow-black/5"
    >
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to the portal
        </p>
      </div>
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
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="/auth/forgot"
          className="text-sm text-muted-foreground hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
