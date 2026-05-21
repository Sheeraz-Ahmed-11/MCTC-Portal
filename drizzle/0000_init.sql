CREATE TYPE "public"."user_role" AS ENUM('admin', 'coach');
CREATE TYPE "public"."profile_status" AS ENUM('pending', 'approved', 'rejected', 'deactivated');
CREATE TYPE "public"."athlete_status" AS ENUM('active', 'inactive');
CREATE TYPE "public"."event_type" AS ENUM('sparring', 'poomsae');
CREATE TYPE "public"."season" AS ENUM('spring', 'fall');
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');
CREATE TYPE "public"."roster_status" AS ENUM('registered', 'confirmed', 'withdrawn');

CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"team_name" text,
	"role" "user_role" DEFAULT 'coach' NOT NULL,
	"status" "profile_status" DEFAULT 'pending' NOT NULL,
	"onboarding_completed" boolean NOT NULL DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"season" "season" NOT NULL,
	"year" integer NOT NULL,
	"location" text,
	"start_date" date,
	"end_date" date,
	"registration_open" timestamp with time zone DEFAULT now() NOT NULL,
	"registration_close" timestamp with time zone,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "athletes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" "gender" NOT NULL,
	"belt_rank" text NOT NULL,
	"status" "athlete_status" DEFAULT 'active' NOT NULL,
	"weight_class" text,
	"event_type" "event_type" NOT NULL DEFAULT 'sparring',
	"weight_kg" numeric(5, 2),
	"club" text,
	"email" text,
	"phone" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "roster_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"athlete_id" uuid NOT NULL,
	"division" text,
	"weight_class" text,
	"status" "roster_status" DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"registered_by" uuid,
	"notes" text
);

ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "roster_entries" ADD CONSTRAINT "roster_entries_registered_by_profiles_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX "roster_tournament_athlete_idx" ON "roster_entries" USING btree ("tournament_id","athlete_id");
