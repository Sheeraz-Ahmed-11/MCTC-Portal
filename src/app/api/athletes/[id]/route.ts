import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes } from "@/lib/db/schema";
import { requireProfile } from "@/lib/auth";
import { athleteSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { profile } = await requireProfile();
    const { id } = await params;
    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.id, id),
    });

    if (!athlete) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role === "coach" && athlete.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(athlete);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { profile } = await requireProfile();
    const { id } = await params;
    const body = await request.json();
    const parsed = athleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const name = data.firstName && data.lastName
      ? { firstName: data.firstName, lastName: data.lastName }
      : splitFullName(data.fullName || "");

    const existing = await db.query.athletes.findFirst({
      where: eq(athletes.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role === "coach" && existing.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [updated] = await db
      .update(athletes)
      .set({
        firstName: name.firstName,
        lastName: name.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        beltRank: data.beltRank,
        weightClass: data.weightClass,
        eventType: data.eventType,
        status: data.status ?? "active",
        weightKg: data.weightKg || null,
        club: data.club || null,
        email: data.email || null,
        phone: data.phone || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(athletes.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { profile } = await requireProfile();
    const { id } = await params;
    const existing = await db.query.athletes.findFirst({
      where: eq(athletes.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role === "coach" && existing.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await db
      .delete(athletes)
      .where(eq(athletes.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
