"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getPostAuthRedirect } from "@/lib/auth";
import { authCallbackUrl } from "@/lib/auth/site-url";
import { MCTC_EMAIL } from "@/lib/email/constants";
import type { AuthState } from "@/app/(auth)/types";

function safeRedirectPath(path: string | null | undefined, fallback: string) {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return fallback;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(
    String(formData.get("redirect") ?? ""),
    "/dashboard",
  );

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const needsConfirm =
      /email not confirmed/i.test(error.message) ||
      /email_not_confirmed/i.test(error.message);
    return {
      error: error.message,
      pendingEmail: needsConfirm ? email : undefined,
      needsEmailConfirmation: needsConfirm,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await ensureProfile(user);
    if (profile) {
      redirect(getPostAuthRedirect(profile));
    }
  }

  redirect(redirectTo);
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: authCallbackUrl("/onboarding"),
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase silently "succeeds" for duplicate emails instead of throwing an
  // error. The identities array will be empty when the email is already taken.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "This email is already registered. Please sign in or reset your password.",
    };
  }

  if (data.user) {
    try {
      await ensureProfile(data.user);
    } catch {
      return {
        error:
          "Account created but profile setup failed. Try signing in or contact support.",
      };
    }
  }

  if (data.session) {
    redirect("/onboarding");
  }

  const confirmationSent = Boolean(data.user?.confirmation_sent_at);

  return {
    pendingEmail: email,
    message: confirmationSent
      ? `Confirmation email sent to ${email}. After confirming, you'll be taken to onboarding to set up your team. Check spam if you don't see it (sender may be Supabase Auth / noreply@mail.app.supabase.io).`
      : `Account created but no confirmation email was sent. Use "Resend confirmation" below, or tap "Change email" to fix your address.`,
  };
}

export async function resendConfirmationAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: authCallbackUrl("/onboarding"),
    },
  });

  if (error) {
    return {
      error: error.message,
      pendingEmail: email,
      needsEmailConfirmation: true,
    };
  }

  return {
    pendingEmail: email,
    message: `Confirmation email resent to ${email}. Check spam if it does not arrive within a few minutes.`,
  };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl("/login"),
  });

  if (error) {
    return { error: error.message };
  }

  return {
    message: `If an account exists for that email, a reset link has been sent from ${MCTC_EMAIL.address}.`,
  };
}
