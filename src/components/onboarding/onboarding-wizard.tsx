"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { teko } from "@/lib/fonts/teko";
import { cn } from "@/lib/utils";

const totalSteps = 4;

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

const stepLabels = ["Welcome", "Team", "Athletes", "Finish"] as const;

const btnClass = cn(teko.className, "rounded-none uppercase tracking-wide");
const headingClass = cn(teko.className, "text-2xl font-medium uppercase tracking-wide sm:text-3xl");
const cardClass = "gap-0 rounded-none border-border py-5 shadow-none";
const cardStackClass = "flex flex-col gap-4 px-0 pl-2 pr-4 sm:pl-3";
const cardActionsClass = "flex flex-wrap gap-3 pt-3";
const dateInputClass = "onboarding-date-input rounded-none";
const errorAlertClass =
  "rounded-none border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary";
const successAlertClass =
  "rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400";

const athleteFieldOrder = [
  "fullName",
  "email",
  "age",
  "dateOfBirth",
  "gender",
  "weightClass",
  "eventType",
  "beltRank",
  "status",
  "weightKg",
  "club",
  "phone",
  "emergencyContact",
  "emergencyPhone",
  "notes",
] as const;

function focusNextField(currentId: string, order: readonly string[]) {
  const index = order.indexOf(currentId);
  if (index < 0 || index >= order.length - 1) return;
  document.getElementById(order[index + 1])?.focus();
}

function handleEnterFocusNext(
  event: KeyboardEvent<HTMLElement>,
  currentId: string,
  order: readonly string[],
) {
  if (event.key !== "Enter" || event.shiftKey) return;
  if (event.currentTarget instanceof HTMLTextAreaElement) return;
  event.preventDefault();
  focusNextField(currentId, order);
}

