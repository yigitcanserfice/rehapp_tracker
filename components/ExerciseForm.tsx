"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import { ImageInput } from "./ImageInput";

type ExerciseInput = Omit<Exercise, "id" | "createdAt" | "updatedAt">;

const base: ExerciseInput = {
  name: "",
  description: "",
  sets: 3,
  reps: 10,
  durationSeconds: undefined,
  timesPerDay: 1,
  image: undefined
};

export function ExerciseForm({
  initial,
  onCancel,
  onSave,
  onError
}: {
  initial?: Exercise;
  onCancel: () => void;
  onSave: (input: ExerciseInput) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState<ExerciseInput>(initial ?? base);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      onError("Hareket adi gerekli.");
      return;
    }
    if (!form.reps && !form.durationSeconds) {
      onError("Tekrar sayisi veya sure girin.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        sets: Math.max(1, Number(form.sets) || 1),
        reps: form.reps ? Math.max(1, Number(form.reps)) : undefined,
        durationSeconds: form.durationSeconds ? Math.max(1, Number(form.durationSeconds)) : undefined,
        timesPerDay: Math.max(1, Number(form.timesPerDay) || 1)
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <ImageInput value={form.image} onChange={(image) => setForm((prev) => ({ ...prev, image }))} onError={onError} />
      <Field label="Ad">
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="min-h-12 w-full rounded-lg border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
          placeholder="Orn. Omuz dis rotasyon"
        />
      </Field>
      <Field label="Aciklama / Not">
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-24 w-full rounded-lg border border-ink/10 bg-white px-3 py-3 outline-none focus:border-leaf"
          placeholder="Kisa not, dikkat edilecekler..."
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Set" value={form.sets} onChange={(sets) => setForm((prev) => ({ ...prev, sets: Number(sets) || 1 }))} />
        <NumberField label="Gunluk tekrar" value={form.timesPerDay} onChange={(timesPerDay) => setForm((prev) => ({ ...prev, timesPerDay: Number(timesPerDay) || 1 }))} />
        <NumberField label="Tekrar" value={form.reps ?? ""} onChange={(reps) => setForm((prev) => ({ ...prev, reps: reps || undefined }))} />
        <NumberField label="Sure sn" value={form.durationSeconds ?? ""} onChange={(durationSeconds) => setForm((prev) => ({ ...prev, durationSeconds: durationSeconds || undefined }))} />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="min-h-12 flex-1 rounded-lg border border-ink/10 bg-white font-bold text-ink">
          Vazgec
        </button>
        <button disabled={saving} className="min-h-12 flex-1 rounded-lg bg-leaf font-bold text-white disabled:opacity-60">
          Kaydet
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        className="min-h-12 w-full rounded-lg border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
      />
    </Field>
  );
}
