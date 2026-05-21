import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import { tournamentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, id),
      with: {
        rosterEntries: {
          with: { athlete: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(tournament);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = tournamentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const [updated] = await db
      .update(tournaments)
      .set({
        name: data.name,
        season: data.season,
        year: data.year,
        location: data.location || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        registrationOpen: data.registrationOpen
          ? new Date(data.registrationOpen)
          : new Date(),
        registrationClose: data.registrationClose
          ? new Date(data.registrationClose)
          : null,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(tournaments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
