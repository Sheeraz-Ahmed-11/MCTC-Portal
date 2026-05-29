"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {redirectTo ? (
          <input type="hidden" name="redirect" value={redirectTo} />
        ) : null}
        {state.error ? (
          <p className="bg-primary/10 px-3 py-2 text-sm text-primary">
            {state.error}
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot"
              className="text-sm text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-none"
          />
        </div>
        <Button
          type="submit"
          className={cn(teko.className, "w-full rounded-none text-xl uppercase tracking-wide")}
          disabled={pending}
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
