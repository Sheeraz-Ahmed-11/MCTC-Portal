import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes } from "@/lib/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { BELT_RANK_LABELS } from "@/lib/constants";
import { calculateAge } from "@/lib/format";

export default async function AthletesPage() {
  const list = await db.query.athletes.findMany({
    orderBy: [asc(athletes.lastName), asc(athletes.firstName)],
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
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No athletes yet. Add your first competitor.
                </td>
              </tr>
            ) : (
              list.map((a) => (
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
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/athletes/${a.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
