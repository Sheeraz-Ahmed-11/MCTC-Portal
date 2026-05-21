import { PageHeader } from "@/components/layout/page-header";
import { TournamentForm } from "@/components/tournaments/tournament-form";

export default function NewTournamentPage() {
  return (
    <>
      <PageHeader
        title="New tournament"
        description="Create a Spring or Fall MCTC championship event."
      />
      <TournamentForm />
    </>
  );
}
