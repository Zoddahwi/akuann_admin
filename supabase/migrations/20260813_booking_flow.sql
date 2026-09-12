-- Booking flow v2: designer review → consultation booking → measurements
-- Apply once against the shared Supabase database.
-- Safe to re-run: every statement is guarded.

-- ── Enums ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "OnboardingStatus" AS ENUM (
    'PENDING_REVIEW', 'ACCEPTED', 'DECLINED', 'CONSULTATION_BOOKED', 'CONSULTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConsultationFormat" AS ENUM ('IN_PERSON', 'VIRTUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConsultationStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ClientOnboarding: review + booking token ───────────────────────────────
ALTER TABLE "ClientOnboarding"
  ADD COLUMN IF NOT EXISTS "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  ADD COLUMN IF NOT EXISTS "reviewNote" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bookingToken" TEXT,
  ADD COLUMN IF NOT EXISTS "bookingTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "ClientOnboarding_bookingToken_key"
  ON "ClientOnboarding" ("bookingToken");
CREATE INDEX IF NOT EXISTS "ClientOnboarding_status_idx"
  ON "ClientOnboarding" ("status");

-- ── Consultation ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Consultation" (
  "id"              TEXT PRIMARY KEY,
  "onboardingId"    TEXT NOT NULL,
  "scheduledAt"     TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "format"          "ConsultationFormat" NOT NULL DEFAULT 'IN_PERSON',
  "location"        TEXT,
  "meetingLink"     TEXT,
  "status"          "ConsultationStatus" NOT NULL DEFAULT 'BOOKED',
  "clientNote"      TEXT,
  "studioNote"      TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Consultation_onboardingId_fkey"
    FOREIGN KEY ("onboardingId") REFERENCES "ClientOnboarding" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Consultation_onboardingId_key"
  ON "Consultation" ("onboardingId");
CREATE INDEX IF NOT EXISTS "Consultation_scheduledAt_idx"
  ON "Consultation" ("scheduledAt");
CREATE INDEX IF NOT EXISTS "Consultation_status_idx"
  ON "Consultation" ("status");

-- One active booking per time slot (cancelled / no-show slots are released).
CREATE UNIQUE INDEX IF NOT EXISTS "Consultation_active_slot_key"
  ON "Consultation" ("scheduledAt")
  WHERE "status" IN ('BOOKED', 'COMPLETED');

-- ── MeasurementSheet ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MeasurementSheet" (
  "id"              TEXT PRIMARY KEY,
  "onboardingId"    TEXT NOT NULL,
  "consultationId"  TEXT,
  "takenBy"         TEXT,
  "height"          TEXT,
  "weight"          TEXT,
  "braSize"         TEXT,
  "dressSize"       TEXT,
  "shoeSize"        TEXT,
  "bust"            TEXT,
  "underbust"       TEXT,
  "highBust"        TEXT,
  "shoulderWidth"   TEXT,
  "neck"            TEXT,
  "shoulderToWaist" TEXT,
  "waist"           TEXT,
  "hip"             TEXT,
  "waistToFloor"    TEXT,
  "shoulderToFloor" TEXT,
  "armhole"         TEXT,
  "bicep"           TEXT,
  "sleeveLength"    TEXT,
  "preferredFit"    TEXT,
  "corsetPref"      TEXT,
  "heelHeight"      TEXT,
  "trainLength"     TEXT,
  "posture"         TEXT,
  "notes"           TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeasurementSheet_onboardingId_fkey"
    FOREIGN KEY ("onboardingId") REFERENCES "ClientOnboarding" ("id") ON DELETE CASCADE,
  CONSTRAINT "MeasurementSheet_consultationId_fkey"
    FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MeasurementSheet_onboardingId_key"
  ON "MeasurementSheet" ("onboardingId");
CREATE UNIQUE INDEX IF NOT EXISTS "MeasurementSheet_consultationId_key"
  ON "MeasurementSheet" ("consultationId");
