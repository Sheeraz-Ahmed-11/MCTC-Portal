export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateAge(dateOfBirth: string | Date): number {
  const dob =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function suggestDivision(age: number): string {
  if (age <= 7) return "Pee Wee";
  if (age <= 11) return "Children";
  if (age <= 14) return "Junior";
  if (age <= 17) return "Cadet";
  if (age <= 32) return "Senior";
  return "Master";
}

export function tournamentLabel(season: string, year: number, name?: string) {
  const seasonLabel = season === "spring" ? "Spring" : "Fall";
  return name ? `${name} (${seasonLabel} ${year})` : `${seasonLabel} ${year}`;
}
