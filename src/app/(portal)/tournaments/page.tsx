import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments } from "@/lib/db/schema";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, tournamentLabel } from "@/lib/format";

export default async function TournamentsPage() {
  const { profile } = await requireProfile();
  const isAdmin = profile.role === "admin";
  const list = await db.query.tournaments.findMany({
    orderBy: [desc(tournaments.year), desc(tournaments.createdAt)],
    with: { rosterEntries: true },
  });

  return (
    <>
      <PageHeader
        title="Tournaments"
        description="Spring and Fall MCTC events — each with its own athlete roster."
        action={isAdmin ? { href: "/tournaments/new", label: "New tournament" } : undefined}
      />

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tournaments are active right now.
          </p>
        ) : (
          list.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="flex flex-col gap-2 rounded-none border border-border bg-card px-5 py-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
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
