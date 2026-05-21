import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, tournamentLabel } from "@/lib/format";

export default async function TournamentsPage() {
  const list = await db.query.tournaments.findMany({
    orderBy: [desc(tournaments.year), desc(tournaments.createdAt)],
    with: { rosterEntries: true },
  });

  return (
    <>
      <PageHeader
        title="Tournaments"
        description="Spring and Fall MCTC events — each with its own athlete roster."
        action={{ href: "/tournaments/new", label: "New tournament" }}
      />

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tournaments created yet.
          </p>
        ) : (
          list.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card px-5 py-4 hover:bg-muted transition-colors sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {tournamentLabel(t.season, t.year, t.name)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.location ?? "Location TBD"}
                  {t.startDate ? ` · ${formatDate(t.startDate)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {t.season === "spring" ? "Spring" : "Fall"} {t.year}
                </Badge>
                <Badge>{t.rosterEntries.length} athletes</Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
