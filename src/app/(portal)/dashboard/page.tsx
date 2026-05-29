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
  if (!isAdmin) {
    redirect("/tournaments");
  }

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
    db.select({ status: rosterEntries.status, count: sql<number>`count(*)::int` })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(rosterEntries.status),
    db.select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), sql`team_name IS NOT NULL AND role = 'coach'`)
          : sql`team_name IS NOT NULL AND role = 'coach'`,
      ),
    db.select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), sql`role = 'coach' AND status = 'pending'`)
          : sql`role = 'coach' AND status = 'pending'`,
      ),
    db.select({ status: athletes.status, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.status),
    db.select({ eventType: athletes.eventType, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.eventType),
    db.select({ gender: athletes.gender, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.gender),
    db.select({ beltRank: athletes.beltRank, count: sql<number>`count(*)::int` })
      .from(athletes)
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.beltRank)
      .orderBy(sql`count(*) DESC`)
      .limit(8),
    db.select({ teamName: profiles.teamName, athleteCount: sql<number>`count(*)::int` })
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
    db.select({
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
      .groupBy(rosterEntries.tournamentId, tournaments.name, tournaments.season, tournaments.year, tournaments.createdAt)
      .orderBy(desc(tournaments.year), desc(tournaments.createdAt)),
    db.select({ teamName: profiles.teamName, tournaments: sql<number>`count(distinct roster_entries.tournament_id)::int` })
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
    db.select({
        athleteName: sql<string>`concat(${athletes.firstName}, ' ', ${athletes.lastName})`,
        appearances: sql<number>`count(*)::int`,
      })
      .from(rosterEntries)
      .leftJoin(athletes, eq(rosterEntries.athleteId, athletes.id))
      .where(profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined)
      .groupBy(athletes.id, athletes.firstName, athletes.lastName)
      .orderBy(sql`count(*) DESC`)
      .limit(6),
    db.select({ year: sql<number>`extract(year from profiles.created_at)::int`, teams: sql<number>`count(*)::int` })
      .from(profiles)
      .where(
        profile.role === "coach"
          ? and(eq(profiles.id, profile.id), eq(profiles.role, "coach"))
          : eq(profiles.role, "coach"),
      )
      .groupBy(sql`extract(year from profiles.created_at)::int`)
      .orderBy(sql`extract(year from profiles.created_at)::int`),
    db.select({ year: sql<number>`extract(year from athletes.created_at)::int`, athletes: sql<number>`count(*)::int` })
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
    return { year: profileItem.year, teams: profileItem.teams, athletes: athleteItem?.athletes ?? 0 };
  });

  const currentYear = new Date().getFullYear();
  const upcoming = recentTournaments.filter((t) => t.year >= currentYear - 1);

  /* ── Shared table styles ── */
  const th = "pb-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30";
  const thRight = "pb-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/30";
  const tr = "border-b border-white/[0.05] last:border-0";
  const td = "py-2.5 text-sm text-white/70";
  const tdRight = "py-2.5 text-right text-sm font-semibold text-white";

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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Athletes in directory",
            value: totalAthletes,
            icon: Users,
            sub: isAdmin ? `${activeAthletes} active` : undefined,
            highlight: false,
          },
          {
            label: "Roster registrations",
            value: registered,
            icon: Trophy,
            sub: "across all tournaments",
            highlight: false,
          },
          {
            label: "Confirmed competitors",
            value: confirmed,
            icon: UserCheck,
            sub: "confirmed entries",
            highlight: false,
          },
          isAdmin
            ? { label: "Pending approvals", value: pendingTeams, icon: Clock, sub: `${totalTeams} total teams`, highlight: pendingTeams > 0 }
            : { label: "Active athletes", value: activeAthletes, icon: TrendingUp, sub: `${inactiveAthletes} inactive`, highlight: false },
        ].map(({ label, value, icon: Icon, sub, highlight }) => (
          <div
            key={label}
            className={`rounded-xl border p-5 ${
              highlight
                ? "border-[#a33030]/40 bg-[#a33030]/10"
                : "border-white/8 bg-[#161616]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  {label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${highlight ? "text-[#c45050]" : "text-white"}`}>
                  {value}
                </p>
                {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
              </div>
              <div className={`rounded-lg p-2 ${highlight ? "bg-[#a33030]/20" : "bg-white/6"}`}>
                <Icon className={`h-5 w-5 ${highlight ? "text-[#c45050]" : "text-white/40"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin sections */}
      {isAdmin && (
        <>
          {/* Breakdowns */}
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: "Event type", rows: eventTypeStats.map((i) => ({ label: i.eventType, value: i.count })) },
              { title: "Gender", rows: genderStats.map((i) => ({ label: i.gender, value: i.count })) },
              { title: "Belt rank", rows: beltStats.map((i) => ({ label: i.beltRank.replace("_", " "), value: i.count })) },
            ].map(({ title, rows }) => (
              <div key={title} className="rounded-xl border border-white/8 bg-[#161616] p-5">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-white/35">{title}</p>
                <div className="space-y-3">
                  {rows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{label}</span>
                      <span className="text-sm font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Growth chart + top teams */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GrowthTrendChart data={growthTrend} />
            <div className="rounded-xl border border-white/8 bg-[#161616] p-5">
              <p className="mb-4 text-sm font-semibold text-white">Top teams by athlete count</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className={th}>Team</th>
                    <th className={thRight}>Athletes</th>
                  </tr>
                </thead>
                <tbody>
                  {perTeamCounts.map((team) => (
                    <tr key={team.teamName} className={tr}>
                      <td className={td}>{team.teamName}</td>
                      <td className={tdRight}>{team.athleteCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tournament participation + team history */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-[#161616] p-5">
              <p className="mb-4 text-sm font-semibold text-white">Tournament participation</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className={th}>Tournament</th>
                    <th className={thRight}>Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentParticipation.map((item) => (
                    <tr key={item.tournamentId} className={tr}>
                      <td className={td}>
                        {item.season === "spring" ? "Spring" : "Fall"} {item.year}
                        {item.tournamentName ? ` — ${item.tournamentName}` : ""}
                      </td>
                      <td className={tdRight}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-white/8#161616] p-5">
              <p className="mb-4 text-sm font-semibold text-white">Team history</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className={th}>Team</th>
                    <th className={thRight}>Tournaments</th>
                  </tr>
                </thead>
                <tbody>
                  {teamHistory.map((item) => (
                    <tr key={item.teamName} className={tr}>
                      <td className={td}>{item.teamName}</td>
                      <td className={tdRight}>{item.tournaments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Athlete history */}
          <div className="rounded-xl border border-white/8 bg-[#161616] p-5">
            <p className="mb-4 text-sm font-semibold text-white">Athlete history — top appearances</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className={th}>Athlete</th>
                  <th className={thRight}>Appearances</th>
                </tr>
              </thead>
              <tbody>
                {athleteHistory.map((item) => (
                  <tr key={item.athleteName} className={tr}>
                    <td className={td}>{item.athleteName}</td>
                    <td className={tdRight}>{item.appearances}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Recent tournaments */}
      <div className="rounded-xl border border-white/8 bg-[#161616] p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Recent tournaments</p>
          {isAdmin && (
            <Link href="/tournaments/new" className="text-xs font-medium text-[#c45050] hover:underline">
              + New tournament
            </Link>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/8 py-10 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/35">No tournaments yet.</p>
            {isAdmin && (
              <Link href="/tournaments/new" className="mt-2 inline-block text-sm font-medium text-[#c45050] hover:underline">
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
                className="flex items-center justify-between rounded-lg border border-white/6 px-4 py-3.5 transition hover:border-[#a33030]/30 hover:bg-white/3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {tournamentLabel(t.season, t.year, t.name)}
                  </p>
                  <p className="mt-0.5 text-xs text-white/35">
                    {t.location ?? "Location TBD"}
                    {t.startDate ? ` · ${formatDate(t.startDate)}` : ""}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2 shrink-0">
                  <span className="rounded-md bg-white/8 px-2.5 py-1 text-xs font-medium text-white/60">
                    {t.rosterEntries.length} on roster
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}