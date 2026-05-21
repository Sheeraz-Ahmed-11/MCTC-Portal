import { PageHeader } from "@/components/layout/page-header";
import { AthleteForm } from "@/components/athletes/athlete-form";

export default function NewAthletePage() {
  return (
    <>
      <PageHeader
        title="Add athlete"
        description="Register a new competitor in the club directory."
      />
      <AthleteForm />
    </>
  );
}