type AthleteForm = {
  fullName: string;
  age: string;
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
  age: "",
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
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number>(1);
  const [teamName, setTeamName] = useState(initialTeamName);
  const [athleteForm, setAthleteForm] = useState<AthleteForm>(defaultAthleteForm);
  const [savedAthletes, setSavedAthletes] = useState<AthleteForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function athleteFieldKeyDown(event: KeyboardEvent<HTMLElement>, fieldId: (typeof athleteFieldOrder)[number]) {
    handleEnterFocusNext(event, fieldId, athleteFieldOrder);
  }

  function goBack() {
    if (step > 1) {
      setStep((current) => current - 1);
      setError(null);
      setSuccess(null);
    }
  }

  function goToStep(target: number) {
    if (target < 1 || target > totalSteps || target === step) return;
    setStep(target);
    setError(null);
    setSuccess(null);
  }

  function getDateOfBirthFromAge(age: string) {
    const n = Number.parseInt(age, 10);
    if (!Number.isFinite(n) || n <= 0) return "";
    const today = new Date();
    const d = new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatApiError(error: unknown, fallback: string) {
    if (typeof error === "string") return error;
    if (!error || typeof error !== "object") return fallback;
    const flattened = error as {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
    const parts = [
      ...(flattened.formErrors ?? []),
      ...Object.entries(flattened.fieldErrors ?? {}).flatMap(([field, messages]) =>
        messages.map((message) => `${field}: ${message}`),
      ),
    ];
    return parts.length > 0 ? parts.join(". ") : fallback;
  }

  function resolveDateOfBirth(form: AthleteForm) {
    if (form.dateOfBirth) return form.dateOfBirth;
    return getDateOfBirthFromAge(form.age);
  }

  function scrollToWizardTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToWizardTopAfterPaint() {
    requestAnimationFrame(() => {
      setTimeout(() => scrollToWizardTop(), 0);
    });
  }

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
    setSuccess(null);
    const dateOfBirth = resolveDateOfBirth(athleteForm);
    if (!dateOfBirth) {
      setError("Enter age or date of birth.");
      setLoading(false);
      scrollToWizardTopAfterPaint();
      return;
    }
    try {
      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: athleteForm.fullName,
          dateOfBirth,
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
        throw new Error(formatApiError(body.error, "Could not save athlete"));
      }

      setSavedAthletes((prev) => [...prev, athleteForm]);
      setAthleteForm(defaultAthleteForm);
      setSuccess("Athlete added successfully.");
      scrollToWizardTopAfterPaint();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to add athlete");
      scrollToWizardTopAfterPaint();
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

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <Card className={cardClass}>
            <CardContent className={cardStackClass}>
              <CardTitle className={headingClass}>Welcome to MCTC Portal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get started with your team dashboard, add athletes, and manage rosters for upcoming tournaments.
              </p>
              <div className={cardActionsClass}>
                <Button onClick={() => setStep(2)} className={btnClass}>
                  Start setup
                </Button>
                <Button variant="outline" onClick={() => setStep(2)} className={btnClass}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className={cardClass}>
            <CardContent className={cardStackClass}>
              <CardTitle className={headingClass}>Confirm your team name</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your team name if needed before you start adding athletes.
              </p>
              <div className="max-w-md space-y-2">
                <Label htmlFor="teamName">Team name</Label>
                <Input
                  id="teamName"
                  required
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void updateTeamName();
                    }
                  }}
                  className="rounded-none"
                />
              </div>
              <div className={cardActionsClass}>
                <Button onClick={updateTeamName} disabled={loading} className={btnClass}>
                  Next
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className={btnClass}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className={cardClass}>
            <CardContent className={cardStackClass}>
              <CardTitle className={headingClass}>Add your first athletes</CardTitle>
              {savedAthletes.length > 0 && (
                <div className="space-y-2 border border-border bg-surface p-4">
                  <p className={cn(teko.className, "text-lg uppercase tracking-wide")}>Athletes added</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {savedAthletes.map((athlete, index) => (
                      <div key={`${athlete.fullName}-${index}`} className="border border-border p-3">
                        <p className="font-medium">{athlete.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {athlete.age ? `${athlete.age} yrs • ` : ""}
                          {athlete.eventType} • {athlete.weightClass} • {athlete.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    onKeyDown={(event) => athleteFieldKeyDown(event, "fullName")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={athleteForm.email}
                    onChange={(event) => setAthleteForm({ ...athleteForm, email: event.target.value })}
                    onKeyDown={(event) => athleteFieldKeyDown(event, "email")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={1}
                    value={athleteForm.age}
                    onChange={(event) => setAthleteForm({ ...athleteForm, age: event.target.value })}
                    onKeyDown={(event) => athleteFieldKeyDown(event, "age")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required={!athleteForm.age}
                    value={athleteForm.dateOfBirth}
                    onChange={(event) => setAthleteForm({ ...athleteForm, dateOfBirth: event.target.value })}
                    onKeyDown={(event) => athleteFieldKeyDown(event, "dateOfBirth")}
                    className={dateInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => setAthleteForm({ ...athleteForm, gender: value })}
                    value={athleteForm.gender}
                  >
                    <SelectTrigger
                      id="gender"
                      className="w-full rounded-none"
                      onKeyDown={(event) => athleteFieldKeyDown(event, "gender")}
                    >
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
                    <SelectTrigger
                      id="weightClass"
                      className="w-full rounded-none"
                      onKeyDown={(event) => athleteFieldKeyDown(event, "weightClass")}
                    >
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
                    <SelectTrigger
                      id="eventType"
                      className="w-full rounded-none"
                      onKeyDown={(event) => athleteFieldKeyDown(event, "eventType")}
                    >
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
                    <SelectTrigger
                      id="beltRank"
                      className="w-full rounded-none"
                      onKeyDown={(event) => athleteFieldKeyDown(event, "beltRank")}
                    >
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
                    <SelectTrigger id="status" className="w-full rounded-none">
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
                    onKeyDown={(event) => athleteFieldKeyDown(event, "weightKg")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club">Club</Label>
                  <Input
                    id="club"
                    value={athleteForm.club}
                    onChange={(event) => setAthleteForm({ ...athleteForm, club: event.target.value })}
                    onKeyDown={(event) => athleteFieldKeyDown(event, "club")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={athleteForm.phone}
                    onChange={(event) => setAthleteForm({ ...athleteForm, phone: event.target.value })}
                    onKeyDown={(event) => athleteFieldKeyDown(event, "phone")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency contact</Label>
                  <Input
                    id="emergencyContact"
                    value={athleteForm.emergencyContact}
                    onChange={(event) =>
                      setAthleteForm({ ...athleteForm, emergencyContact: event.target.value })
                    }
                    onKeyDown={(event) => athleteFieldKeyDown(event, "emergencyContact")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={athleteForm.emergencyPhone}
                    onChange={(event) =>
                      setAthleteForm({ ...athleteForm, emergencyPhone: event.target.value })
                    }
                    onKeyDown={(event) => athleteFieldKeyDown(event, "emergencyPhone")}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={athleteForm.notes}
                    onChange={(event) => setAthleteForm({ ...athleteForm, notes: event.target.value })}
                    rows={4}
                    className="rounded-none"
                  />
                </div>
              </div>
              <div className={cardActionsClass}>
                <Button id="add-athlete-btn" onClick={persistAthlete} disabled={loading} className={btnClass}>
                  Add athlete
                </Button>
                <Button variant="outline" onClick={() => setStep(4)} disabled={loading} className={btnClass}>
                  Continue
                </Button>
                <Button variant="outline" onClick={() => setStep(4)} disabled={loading} className={btnClass}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className={cardClass}>
            <CardContent className={cardStackClass}>
              <CardTitle className={headingClass}>You&apos;re ready</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your setup is saved. You can continue to your dashboard and manage athletes or tournament rosters
                anytime.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  Team name: <strong>{teamName || "Not set"}</strong>
                </p>
                <p>
                  Athletes added: <strong>{savedAthletes.length}</strong>
                </p>
              </div>
              <div className={cardActionsClass}>
                <Button onClick={completeOnboarding} disabled={loading} className={btnClass}>
                  Go to dashboard
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
    <div ref={topRef} className="w-full space-y-6">
      <div className="w-full space-y-4">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="justify-self-start">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className={cn(btnClass, "inline-flex gap-2")}
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Back
              </Button>
            ) : null}
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-mctc-gold">Onboarding</p>
            <h1
              className={cn(
                teko.className,
                "text-3xl font-medium uppercase tracking-wide text-white sm:text-4xl",
              )}
            >
              Portal setup
            </h1>
          </div>
          <div aria-hidden className="justify-self-end" />
        </div>

        <div className="w-full space-y-3">
          <div className="text-center text-xs uppercase tracking-widest text-white/50">
            Step {step} of {totalSteps} — {stepLabels[step - 1]}
          </div>
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
            <div aria-hidden />
            <ol className="flex list-none items-center justify-center gap-2 p-0 sm:gap-3">
              {Array.from({ length: totalSteps }, (_, idx) => {
                const stepNumber = idx + 1;
                const active = stepNumber === step;
                const complete = stepNumber < step;
                return (
                  <li key={stepNumber} className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep(stepNumber)}
                      aria-label={`Go to step ${stepNumber}: ${stepLabels[stepNumber - 1]}`}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        teko.className,
                        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border text-lg font-medium leading-none tabular-nums transition-colors",
                        "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#a33030]",
                        active
                          ? "border-[#a33030] bg-[#a33030] text-white"
                          : complete
                            ? "border-[#a33030]/70 bg-[#a33030]/20 text-white hover:bg-[#a33030]/30"
                            : "border-white/20 bg-transparent text-white/50 hover:border-white/40 hover:text-white/70",
                      )}
                    >
                      {stepNumber}
                    </button>
                    {stepNumber < totalSteps ? (
                      <span className="h-px w-6 bg-white/20 sm:w-10" aria-hidden />
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div aria-hidden />
          </div>
        </div>
      </div>

      {error ? <div className={errorAlertClass}>{error}</div> : null}
      {success ? <div className={successAlertClass}>{success}</div> : null}

      {renderStep()}
    </div>
  );
}
