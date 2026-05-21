"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RestartOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestart() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ onboardingCompleted: false }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message || "Could not restart onboarding");
      }

      router.push("/onboarding");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to restart onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Restart the optional onboarding flow if you want to review setup or add initial athletes again.
        </p>
      </div>
      {error && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p>
      )}
      <Button onClick={handleRestart} disabled={loading}>
        {loading ? "Restarting…" : "Restart onboarding"}
      </Button>
    </div>
  );
}
