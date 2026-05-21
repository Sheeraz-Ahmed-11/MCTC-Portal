import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireProfile() {
  const user = await requireUser();
  const profile = await ensureProfile(user);
  if (!profile) {
    throw new Error("Unauthorized");
  }
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireProfile();
  if (profile.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return { user, profile };
}

export async function ensureProfile(user: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; team_name?: string };
}) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? null,
      teamName: user.user_metadata?.team_name ?? null,
      role: "coach",
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  return db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });
}

