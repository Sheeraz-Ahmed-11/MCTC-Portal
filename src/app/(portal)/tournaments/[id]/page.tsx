import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes, rosterEntries, tournaments } from "@/lib/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { RosterManager } from "@/components/tournaments/roster-manager";
import { Badge } from "@/components/ui/badge";
import { formatDate, tournamentLabel } from "@/lib/format";
import { requireProfile } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export default async function TournamentDetailPage({ params }: Props) {
  const { profile } = await requireProfile();
  const { id } = await params;

  const [tournament, allAthletes, rosterEntriesData] = await Promise.all([
    db.query.tournaments.findFirst({
      where: eq(tournaments.id, id),
      with: {
        rosterEntries: {
          with: { athlete: true },
        },
      },
    }),
    db.query.athletes.findMany({
      where:
        profile.role === "coach"
          ? eq(athletes.createdBy, profile.id)
          : undefined,
      orderBy: [asc(athletes.lastName), asc(athletes.firstName)],
    }),
    db.query.rosterEntries.findMany({
      where: eq(rosterEntries.tournamentId, id),
      with: { athlete: true },
    }),
  ]);

  if (!tournament) notFound();

  const roster = [...rosterEntriesData]
    .filter((entry) =>
      profile.role === "admin" ? true : entry.athlete.createdBy === profile.id,
    )
    .sort(
      (a, b) =>
        a.athlete.lastName.localeCompare(b.athlete.lastName) ||
        a.athlete.firstName.localeCompare(b.athlete.firstName),
    )
    .map((e) => ({
      id: e.id,
      division: e.division,
      weightClass: e.weightClass,
      status: e.status,
      athlete: {
        id: e.athlete.id,
        firstName: e.athlete.firstName,
        lastName: e.athlete.lastName,
        dateOfBirth: e.athlete.dateOfBirth,
        beltRank: e.athlete.beltRank,
        club: e.athlete.club,
      },
    }));


  const now = new Date();
  const registrationOpen = new Date(tournament.registrationOpen);
  const registrationClose = tournament.registrationClose
    ? new Date(tournament.registrationClose)
    : null;
  const registrationActive =
    now >= registrationOpen && (registrationClose === null || now < registrationClose);
  const registrationBadge = registrationActive
    ? `Registration open until ${formatDate(registrationClose)}`
    : registrationClose && now >= registrationClose
    ? `Registration closed ${formatDate(registrationClose)}`
    : `Registration opens ${formatDate(registrationOpen)}`;

  return (
    <>
      <PageHeader
        title={tournamentLabel(tournament.season, tournament.year, tournament.name)}
        description={tournament.notes ?? "Manage the competition roster for this event."}
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {tournament.season === "spring" ? "Spring" : "Fall"} {tournament.year}
        </Badge>
        {tournament.location && <Badge variant="secondary">{tournament.location}</Badge>}
        {tournament.startDate && (
          <Badge variant="secondary">{formatDate(tournament.startDate)}</Badge>
        )}
        <Badge>{roster.length} on roster</Badge>
        <Badge>{registrationBadge}</Badge>
      </div>

      <RosterManager
        tournamentId={tournament.id}
        roster={roster}
        registrationOpen={registrationOpen.toISOString()}
        registrationClose={registrationClose?.toISOString() ?? null}
        athletes={allAthletes.map((a) => ({
          id: a.id,
          firstName: a.firstName,
          lastName: a.lastName,
          dateOfBirth: a.dateOfBirth,
          beltRank: a.beltRank,
        }))}
      />
    </>
  );
}
