"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BELT_OPTIONS,
  EVENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  WEIGHT_CLASS_OPTIONS,
} from "@/lib/constants";

type Initial = Record<string, string | undefined> & { id?: string };

export function AthleteForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(initial?.status ?? "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;

    if (status) {
      payload.status = status;
    }

    const response = await fetch(
      initial?.id ? `/api/athletes/${initial.id}` : "/api/athletes",
      {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      setError(typeof data.error === "string" ? data.error : "Failed to save athlete");
      setLoading(false);
      return;
    }

    const data = await response.json();
    router.push(`/athletes/${data.id}`);
    router.refresh();
  }

  const defaultFullName = initial?.firstName || initial?.lastName
    ? `${initial?.firstName ?? ""} ${initial?.lastName ?? ""}`.trim()
    : "";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6"
    >
      {error && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          required
          defaultValue={defaultFullName}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={initial?.email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            defaultValue={initial?.dateOfBirth}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <NativeSelect
            id="gender"
            name="gender"
            defaultValue={initial?.gender ?? "male"}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightClass">Weight class</Label>
          <NativeSelect
            id="weightClass"
            name="weightClass"
            defaultValue={initial?.weightClass ?? WEIGHT_CLASS_OPTIONS[0].value}
          >
            {WEIGHT_CLASS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventType">Event type</Label>
          <NativeSelect
            id="eventType"
            name="eventType"
            defaultValue={initial?.eventType ?? EVENT_TYPE_OPTIONS[0].value}
          >
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <input type="hidden" name="status" value={status} />
        <ToggleGroup
          type="single"
          value={status}
          onValueChange={(value) => value && setStatus(value)}
        >
          <ToggleGroupItem value="active">Active</ToggleGroupItem>
          <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="beltRank">Belt / skill level</Label>
          <NativeSelect
            id="beltRank"
            name="beltRank"
            defaultValue={initial?.beltRank ?? "white"}
          >
            {BELT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.1"
            defaultValue={initial?.weightKg}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="club">Club / Dojang</Label>
          <Input id="club" name="club" defaultValue={initial?.club} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={initial?.phone} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency contact</Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            defaultValue={initial?.emergencyContact}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency phone</Label>
          <Input
            id="emergencyPhone"
            name="emergencyPhone"
            defaultValue={initial?.emergencyPhone}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={initial?.notes} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : initial?.id ? "Update athlete" : "Add athlete"}
      </Button>
    </form>
  );
}
