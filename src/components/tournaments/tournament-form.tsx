"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SEASON_OPTIONS } from "@/lib/constants";

const currentYear = new Date().getFullYear();

function formatDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function TournamentForm({ initial }: { initial?: Record<string, string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch(
      initial?.id ? `/api/tournaments/${initial.id}` : "/api/tournaments",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "Failed to save tournament");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/tournaments/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
    >
      {error && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Tournament name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? "MCTC Championship"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <NativeSelect id="season" name="season" defaultValue={initial?.season ?? "spring"}>
            {SEASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={initial?.year ?? String(currentYear)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={initial?.location} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initial?.startDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={initial?.endDate}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="registrationOpen">Registration opens</Label>
          <Input
            id="registrationOpen"
            name="registrationOpen"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(initial?.registrationOpen ?? new Date().toISOString())}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationClose">Registration closes</Label>
          <Input
            id="registrationClose"
            name="registrationClose"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(initial?.registrationClose)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={initial?.notes} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : initial?.id ? "Update tournament" : "Create tournament"}
      </Button>
    </form>
  );
}
