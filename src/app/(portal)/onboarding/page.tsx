import { requireProfile } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const { profile } = await requireProfile();

  return <OnboardingWizard initialTeamName={profile.teamName ?? ""} />;
}
