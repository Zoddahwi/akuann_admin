import { CheckCircle2 } from "lucide-react";
import type { ClientOnboarding } from "@prisma/client";

/**
 * The bride's filled onboarding form, rendered in full — the same twelve
 * sections she completed. Shared by the review queue and the single
 * submission page so the designer always reads the identical document.
 */
export function OnboardingSubmission({ client }: { client: ClientOnboarding }) {
  return (
    <div className="grid grid-cols-1 gap-0 divide-y divide-neutral-100 md:grid-cols-2 md:divide-y-0 md:divide-x">
      <div className="space-y-8 p-8">
        <Block n="01" title="The Bride">
          <Detail label="Preferred name" value={client.preferredName} />
          <Detail label="WhatsApp / Phone" value={client.phoneNumber} />
          <Detail label="Email" value={client.emailAddress} breakAll />
          <Detail label="Instagram" value={client.instagramHandle} />
          <Detail label="Heard about us" value={client.hearAboutUs} />
        </Block>

        <Block n="02" title="Your Wedding">
          <Detail label="Wedding date" value={client.eventDate} />
          <Detail label="Venue" value={client.ceremonyLocation} />
          <Detail label="Country / city" value={client.weddingCityCountry} />
          <Chips label="Type" values={client.weddingTypes} />
          <Detail label="Style / theme" value={client.weddingStyleTheme} />
          <Detail label="Guests" value={client.guestCount} />
          <Detail label="Planner" value={client.weddingPlanner} />
        </Block>

        <Block n="03" title="Bridal Look">
          <Chips label="Services" values={client.bridalServices} />
          <Detail label="Number of looks" value={client.numberOfLooks} />
          <Long label="Dream gown" value={client.dreamGownDescription} />
        </Block>

        <Block n="04" title="Aesthetic">
          <Chips label="Vision words" values={client.visionWords} />
          <Chips label="Silhouette" values={client.silhouettePrefs} outline />
          <Chips label="Neckline" values={client.necklinePrefs} outline />
          <Chips label="Sleeves" values={client.sleevePrefs} outline />
          <Chips label="Train" values={client.trainPrefs} outline />
        </Block>

        <Block n="05" title="Fabric, Colour & Embellishment">
          <Chips label="Colour" values={client.bridalColour} />
          <Detail label="Colour (other)" value={client.bridalColourOther} />
          <Chips label="Fabric" values={client.fabricPrefs} outline />
          <Chips label="Embellishment" values={client.embellishmentPrefs} outline />
          <Detail label="Already has fabric" value={client.hasFabric} />
          <Images
            label="Fabric image"
            urls={client.fabricImageUrl ? [client.fabricImageUrl] : []}
          />
        </Block>

        <Block n="06" title="Inspiration">
          <Detail label="Has references" value={client.hasInspiration} />
          <Images label="Inspiration images" urls={client.inspirationImageUrls} />
          <Long label="Loves" value={client.lovedElements} />
          <Long label="Does not want" value={client.avoidedElements} />
          <LinkOut label="Mood board" href={client.moodBoardLink} />
        </Block>
      </div>

      <div className="space-y-8 bg-neutral-50/30 p-8">
        <Block n="07" title="Bridal Party">
          <Detail label="Outfits for party" value={client.bridalPartyOutfits} />
          <Chips label="Who" values={client.bridalPartyMembers} outline />
          <Detail label="Members" value={client.bridalPartyCount} />
          <Detail label="Colour / dress code" value={client.bridalPartyColours} />
          <Detail label="Wants coordination" value={client.bridalPartyCoordination} />
        </Block>

        <Block n="08" title="Fit & Preferences">
          <Detail label="Preferred fit" value={client.preferredFit} />
          <Long label="Attention areas" value={client.attentionAreas} />
          <Long label="Features to avoid" value={client.avoidFeatures} />
          <Long label="Comfort / movement" value={client.comfortRequirements} />
        </Block>

        <Block n="09" title="Investment">
          <Detail label="Range" value={client.investmentRange} emphasis />
          <Detail label="Looks covered" value={client.looksCovered} />
        </Block>

        <Block n="10" title="Timeline">
          <Detail label="Completion wanted" value={client.desiredCompletionDate} />
          <Detail label="Date flexibility" value={client.dateFlexibility} />
          <Detail
            label="Rush order"
            value={client.isRushOrder}
            emphasis={client.isRushOrder === "Yes"}
          />
          <Long label="Rush timeline" value={client.rushTimeline} />
          <Detail
            label="Booked another designer"
            value={client.bookedAnotherDesigner}
          />
        </Block>

        <Block n="11" title="Consultation preference">
          <Detail label="Format" value={client.preferredConsultFormat} />
          <Detail label="Preferred date" value={client.preferredConsultDate} />
          <Detail label="Preferred time" value={client.preferredConsultTime} />
          <Long label="Her goals" value={client.consultationGoals} />
          <Long label="For the consultant" value={client.consultantNotes} />
        </Block>

        <Block n="12" title="Acknowledgement">
          <Detail
            label="Terms accepted"
            value={`${client.acknowledgements.length} of 8`}
          />
          <Detail label="Signed" value={client.declarationName} />
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400">Agreed</span>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold ${
                client.agreedToTerms ? "text-emerald-600" : "text-neutral-400"
              }`}
            >
              {client.agreedToTerms ? <CheckCircle2 size={14} /> : null}
              {client.agreedToTerms ? "Yes" : "Not confirmed"}
            </span>
          </div>
        </Block>

        {client.desiredSilhouette && (
          <Block n="—" title="Legacy submission">
            <Detail label="Silhouette" value={client.desiredSilhouette} />
            <Chips label="Gown types" values={client.typeOfGown} outline />
            <Chips label="Budget" values={client.budgetRange} outline />
            <Long label="Three words" value={client.threeWords} />
          </Block>
        )}
      </div>
    </div>
  );
}

/** One numbered section of her submission. */
function Block({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        <span className="text-neutral-300">{n}</span>
        {title}
      </h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function Detail({
  label,
  value,
  breakAll = false,
  emphasis = false,
}: {
  label: string;
  value?: string | null;
  breakAll?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <span
        className={`font-medium ${emphasis ? "text-primary" : "text-neutral-800"} ${
          breakAll ? "break-all" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/** Free-text answers, which run long enough to need their own treatment. */
function Long({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-neutral-700">
        {value}
      </p>
    </div>
  );
}

function LinkOut({ label, href }: { label: string; href?: string | null }) {
  if (!href) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="break-all text-xs font-medium text-primary underline underline-offset-2"
      >
        {href}
      </a>
    </div>
  );
}

function Images({ label, urls }: { label: string; urls: string[] }) {
  if (!urls.length) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {urls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {/* Remote Supabase Storage URLs — plain img avoids host config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className="h-20 w-20 rounded-xl border border-neutral-200 object-cover transition hover:opacity-80"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function Chips({
  label,
  values,
  outline = false,
}: {
  label: string;
  values: string[];
  outline?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1">
        {values.length === 0 && <span className="text-xs text-neutral-400">—</span>}
        {values.map((v) => (
          <span
            key={v}
            className={
              outline
                ? "rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-500"
                : "rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
            }
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
