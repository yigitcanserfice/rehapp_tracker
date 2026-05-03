"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseSummary } from "@/components/ExerciseSummary";
import { Toast } from "@/components/Toast";
import { db } from "@/lib/db";
import { addExercise, deleteExercise, seedIfNeeded, updateExercise } from "@/lib/store";
import type { Exercise } from "@/lib/types";

export default function ExercisesPage() {
  const [editing, setEditing] = useState<Exercise | "new" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    seedIfNeeded().catch(() => flash("Ornek veriler olusturulamadi."));
  }, []);

  const exercises = useLiveQuery(() => db.exercises.orderBy("createdAt").toArray(), []) ?? [];

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  return (
    <AppShell
      title="Hareketler"
      subtitle="Fotograf, set, tekrar, sure ve gunluk tekrar bilgilerini burada yonet."
      action={
        <button onClick={() => setEditing("new")} className="flex h-12 w-12 items-center justify-center rounded-lg bg-leaf text-white shadow-soft" aria-label="Hareket ekle">
          <Plus size={22} />
        </button>
      }
    >
      <Toast message={message} />
      <div className="space-y-4">
        {editing ? (
          <ExerciseForm
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onError={flash}
            onSave={async (input) => {
              if (editing === "new") await addExercise(input);
              else await updateExercise(editing.id, input);
              setEditing(null);
              flash("Hareket kaydedildi.");
            }}
          />
        ) : null}

        {exercises.length === 0 ? (
          <EmptyState icon={Plus} title="Hareket yok" description="Kendi hareketini ekleyerek baslayabilirsin." />
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="space-y-2">
                <ExerciseSummary exercise={exercise} />
                <div className="flex gap-2">
                  <button onClick={() => setEditing(exercise)} className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-ink/5 font-bold text-ink">
                    <Edit3 className="mr-2" size={18} />
                    Duzenle
                  </button>
                  <button
                    onClick={() => deleteExercise(exercise.id).then(() => flash("Hareket silindi.")).catch(() => flash("Hareket silinemedi."))}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-clay/10 font-bold text-clay"
                  >
                    <Trash2 className="mr-2" size={18} />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
