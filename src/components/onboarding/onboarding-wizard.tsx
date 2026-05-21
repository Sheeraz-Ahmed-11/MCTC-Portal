"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const beltOptions = ["white", "yellow", "green", "blue", "red", "black"] as const;
const weightClassOptions = [
  "finweight",
  "flyweight",
  "bantamweight",
  "featherweight",
  "lightweight",
  "welterweight",
  "middleweight",
  "heavyweight",
] as const;
const genderOptions = ["male", "female", "other"] as const;
const eventTypeOptions = ["sparring", "poomsae"] as const;
const statusOptions = ["active", "inactive"] as const;

type AthleteForm = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  beltRank: string;
  eventType: string;
  status: string;
  weightClass: string;
  weightKg: string;
  club: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
};

const defaultAthleteForm: AthleteForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "male",
  beltRank: "white",
  eventType: "sparring",
  status: "active",
  weightClass: "finweight",
  weightKg: "",
  club: "",
  email: "",
  phone: "",
  emergencyContact: "",
  emergencyPhone: "",
  notes: "",
};

interface OnboardingWizardProps {
  initialTeamName: string;
}

export function OnboardingWizard({ initialTeamName }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [teamName, setTeamName] = useState(initialTeamName);
  const [athleteForm, setAthleteForm] = useState<AthleteForm>(defaultAthleteForm);
  const [savedAthletes, setSavedAthletes] = useState<AthleteForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function updateTeamName() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message || "Could not save team name");
      }

      setSuccess("Team name saved.");
      setStep(3);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to save team name");
    } finally {
      setLoading(false);
    }
  }

  async function persistAthlete() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: athleteForm.fullName,
          dateOfBirth: athleteForm.dateOfBirth,
          gender: athleteForm.gender,
          beltRank: athleteForm.beltRank,
          eventType: athleteForm.eventType,
          weightClass: athleteForm.weightClass,
          status: athleteForm.status,
          weightKg: athleteForm.weightKg || undefined,
          club: athleteForm.club || undefined,
          email: athleteForm.email || undefined,
          phone: athleteForm.phone || undefined,
          emergencyContact: athleteForm.emergencyContact || undefined,
          emergencyPhone: athleteForm.emergencyPhone || undefined,
          notes: athleteForm.notes || undefined,
        }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message || "Could not save athlete");
      }

      setSavedAthletes((prev) => [...prev, athleteForm]);
      setAthleteForm(defaultAthleteForm);
      setSuccess("Athlete added successfully.");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to add athlete");
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message || "Could not complete onboarding");
      }

      router.push("/dashboard");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to finish onboarding");
    } finally {
      setLoading(false);
    }
  }

  async function skipOnboarding() {
    await completeOnboarding();
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to MCTC Portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get started with your team dashboard, add athletes, and manage rosters for upcoming tournaments.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setStep(2)}>Start setup</Button>
                <Button variant="outline" onClick={skipOnboarding} disabled={loading}>
                  Skip onboarding and go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Confirm your team name</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Update your team name if needed before you start adding athletes.
              </p>
              <div className="space-y-2">
                <Label htmlFor="teamName">Team name</Label>
                <Input
                  id="teamName"
                  required
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={updateTeamName} disabled={loading}>
                  Next
                </Button>
                <Button variant="outline" onClick={skipOnboarding} disabled={loading}>
                  Skip setup
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Add your first athletes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add athletes one at a time. You can always add more later from the Athletes page.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    required
                    value={athleteForm.fullName}
                    onChange={(event) => setAthleteForm({ ...athleteForm, fullName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={athleteForm.email}
                    onChange={(event) => setAthleteForm({ ...athleteForm, email: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={athleteForm.dateOfBirth}
                    onChange={(event) => setAthleteForm({ ...athleteForm, dateOfBirth: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, gender: value })}
                    value={athleteForm.gender}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightClass">Weight class</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, weightClass: value })}
                    value={athleteForm.weightClass}
                  >
                    <SelectTrigger id="weightClass" className="w-full">
                      <SelectValue placeholder="Select a weight class" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightClassOptions.map((weightClass) => (
                        <SelectItem key={weightClass} value={weightClass}>
                          {weightClass.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event type</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, eventType: value })}
                    value={athleteForm.eventType}
                  >
                    <SelectTrigger id="eventType" className="w-full">
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeOptions.map((eventType) => (
                        <SelectItem key={eventType} value={eventType}>
                          {eventType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beltRank">Belt rank</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, beltRank: value })}
                    value={athleteForm.beltRank}
                  >
                    <SelectTrigger id="beltRank" className="w-full">
                      <SelectValue placeholder="Select a belt rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {beltOptions.map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Athlete status</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, status: value })}
                    value={athleteForm.status}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.01"
                    value={athleteForm.weightKg}
                    onChange={(event) => setAthleteForm({ ...athleteForm, weightKg: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club">Club</Label>
                  <Input
                    id="club"
                    value={athleteForm.club}
                    onChange={(event) => setAthleteForm({ ...athleteForm, club: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={athleteForm.phone}
                    onChange={(event) => setAthleteForm({ ...athleteForm, phone: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency contact</Label>
                  <Input
                    id="emergencyContact"
                    value={athleteForm.emergencyContact}
                    onChange={(event) => setAthleteForm({ ...athleteForm, emergencyContact: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={athleteForm.emergencyPhone}
                    onChange={(event) => setAthleteForm({ ...athleteForm, emergencyPhone: event.target.value })}
                  />
                </div>
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={athleteForm.notes}
                    onChange={(event) => setAthleteForm({ ...athleteForm, notes: event.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              {savedAthletes.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
                  <p className="text-sm font-semibold">Athletes added so far</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {savedAthletes.map((athlete, index) => (
                      <div key={`${athlete.fullName}-${index}`} className="rounded-lg border border-border p-3">
                        <p className="font-medium">{athlete.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {athlete.eventType} • {athlete.weightClass} • {athlete.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={persistAthlete} disabled={loading}>
                  Add athlete
                </Button>
                <Button variant="outline" onClick={() => setStep(4)} disabled={loading}>
                  Continue
                </Button>
                <Button variant="secondary" onClick={skipOnboarding} disabled={loading}>
                  Skip and go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>You&apos;re ready</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your setup is saved. You can continue to your dashboard and manage athletes or tournament rosters anytime.
              </p>
              <div className="space-y-2">
                <p className="text-sm">Team name: <strong>{teamName || "Not set"}</strong></p>
                <p className="text-sm">Athletes added: <strong>{savedAthletes.length}</strong></p>
              </div>
              <div className="flex gap-3">
                <Button onClick={completeOnboarding} disabled={loading}>
                  Go to dashboard
                </Button>
                <Button variant="outline" onClick={skipOnboarding} disabled={loading}>
                  Skip and go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.25em] text-mctc-gold">Onboarding</p>
        <h1 className="text-3xl font-bold">Portal setup</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Complete the optional onboarding flow once to set up your team and athletes.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          {success}
        </div>
      )}

      {renderStep()}
    </div>
  );
}
