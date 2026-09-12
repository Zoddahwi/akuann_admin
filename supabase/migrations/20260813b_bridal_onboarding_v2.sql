-- Bridal Client Onboarding form v2 (12 sections).
-- Adds the new field set and relaxes the one legacy NOT NULL column that the
-- new form no longer collects. Existing rows keep their legacy values.
-- Safe to re-run.

ALTER TABLE "ClientOnboarding"
  -- 01 The Bride
  ADD COLUMN IF NOT EXISTS "preferredName"           TEXT,
  ADD COLUMN IF NOT EXISTS "hearAboutUs"             TEXT,

  -- 02 Your Wedding
  ADD COLUMN IF NOT EXISTS "weddingCityCountry"      TEXT,
  ADD COLUMN IF NOT EXISTS "weddingTypes"            TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "weddingStyleTheme"       TEXT,
  ADD COLUMN IF NOT EXISTS "guestCount"              TEXT,
  ADD COLUMN IF NOT EXISTS "weddingPlanner"          TEXT,

  -- 03 Your Bridal Look
  ADD COLUMN IF NOT EXISTS "bridalServices"          TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "numberOfLooks"           TEXT,
  ADD COLUMN IF NOT EXISTS "dreamGownDescription"    TEXT,

  -- 04 Your Bridal Aesthetic
  ADD COLUMN IF NOT EXISTS "visionWords"             TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "silhouettePrefs"         TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "necklinePrefs"           TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "sleevePrefs"             TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "trainPrefs"              TEXT[] NOT NULL DEFAULT '{}',

  -- 05 Fabric, Colour & Embellishment
  ADD COLUMN IF NOT EXISTS "bridalColour"            TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "bridalColourOther"       TEXT,
  ADD COLUMN IF NOT EXISTS "fabricPrefs"             TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "embellishmentPrefs"      TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "hasFabric"               TEXT,
  ADD COLUMN IF NOT EXISTS "fabricImageUrl"          TEXT,

  -- 06 Your Inspiration
  ADD COLUMN IF NOT EXISTS "hasInspiration"          TEXT,
  ADD COLUMN IF NOT EXISTS "inspirationImageUrls"    TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "lovedElements"           TEXT,
  ADD COLUMN IF NOT EXISTS "avoidedElements"         TEXT,
  ADD COLUMN IF NOT EXISTS "moodBoardLink"           TEXT,

  -- 07 Bridal Party
  ADD COLUMN IF NOT EXISTS "bridalPartyOutfits"      TEXT,
  ADD COLUMN IF NOT EXISTS "bridalPartyMembers"      TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "bridalPartyCount"        TEXT,
  ADD COLUMN IF NOT EXISTS "bridalPartyColours"      TEXT,
  ADD COLUMN IF NOT EXISTS "bridalPartyCoordination" TEXT,

  -- 08 Fit & Personal Preferences
  ADD COLUMN IF NOT EXISTS "preferredFit"            TEXT,
  ADD COLUMN IF NOT EXISTS "attentionAreas"          TEXT,
  ADD COLUMN IF NOT EXISTS "avoidFeatures"           TEXT,
  ADD COLUMN IF NOT EXISTS "comfortRequirements"     TEXT,

  -- 09 Your Investment
  ADD COLUMN IF NOT EXISTS "investmentRange"         TEXT,
  ADD COLUMN IF NOT EXISTS "looksCovered"            TEXT,

  -- 10 Timeline
  ADD COLUMN IF NOT EXISTS "desiredCompletionDate"   TEXT,
  ADD COLUMN IF NOT EXISTS "dateFlexibility"         TEXT,
  ADD COLUMN IF NOT EXISTS "isRushOrder"             TEXT,
  ADD COLUMN IF NOT EXISTS "rushTimeline"            TEXT,
  ADD COLUMN IF NOT EXISTS "bookedAnotherDesigner"   TEXT,

  -- 11 Consultation preferences (indicative — the booking link is binding)
  ADD COLUMN IF NOT EXISTS "preferredConsultFormat"  TEXT,
  ADD COLUMN IF NOT EXISTS "preferredConsultDate"    TEXT,
  ADD COLUMN IF NOT EXISTS "preferredConsultTime"    TEXT,
  ADD COLUMN IF NOT EXISTS "consultationGoals"       TEXT,
  ADD COLUMN IF NOT EXISTS "consultantNotes"         TEXT,

  -- 12 Acknowledgement
  ADD COLUMN IF NOT EXISTS "acknowledgements"        TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "declarationName"         TEXT,
  ADD COLUMN IF NOT EXISTS "agreedToTerms"           BOOLEAN NOT NULL DEFAULT FALSE;

-- The v2 form captures silhouette as a multi-select, so the old single-value
-- column is no longer written. Existing rows keep whatever they hold.
ALTER TABLE "ClientOnboarding"
  ALTER COLUMN "desiredSilhouette" DROP NOT NULL;
