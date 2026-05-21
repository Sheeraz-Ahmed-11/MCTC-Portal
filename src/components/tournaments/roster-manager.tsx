"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { BELT_RANK_LABELS } from "@/lib/constants";
import { calculateAge, suggestDivision } from "@/lib/format";

type AthleteOption = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  beltRank: string;
};

type RosterRow = {
  id: string;
  division: string | null;
  weightClass: string | null;
  status: "registered" | "confirmed" | "withdrawn";
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    beltRank: string;
    club: string | null;
  };
};

export function RosterManager({
  tournamentId,
  roster,
  registrationOpen,
  registrationClose,
  athletes,
}: {
  tournamentId: string;
  roster: RosterRow[];
  registrationOpen: string;
  registrationClose: string | null;
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [athleteId, setAthleteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const open = new Date(registrationOpen);
  const close = registrationClose ? new Date(registrationClose) : null;
  const isRegistrationOpen =
    new Date() >= open && (close === null || new Date() < close);

  const onRoster = new Set(roster.map((r) => r.athlete.id));
  const available = athletes.filter((a) => !onRoster.has(a.id));

  async function addToRoster() {
    if (!athleteId) return;
    setLoading(true);
    setError("");

    const athlete = athletes.find((a) => a.id === athleteId);
    const division = athlete
      ? suggestDivision(calculateAge(athlete.dateOfBirth))
      : undefined;

    if (!isRegistrationOpen) {
      setError("Roster changes are locked because registration is closed.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId, athleteId, division }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not add to roster");
      setLoading(false);
      return;
    }

    setAthleteId("");
    setLoading(false);
    router.refresh();
  }

  async function updateStatus(entryId: string, status: RosterRow["status"]) {
    if (!isRegistrationOpen) {
      setError("Roster changes are locked because registration is closed.");
      return;
    }

    await fetch(`/api/roster/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function removeFromRoster(entry: RosterRow) {
    if (!isRegistrationOpen) {
      setError("Roster changes are locked because registration is closed.");
      return;
    }

    if (!confirm(`Remove ${entry.athlete.firstName} ${entry.athlete.lastName} from roster?`)) {
      return;
    }
    await fetch(
      `/api/roster?tournamentId=${tournamentId}&athleteId=${entry.athlete.id}`,
      { method: "DELETE" },
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {!isRegistrationOpen ? (
        <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
          Registration for this tournament is closed. Roster additions, removals, and status updates are locked for planning.
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Add athlete to roster</label>
          <NativeSelect
            value={athleteId}
            onChange={(e) => setAthleteId(e.target.value)}
          >
            <option value="">Select athlete…</option>
            {available.map((a) => (
              <option key={a.id} value={a.id}>
                {a.lastName}, {a.firstName} (
                {BELT_RANK_LABELS[a.beltRank] ?? a.beltRank})
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button onClick={addToRoster} disabled={loading || !athleteId || !isRegistrationOpen}>
          Add to roster
        </Button>
      </div>
      {error && (
        <p className="text-sm text-primary">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Athlete</th>
              <th className="px-4 py-3 font-medium">Club</th>
              <th className="px-4 py-3 font-medium">Division</th>
              <th className="px-4 py-3 font-medium">Belt</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No athletes on this roster yet.
                </td>
              </tr>
            ) : (
              roster.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-border"
                >
                  <td className="px-4 py-3 font-medium">
                    {entry.athlete.lastName}, {entry.athlete.firstName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.athlete.club ?? "—"}
                  </td>
                  <td className="px-4 py-3">{entry.division ?? "—"}</td>
                  <td className="px-4 py-3">
                    {BELT_RANK_LABELS[entry.athlete.beltRank] ??
                      entry.athlete.beltRank}
                  </td>
                  <td className="px-4 py-3">
                    <NativeSelect
                      value={entry.status}
                      onChange={(e) =>
                        updateStatus(
                          entry.id,
                          e.target.value as RosterRow["status"],
                        )
                      }
                      disabled={!isRegistrationOpen}
                      className="h-8 text-xs"
                    >
                      <option value="registered">Registered</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="withdrawn">Withdrawn</option>
                    </NativeSelect>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!isRegistrationOpen}
                      onClick={() => removeFromRoster(entry)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
