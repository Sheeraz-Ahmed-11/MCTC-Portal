import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes } from "@/lib/db/schema";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BELT_RANK_LABELS } from "@/lib/constants";
import { calculateAge, tournamentLabel } from "@/lib/format";

export default async function AthletesPage() {
  const { profile } = await requireProfile();
  const list = await db.query.athletes.findMany({
    where: profile.role === "coach" ? eq(athletes.createdBy, profile.id) : undefined,
    orderBy: [asc(athletes.lastName), asc(athletes.firstName)],
    with: {
      rosterEntries: {
        with: { tournament: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Athletes"
        description="Club directory — add competitors once, register them for any tournament."
        action={{ href: "/athletes/new", label: "Add athlete" }}
      />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Belt</th>
              <th className="px-4 py-3 font-medium">Club</th>
              <th className="px-4 py-3 font-medium">Tournaments</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No athletes yet. Add your first competitor.
                </td>
              </tr>
            ) : (
              list.map((a) => {
                const tournaments = a.rosterEntries
                  .map((entry) => entry.tournament)
                  .sort((left, right) => right.year - left.year);

                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      {a.lastName}, {a.firstName}
                    </td>
                    <td className="px-4 py-3">{calculateAge(a.dateOfBirth)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {BELT_RANK_LABELS[a.beltRank] ?? a.beltRank}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.club ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {tournaments.length === 0 ? (
                        <span className="text-muted-foreground">
                          Not in any tournament
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {tournaments.map((t) => (
                            <Link
                              key={t.id}
                              href={`/tournaments/${t.id}`}
                              className="inline-flex"
                            >
                              <Badge
                                variant="outline"
                                className="rounded-none hover:bg-muted"
                              >
                                {tournamentLabel(t.season, t.year, t.name)}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/athletes/${a.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
