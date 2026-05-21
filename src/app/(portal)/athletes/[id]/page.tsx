import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { athletes } from "@/lib/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { AthleteForm } from "@/components/athletes/athlete-form";
import { calculateAge } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function AthleteDetailPage({ params }: Props) {
  const { id } = await params;
  const athlete = await db.query.athletes.findFirst({
    where: eq(athletes.id, id),
  });

  if (!athlete) notFound();

  return (
    <>
      <PageHeader
        title={`${athlete.firstName} ${athlete.lastName}`}
        description={`Age ${calculateAge(athlete.dateOfBirth)} · Edit profile and contact details.`}
      />
      <AthleteForm
        initial={{
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          dateOfBirth: athlete.dateOfBirth,
          gender: athlete.gender,
          beltRank: athlete.beltRank,
          weightKg: athlete.weightKg ?? undefined,
          club: athlete.club ?? undefined,
          email: athlete.email ?? undefined,
          phone: athlete.phone ?? undefined,
          emergencyContact: athlete.emergencyContact ?? undefined,
          emergencyPhone: athlete.emergencyPhone ?? undefined,
          notes: athlete.notes ?? undefined,
        }}
      />
    </>
  );
}
