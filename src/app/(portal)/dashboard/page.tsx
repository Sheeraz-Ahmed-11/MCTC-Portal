// src/app/(portal)/dashboard/page.tsx
import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Trophy, Users, UserCheck, TrendingUp, Clock, ChevronRight } from "lucide-react";
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
      .select({ status: rosterEntries.status, count: sql<number>`count(*)::int` })
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
  const confirmed = rosterStats.find((s) => s.status === "confirmed")?.count ?? 0;
  const registered = rosterStats.find((s) => s.status === "registered")?.count ?? 0;
  const totalTeams = totalTeamsResult[0]?.count ?? 0;
  const pendingTeams = pendingTeamsResult[0]?.count ?? 0;
  const activeAthletes = athleteStatusStats.find((s) => s.status === "active")?.count ?? 0;
  const inactiveAthletes = athleteStatusStats.find((s) => s.status === "inactive")?.count ?? 0;

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
    <div className="space-y-8">
      <PageHeader
        title={isAdmin ? "Admin Dashboard" : "Dashboard"}
        description={
          isAdmin
            ? "Overview of all teams, athletes, and tournament activity."
            : "Your team's roster overview for MCTC tournaments."
        }
      />

      {/* ── Top stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Athletes in directory",
            value: totalAthletes,
            icon: Users,
            sub: isAdmin ? `${activeAthletes} active` : undefined,
          },
          {
            label: "Roster registrations",
            value: registered,
            icon: Trophy,
            sub: "across all tournaments",
          },
          {
            label: "Confirmed competitors",
            value: confirmed,
            icon: UserCheck,
            sub: "confirmed entries",
          },
          isAdmin
            ? {
                label: "Pending approvals",
                value: pendingTeams,
                icon: Clock,
                sub: `${totalTeams} total teams`,
                highlight: pendingTeams > 0,
              }
            : {
                label: "Active athletes",
                value: activeAthletes,
                icon: TrendingUp,
                sub: `${inactiveAthletes} inactive`,
              },
        ].map(({ label, value, icon: Icon, sub, highlight }) => (
          <Card
            key={label}
            className={
              highlight
                ? "border-[#a33030]/30 bg-[#a33030]/5"
                : "border-neutral-200 bg-white"
            }
          >
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    {label}
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold ${
                      highlight ? "text-[#a33030]" : "text-black"
                    }`}
                  >
                    {value}
                  </p>
                  {sub && (
                    <p className="mt-1 text-xs text-neutral-400">{sub}</p>
                  )}
                </div>
                <div
                  className={`rounded-lg p-2 ${
                    highlight ? "bg-[#a33030]/10" : "bg-neutral-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      highlight ? "text-[#a33030]" : "text-neutral-500"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Admin-only sections ── */}
      {isAdmin && (
        <>
          {/* Breakdowns row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Event type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventTypeStats.map((item) => (
                  <div key={item.eventType} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">{item.eventType}</span>
                    <span className="text-sm font-bold text-black">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Gender
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {genderStats.map((item) => (
                  <div key={item.gender} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">{item.gender}</span>
                    <span className="text-sm font-bold text-black">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Belt rank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {beltStats.map((item) => (
                  <div key={item.beltRank} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                      {item.beltRank.replace("_", " ")}
                    </span>
                    <span className="text-sm font-bold text-black">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Growth chart + top teams */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GrowthTrendChart data={growthTrend} />

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle>Top teams by athlete count</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Team
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Athletes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {perTeamCounts.map((team, i) => (
                      <tr key={team.teamName} className="border-b border-neutral-50 last:border-0">
                        <td className="py-2.5 text-neutral-700">{team.teamName}</td>
                        <td className="py-2.5 text-right font-semibold text-black">
                          {team.athleteCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Tournament participation + team history */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle>Tournament participation</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">Tournament</th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentParticipation.map((item) => (
                      <tr key={item.tournamentId} className="border-b border-neutral-50 last:border-0">
                        <td className="py-2.5 text-neutral-700">
                          {item.season === "spring" ? "Spring" : "Fall"} {item.year}
                          {item.tournamentName ? ` — ${item.tournamentName}` : ""}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-black">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle>Team history</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">Team</th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">Tournaments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamHistory.map((item) => (
                      <tr key={item.teamName} className="border-b border-neutral-50 last:border-0">
                        <td className="py-2.5 text-neutral-700">{item.teamName}</td>
                        <td className="py-2.5 text-right font-semibold text-black">
                          {item.tournaments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Athlete history */}
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle>Athlete history — top appearances</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">Athlete</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">Appearances</th>
                  </tr>
                </thead>
                <tbody>
                  {athleteHistory.map((item) => (
                    <tr key={item.athleteName} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 text-neutral-700">{item.athleteName}</td>
                      <td className="py-2.5 text-right font-semibold text-black">
                        {item.appearances}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Recent tournaments (all roles) ── */}
      <Card className="border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent tournaments</CardTitle>
          {isAdmin && (
            <Link
              href="/tournaments/new"
              className="text-xs font-medium text-[#a33030] hover:underline"
            >
              + New tournament
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 py-10 text-center">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-400">No tournaments yet.</p>
              {isAdmin && (
                <Link
                  href="/tournaments/new"
                  className="mt-2 inline-block text-sm font-medium text-[#a33030] hover:underline"
                >
                  Create the first one
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3.5 transition hover:border-[#a33030]/20 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-black">
                      {tournamentLabel(t.season, t.year, t.name)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {t.location ?? "Location TBD"}
                      {t.startDate ? ` · ${formatDate(t.startDate)}` : ""}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100"
                    >
                      {t.rosterEntries.length} on roster
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-neutral-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}