"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Ruler, Save } from "lucide-react";

export interface MeasurementValues {
  takenBy?: string | null;
  height?: string | null;
  weight?: string | null;
  braSize?: string | null;
  dressSize?: string | null;
  shoeSize?: string | null;
  bust?: string | null;
  underbust?: string | null;
  highBust?: string | null;
  shoulderWidth?: string | null;
  neck?: string | null;
  shoulderToWaist?: string | null;
  waist?: string | null;
  hip?: string | null;
  waistToFloor?: string | null;
  shoulderToFloor?: string | null;
  armhole?: string | null;
  bicep?: string | null;
  sleeveLength?: string | null;
  preferredFit?: string | null;
  corsetPref?: string | null;
  heelHeight?: string | null;
  trainLength?: string | null;
  posture?: string | null;
  notes?: string | null;
}

type Field = keyof MeasurementValues;

const SECTIONS: {
  title: string;
  hint?: string;
  fields: { name: Field; label: string; placeholder?: string }[];
}[] = [
  {
    title: "Body Info",
    fields: [
      { name: "height", label: "Height (barefoot)", placeholder: "e.g. 170cm" },
      { name: "weight", label: "Weight", placeholder: "optional" },
      { name: "braSize", label: "Bra Size", placeholder: "e.g. 34C" },
      { name: "dressSize", label: "Usual Dress Size", placeholder: "UK / US" },
      { name: "shoeSize", label: "Shoe Size" },
    ],
  },
  {
    title: "Upper Body",
    hint: "Tape snug, not tight. She stands straight and relaxed, in fitted underwear.",
    fields: [
      { name: "bust", label: "Bust (fullest)" },
      { name: "underbust", label: "Underbust" },
      { name: "highBust", label: "High Bust" },
      { name: "shoulderWidth", label: "Shoulder Width" },
      { name: "neck", label: "Neck Circumference" },
      { name: "shoulderToWaist", label: "Shoulder to Waist" },
    ],
  },
  {
    title: "Lower Body & Lengths",
    fields: [
      { name: "waist", label: "Natural Waist" },
      { name: "hip", label: "Full Hip (widest)" },
      { name: "waistToFloor", label: "Waist to Floor" },
      { name: "shoulderToFloor", label: "Shoulder to Floor" },
    ],
  },
  {
    title: "Arm Details",
    fields: [
      { name: "armhole", label: "Armhole" },
      { name: "bicep", label: "Bicep" },
      { name: "sleeveLength", label: "Sleeve Length" },
    ],
  },
];

const CHOICES: { name: Field; label: string; options: string[] }[] = [
  {
    name: "preferredFit",
    label: "Preferred Fit",
    options: ["Snatched / Fitted", "Comfortable Fit", "Relaxed Fit"],
  },
  {
    name: "corsetPref",
    label: "Corset Preference",
    options: ["Lace-up", "Zipper", "Visible Boning"],
  },
  {
    name: "posture",
    label: "Posture",
    options: ["Straight", "Slightly Stooped", "Curvy Lower Back"],
  },
];

export function MeasurementSheetForm({
  onboardingId,
  consultationId,
  clientName,
  initial,
  consultationCompleted,
}: {
  onboardingId: string;
  consultationId: string | null;
  clientName: string;
  initial: MeasurementValues | null;
  consultationCompleted: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<MeasurementValues>(initial ?? {});
  const [busy, setBusy] = useState<null | "save" | "complete">(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (name: Field, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  const save = async (complete: boolean) => {
    setBusy(complete ? "complete" : "save");
    setError(null);
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          onboardingId,
          consultationId,
          completeConsultation: complete,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Could not save the sheet.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
      if (complete && consultationId) {
        router.push(`/consultations/${consultationId}`);
      }
    } catch {
      setError("Connection issue — please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-10 pb-32">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Ruler size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-neutral-700">
            Taken by the studio during {clientName}&rsquo;s consultation. Record measurements in
            centimetres exactly as read — write &ldquo;86.5&rdquo; rather than rounding. Leave a
            field blank if it does not apply to her gown.
          </p>
        </div>
      </div>

      <Text
        label="Taken by"
        value={values.takenBy ?? ""}
        onChange={(v) => set("takenBy", v)}
        placeholder="Who measured her"
        wide
      />

      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="border-b border-primary/10 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {section.title}
          </h2>
          {section.hint && (
            <p className="mt-3 text-[11px] italic leading-relaxed text-neutral-500">
              {section.hint}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {section.fields.map((f) => (
              <Text
                key={f.name}
                label={f.label}
                placeholder={f.placeholder}
                value={(values[f.name] as string) ?? ""}
                onChange={(v) => set(f.name, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="border-b border-primary/10 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Fit &amp; Style
        </h2>
        <div className="mt-5 space-y-6">
          {CHOICES.map((c) => (
            <div key={c.name}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {c.label}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.options.map((opt) => {
                  const active = values[c.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set(c.name, active ? "" : opt)}
                      className={`rounded-full border px-4 py-2 text-xs transition ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Text
              label="Heel Height (wedding day)"
              placeholder="e.g. 4 inches"
              value={values.heelHeight ?? ""}
              onChange={(v) => set("heelHeight", v)}
            />
            <Text
              label="Train Length (agreed)"
              placeholder="e.g. Cathedral"
              value={values.trainLength ?? ""}
              onChange={(v) => set("trainLength", v)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="border-b border-primary/10 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Notes
        </h2>
        <textarea
          value={values.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder="Posture observations, asymmetry, anything the pattern cutter needs to know."
          className="mt-4 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      </section>

      {error && (
        <p className="rounded-2xl bg-red-50 px-5 py-3 text-xs text-red-700">{error}</p>
      )}

      {/* Sticky action bar — the designer is on a tablet with tape in hand. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            {saved ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <Check size={14} /> Saved
              </span>
            ) : (
              <>Sheet for <span className="font-semibold text-neutral-900">{clientName}</span></>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              {busy === "save" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save draft
            </button>
            {consultationId && !consultationCompleted && (
              <button
                type="button"
                onClick={() => save(true)}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy === "complete" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Save &amp; complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "max-w-sm" : ""}`}>
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20"
      />
    </div>
  );
}
