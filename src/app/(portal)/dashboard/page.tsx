import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Trophy, Users, UserCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/auth";
import { profiles, tournaments, athletes, rosterEntries } from "@/lib/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, tournamentLabel } from "@/lib/format";
import { GrowthTrendChart } from "@/components/dashboard/growth-trend-chart";

export default async function DashboardPage() {
  const { profile } = await requireProfile();

  if (
    profile.role === "coach" &&
    profile.status === "approved" &&
    !profile.onboardingCompleted
  ) {
    redirect("/onboarding");
  }
  const isAdmin = profile.role === "admin";

  const [
    recentTournaments,
    athleteCount,
    rosterStats,
    totalTeamsResult,
    pendingTeamsResult,
    athleteStatusStats,
    eventTypeStats,
    genderStats,
    beltStats,
    perTeamCounts,
    tournamentParticipation,
    teamHistory,
    athleteHistory,
    profileGrowth,
    athleteGrowth,
  ] = await Promise.all([
    db.query.tournaments.findMany({
      orderBy: [desc(tournaments.year), desc(tournaments.createdAt)],
      limit: 4,
      with: { rosterEntries: true },
    }),
    db.select({ count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined),
    db
      .select({
        status: rosterEntries.status,
        count: sql<number>`count(*)::int`,
      })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(rosterEntries.status),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), sql`team_name IS NOT NULL AND role = 'coach'`)
          : sql`team_name IS NOT NULL AND role = 'coach'`,
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), sql`role = 'coach' AND status = 'pending'`)
          : sql`role = 'coach' AND status = 'pending'`,
      ),
    db
      .select({ status: athletes.status, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.status),
    db
      .select({ eventType: athletes.eventType, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.eventType),
    db
      .select({ gender: athletes.gender, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.gender),
    db
      .select({ beltRank: athletes.beltRank, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.beltRank)
      .orderBy(sql`count(*) DESC`)
      .limit(8),
    db
      .select({
        teamName: profiles.teamName,
        athleteCount: sql<number>`count(*)::int`,
      })
      .from(athletes)
      .leftJoin(profiles, eq(athletes.createdBy, profiles.id))
      .where(
        profile.role === "coach"
          ? and(eq(athletes.createdBy, profile.id), sql`profiles.team_name IS NOT NULL`)
          : sql`profiles.team_name IS NOT NULL`,
      )
      .groupBy(profiles.teamName)
      .orderBy(sql`count(*) DESC`)
      .limit(6),
    db
      .select({
        tournamentId: rosterEntries.tournamentId,
        tournamentName: tournaments.name,
        season: tournaments.season,
        year: tournaments.year,
        count: sql<number>`count(*)::int`,
      })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .leftJoin(tournaments, eq(rosterEntries.tournamentId, tournaments.id))
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(
        rosterEntries.tournamentId,
        tournaments.name,
        tournaments.season,
        tournaments.year,
        tournaments.createdAt,
      )
      .orderBy(desc(tournaments.year), desc(tournaments.createdAt)),
    db
      .select({
        teamName: profiles.teamName,
        tournaments: sql<number>`count(distinct roster_entries.tournament_id)::int`,
      })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .leftJoin(profiles, eq(athletes.createdBy, profiles.id))
      .where(
        profile.role === "coach"
          ? and(eq(athletes.createdBy, profile.id), sql`profiles.team_name IS NOT NULL`)
          : sql`profiles.team_name IS NOT NULL`,
      )
      .groupBy(profiles.teamName)
      .orderBy(sql`count(distinct roster_entries.tournament_id) DESC`)
      .limit(6),
    db
      .select({
        athleteName: sql<string>`concat(${athletes.firstName}, ' ', ${athletes.lastName})`,
        appearances: sql<number>`count(*)::int`,
      })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.id, athletes.firstName, athletes.lastName)
      .orderBy(sql`count(*) DESC`)
      .limit(6),
    db
      .select({
        year: sql<number>`extract(year from profiles.created_at)::int`,
        teams: sql<number>`count(*)::int`,
      })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), eq(profiles.role, "coach"))
          : eq(profiles.role, "coach"),
      )
      .groupBy(sql`extract(year from profiles.created_at)::int`)
      .orderBy(sql`extract(year from profiles.created_at)::int`),
    db
      .select({
        year: sql<number>`extract(year from athletes.created_at)::int`,
        athletes: sql<number>`count(*)::int`,
      })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(sql`extract(year from athletes.created_at)::int`)
      .orderBy(sql`extract(year from athletes.created_at)::int`),
  ]);

  const totalAthletes = athleteCount[0]?.count ?? 0;
  const confirmed =
    rosterStats.find((s) => s.status === "confirmed")?.count ?? 0;
  const registered =
    rosterStats.find((s) => s.status === "registered")?.count ?? 0;
  const totalTeams = totalTeamsResult[0]?.count ?? 0;
  const pendingTeams = pendingTeamsResult[0]?.count ?? 0;
  const activeAthletes =
    athleteStatusStats.find((s) => s.status === "active")?.count ?? 0;
  const inactiveAthletes =
    athleteStatusStats.find((s) => s.status === "inactive")?.count ?? 0;

  const growthTrend = profileGrowth.map((profileItem) => {
    const athleteItem = athleteGrowth.find((item) => item.year === profileItem.year);
    return {
      year: profileItem.year,
      teams: profileItem.teams,
      athletes: athleteItem?.athletes ?? 0,
    };
  });

  const currentYear = new Date().getFullYear();
  const upcoming = recentTournaments.filter((t) => t.year >= currentYear - 1);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          isAdmin
            ? "Administrative overview of teams, athletes, tournament participation, and growth trends."
            : "Overview of MCTC Spring and Fall tournament rosters."
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {[
          {
            label: "Athletes in directory",
            value: totalAthletes,
            icon: Users,
          },
          {
            label: "Roster registrations",
            value: registered,
            icon: Trophy,
          },
          {
            label: "Confirmed competitors",
            value: confirmed,
            icon: UserCheck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/15 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin ? (
        <>
          <div className="grid gap-4 xl:grid-cols-3 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Team registry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Registered teams</p>
                  <p className="text-2xl font-bold">{totalTeams}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending approvals</p>
                  <Badge variant="secondary">{pendingTeams}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Athlete activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active athletes</p>
                  <p className="text-2xl font-bold">{activeAthletes}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Inactive athletes</p>
                  <p className="text-2xl font-bold">{inactiveAthletes}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breakdowns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {eventTypeStats.map((item) => (
                    <div key={item.eventType} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.eventType}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Gender breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {genderStats.map((item) => (
                  <div key={item.gender} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.gender}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Belt rank breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {beltStats.map((item) => (
                  <div key={item.beltRank} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.beltRank.replace("_", " ")}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-10">
            <CardHeader>
              <CardTitle>Top teams by athlete count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="py-3">Team</th>
                      <th className="py-3 text-right">Athletes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perTeamCounts.map((team) => (
                      <tr key={team.teamName} className="border-b border-border">
                        <td className="py-3">{team.teamName}</td>
                        <td className="py-3 text-right font-semibold">{team.athleteCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Tournament participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="py-3">Tournament</th>
                        <th className="py-3">Season</th>
                        <th className="py-3 text-right">Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournamentParticipation.map((item) => (
                        <tr key={item.tournamentId} className="border-b border-border">
                          <td className="py-3">{item.tournamentName || "Unnamed"}</td>
                          <td className="py-3">
                            {item.tournamentName
                              ? `${item.tournamentName} (${item.season === "spring" ? "Spring" : "Fall"} ${item.year})`
                              : `${item.season === "spring" ? "Spring" : "Fall"} ${item.year}`}
                          </td>
                          <td className="py-3 text-right font-semibold">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team history</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="py-3">Team</th>
                        <th className="py-3 text-right">Tournaments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamHistory.map((item) => (
                        <tr key={item.teamName} className="border-b border-border">
                          <td className="py-3">{item.teamName}</td>
                          <td className="py-3 text-right font-semibold">{item.tournaments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2 mb-10">
            <Card>
              <CardHeader>
                <CardTitle>Athlete history</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="py-3">Athlete</th>
                        <th className="py-3 text-right">Appearances</th>
                      </tr>
                    </thead>
                    <tbody>
                      {athleteHistory.map((item) => (
                        <tr key={item.athleteName} className="border-b border-border">
                          <td className="py-3">{item.athleteName}</td>
                          <td className="py-3 text-right font-semibold">{item.appearances}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <GrowthTrendChart data={growthTrend} />
          </div>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent tournaments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tournaments yet.{" "}
              <Link href="/tournaments/new" className="text-primary">
                Create the first one
              </Link>
              .
            </p>
          ) : (
            upcoming.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">
                    {tournamentLabel(t.season, t.year, t.name)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.location ?? "Location TBD"}
                    {t.startDate ? ` · ${formatDate(t.startDate)}` : ""}
                  </p>
                </div>
                <Badge>
                  {t.rosterEntries.length} on roster
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
