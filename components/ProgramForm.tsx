"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import type { Exercise, Program } from "@/lib/types";

export function ProgramForm({
  initial,
  exercises,
  onCancel,
  onSave,
  onError
}: {
  initial?: Program;
  exercises: Exercise[];
  onCancel: () => void;
  onSave: (input: Pick<Program, "name" | "exerciseIds" | "isActive">) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [exerciseIds, setExerciseIds] = useState<string[]>(initial?.exerciseIds ?? exercises.map((exercise) => exercise.id));
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      onError("Program adi gerekli.");
      return;
    }
    if (exerciseIds.length === 0) {
      onError("Programa en az bir hareket ekleyin.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), exerciseIds, isActive });
    } finally {
      setSaving(false);
    }
  }

  function toggleExercise(id: string) {
    setExerciseIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function move(id: string, direction: -1 | 1) {
    setExerciseIds((prev) => {
      const index = prev.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-ink">Program adi</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="min-h-12 w-full rounded-lg border border-ink/10 px-3 outline-none focus:border-leaf"
          placeholder="Orn. Sabah rutini"
        />
      </label>
      <label className="flex min-h-12 items-center gap-3 rounded-lg bg-mint px-3 font-bold text-ink">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-5 w-5 accent-leaf" />
        Aktif program yap
      </label>
      <div>
        <p className="mb-2 text-sm font-bold text-ink">Hareketler ve sira</p>
        <div className="space-y-2">
          {exercises.map((exercise) => {
            const checked = exerciseIds.includes(exercise.id);
            return (
              <div key={exercise.id} className="flex min-h-14 items-center gap-2 rounded-lg border border-ink/10 px-3">
                <input type="checkbox" checked={checked} onChange={() => toggleExercise(exercise.id)} className="h-5 w-5 accent-leaf" />
                <span className="min-w-0 flex-1 font-semibold">{exercise.name}</span>
                {checked ? (
                  <>
                    <button type="button" onClick={() => move(exercise.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5" aria-label="Yukari tasi">
                      <ArrowUp size={18} />
                    </button>
                    <button type="button" onClick={() => move(exercise.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5" aria-label="Asagi tasi">
                      <ArrowDown size={18} />
                    </button>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
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
