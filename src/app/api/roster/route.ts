import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rosterEntries, athletes, tournaments } from "@/lib/db/schema";
import { requireProfile } from "@/lib/auth";
import { rosterEntrySchema } from "@/lib/validations";
import { calculateAge, suggestDivision } from "@/lib/format";

function registrationIsOpen(registrationOpen: Date, registrationClose: Date | null) {
  const now = new Date();
  return now >= registrationOpen && (registrationClose === null || now < registrationClose);
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireProfile();
    const body = await request.json();
    const parsed = rosterEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.id, data.athleteId),
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    if (profile.role === "coach" && athlete.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, data.tournamentId),
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (!registrationIsOpen(tournament.registrationOpen, tournament.registrationClose)) {
      return NextResponse.json(
        { error: "Registration is closed for this tournament" },
        { status: 403 },
      );
    }

    const age = calculateAge(athlete.dateOfBirth);
    const division = data.division || suggestDivision(age);

    const [created] = await db
      .insert(rosterEntries)
      .values({
        tournamentId: data.tournamentId,
        athleteId: data.athleteId,
        division,
        weightClass: data.weightClass || null,
        status: data.status ?? "registered",
        notes: data.notes || null,
        registeredBy: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "Athlete is already on this roster" },
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { profile } = await requireProfile();
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const athleteId = searchParams.get("athleteId");

    if (!tournamentId || !athleteId) {
      return NextResponse.json({ error: "Missing ids" }, { status: 400 });
    }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, tournamentId),
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (!registrationIsOpen(tournament.registrationOpen, tournament.registrationClose)) {
      return NextResponse.json(
        { error: "Registration is closed for this tournament" },
        { status: 403 },
      );
    }

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.id, athleteId),
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    if (profile.role === "coach" && athlete.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await db
      .delete(rosterEntries)
      .where(
        and(
          eq(rosterEntries.tournamentId, tournamentId),
          eq(rosterEntries.athleteId, athleteId),
        ),
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
