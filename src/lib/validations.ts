import { z } from "zod";
import { beltRanks } from "@/lib/db/schema";

export const athleteSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(120).optional(),
    firstName: z.string().min(1, "First name is required").max(80).optional(),
    lastName: z.string().min(1, "Last name is required").max(80).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    gender: z.enum(["male", "female", "other"]),
    beltRank: z.enum(["white", "yellow", "green", "blue", "red", "black"]),
    status: z.enum(["active", "inactive"]).optional(),
    weightClass: z.string().min(1, "Weight class is required").max(80),
    eventType: z.enum(["sparring", "poomsae"]),
    weightKg: z.string().optional(),
    club: z.string().max(120).optional(),
    email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    avatarUrl: z.union([z.string().url("Enter a valid image URL"), z.literal("")]).optional(),
    phone: z.string().max(30).optional(),
    emergencyContact: z.string().max(120).optional(),
    emergencyPhone: z.string().max(30).optional(),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.fullName && (!value.firstName || !value.lastName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a full name or both first and last name",
        path: ["fullName"],
      });
    }
  });

export const tournamentSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  season: z.enum(["spring", "fall"]),
  year: z.coerce.number().int().min(2020).max(2100),
  location: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationOpen: z.string().optional(),
  registrationClose: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const rosterEntrySchema = z.object({
  tournamentId: z.string().uuid(),
  athleteId: z.string().uuid(),
  division: z.string().max(80).optional(),
  weightClass: z.string().max(40).optional(),
  status: z.enum(["registered", "confirmed", "withdrawn"]).optional(),
  notes: z.string().max(500).optional(),
});

export type AthleteInput = z.infer<typeof athleteSchema>;
export type TournamentInput = z.infer<typeof tournamentSchema>;
export type RosterEntryInput = z.infer<typeof rosterEntrySchema>;

