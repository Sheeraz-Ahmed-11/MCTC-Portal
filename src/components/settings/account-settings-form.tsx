"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettingsForm({
  initialFullName,
  initialEmail,
  initialAvatarUrl,
}: {
  initialFullName: string;
  initialEmail: string;
  initialAvatarUrl?: string;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName,
          email,
          avatarUrl,
          oldPassword: oldPassword || undefined,
          password: password || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Unable to update account.",
        );
      }
      setMessage(body.message ?? "Account updated.");
      setOldPassword("");
      setPassword("");
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unable to update account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="accountFullName">Name</Label>
        <Input
          id="accountFullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountEmail">Email</Label>
        <Input
          id="accountEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountAvatarUrl">Profile photo URL</Label>
        <Input
          id="accountAvatarUrl"
          type="url"
          placeholder="https://example.com/profile.jpg"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountOldPassword">Current password</Label>
        <Input
          id="accountOldPassword"
          type="password"
          placeholder="Required only when changing password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          className="rounded-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountPassword">New password</Label>
        <Input
          id="accountPassword"
          type="password"
          placeholder="Leave blank to keep current password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-none"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
      <Button type="submit" disabled={saving} className="rounded-none">
        {saving ? "Saving..." : "Save account details"}
      </Button>
    </form>
  );
}
