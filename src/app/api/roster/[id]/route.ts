import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes, rosterEntries, tournaments } from "@/lib/db/schema";
import { requireProfile } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  division: z.string().max(80).optional(),
  weightClass: z.string().max(40).optional(),
  status: z.enum(["registered", "confirmed", "withdrawn"]).optional(),
  notes: z.string().max(500).optional(),
});

function registrationIsOpen(registrationOpen: Date, registrationClose: Date | null) {
  const now = new Date();
  return now >= registrationOpen && (registrationClose === null || now < registrationClose);
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { profile } = await requireProfile();
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.query.rosterEntries.findFirst({
      where: eq(rosterEntries.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const athlete = await db.query.athletes.findFirst({
      where: eq(athletes.id, existing.athleteId),
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    if (profile.role === "coach" && athlete.createdBy !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, existing.tournamentId),
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

    const [updated] = await db
      .update(rosterEntries)
      .set(parsed.data)
      .where(eq(rosterEntries.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
