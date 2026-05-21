import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import { tournamentSchema } from "@/lib/validations";

export async function GET() {
  try {
    await requireUser();
    const list = await db.query.tournaments.findMany({
      orderBy: [desc(tournaments.year), desc(tournaments.createdAt)],
      with: {
        rosterEntries: true,
      },
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin();
    const body = await request.json();
    const parsed = tournamentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const [created] = await db
      .insert(tournaments)
      .values({
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
