"use client";
import { useActionState } from "react";
import { signupAction } from "@/app/(auth)/actions";
import type { AuthState } from "@/app/(auth)/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form
      action={formAction}
      className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xl shadow-black/5"
    >
      {state.error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
          {state.message}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="teamName">Team name</Label>
        <Input id="teamName" name="teamName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
