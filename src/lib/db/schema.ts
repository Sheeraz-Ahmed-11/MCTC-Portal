import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  numeric,
  boolean,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["admin", "coach"]);
export const profileStatusEnum = pgEnum("profile_status", ["pending", "approved", "rejected", "deactivated"]);
export const athleteStatusEnum = pgEnum("athlete_status", ["active", "inactive"]);
export const seasonEnum = pgEnum("season", ["spring", "fall"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const eventTypeEnum = pgEnum("event_type", ["sparring", "poomsae"]);
export const rosterStatusEnum = pgEnum("roster_status", [
  "registered",
  "confirmed",
  "withdrawn",
]);

export const beltRanks = [
  "white",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
  "brown",
  "red",
  "red_black",
  "black",
] as const;

export type BeltRank = (typeof beltRanks)[number];

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  teamName: text("team_name"),
  role: userRoleEnum("role").notNull().default("coach"),
  status: profileStatusEnum("status").notNull().default("pending"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  season: seasonEnum("season").notNull(),
  year: integer("year").notNull(),
  location: text("location"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  registrationOpen: timestamp("registration_open", { withTimezone: true })
    .notNull()
    .defaultNow(),
  registrationClose: timestamp("registration_close", { withTimezone: true }),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatarUrl: text("avatar_url"),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  beltRank: text("belt_rank").notNull(),
  status: athleteStatusEnum("status").notNull().default("active"),
  weightClass: text("weight_class"),
  eventType: eventTypeEnum("event_type").notNull().default("sparring"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  club: text("club"),
  email: text("email"),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rosterEntries = pgTable(
  "roster_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    athleteId: uuid("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    division: text("division"),
    weightClass: text("weight_class"),
    status: rosterStatusEnum("status").notNull().default("registered"),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    registeredBy: uuid("registered_by").references(() => profiles.id),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("roster_tournament_athlete_idx").on(
      table.tournamentId,
      table.athleteId,
    ),
  ],
);

export const profilesRelations = relations(profiles, ({ many }) => ({
  tournaments: many(tournaments),
  athletes: many(athletes),
}));

export const tournamentsRelations = relations(tournaments, ({ many, one }) => ({
  rosterEntries: many(rosterEntries),
  creator: one(profiles, {
    fields: [tournaments.createdBy],
    references: [profiles.id],
  }),
}));

export const athletesRelations = relations(athletes, ({ many }) => ({
  rosterEntries: many(rosterEntries),
}));

export const rosterEntriesRelations = relations(rosterEntries, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [rosterEntries.tournamentId],
    references: [tournaments.id],
  }),
  athlete: one(athletes, {
    fields: [rosterEntries.athleteId],
    references: [athletes.id],
  }),
}));

