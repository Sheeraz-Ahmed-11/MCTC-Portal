import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

const accountUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).optional(),
  oldPassword: z.string().min(1).optional(),
  password: z.string().min(8).max(128).optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = accountUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { fullName, email, avatarUrl, oldPassword, password } = parsed.data;
    if (!fullName && !email && avatarUrl === undefined && !password) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const supabase = await createClient();
    if (password) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 },
        );
      }
      if (!user.email) {
        return NextResponse.json({ error: "No email found for current user." }, { status: 400 });
      }
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      if (verifyError) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
    }

    const authPayload: {
      email?: string;
      password?: string;
      data?: { full_name?: string; avatar_url?: string };
    } = {};
    if (email) authPayload.email = email;
    if (password) authPayload.password = password;
    if (fullName || avatarUrl !== undefined) {
      authPayload.data = {
        full_name: fullName,
        avatar_url: avatarUrl || "",
      };
    }

    const { error: authError } = await supabase.auth.updateUser(authPayload);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const profileUpdates: { fullName?: string; email?: string; avatarUrl?: string | null } = {};
    if (fullName) profileUpdates.fullName = fullName;
    if (email) profileUpdates.email = email;
    if (avatarUrl !== undefined) profileUpdates.avatarUrl = avatarUrl || null;
    if (Object.keys(profileUpdates).length > 0) {
      await db.update(profiles).set(profileUpdates).where(eq(profiles.id, user.id));
    }

    return NextResponse.json({
      success: true,
      message: email
        ? "Account updated. Check your email to confirm the new address."
        : "Account updated successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
