import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestartOnboarding } from "@/components/settings/restart-onboarding";

export default async function SettingsPage() {
  const { profile } = await requireProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your team account settings and restart the onboarding flow if needed."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Your current profile settings.</p>
            <div className="space-y-2">
              <p className="text-sm">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Team name</p>
              <p className="font-medium">{profile.teamName ?? "Not set"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Approval status</p>
              <Badge>{profile.status}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Onboarding status</p>
              <Badge>{profile.onboardingCompleted ? "Completed" : "Not completed"}</Badge>
            </div>
          </CardContent>
        </Card>
        <RestartOnboarding />
      </div>
    </div>
  );
}
