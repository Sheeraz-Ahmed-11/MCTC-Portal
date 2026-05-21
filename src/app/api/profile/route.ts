import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { z } from "zod";

const profileUpdateSchema = z.object({
  teamName: z.string().max(120).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (parsed.data.teamName !== undefined) {
      updates.teamName = parsed.data.teamName;
    }

    if (parsed.data.onboardingCompleted !== undefined) {
      updates.onboardingCompleted = parsed.data.onboardingCompleted;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, user.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
