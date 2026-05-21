import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes } from "@/lib/db/schema";
import { requireProfile, ensureProfile } from "@/lib/auth";
import { athleteSchema } from "@/lib/validations";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function GET() {
  try {
    const { profile } = await requireProfile();
    const filter =
      profile.role === "coach"
        ? eq(athletes.createdBy, profile.id)
        : undefined;

    const list = await db.query.athletes.findMany({
      where: filter,
      orderBy: [asc(athletes.lastName), asc(athletes.firstName)],
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireProfile();
    await ensureProfile(user);
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

    const [created] = await db
      .insert(athletes)
      .values({
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
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
