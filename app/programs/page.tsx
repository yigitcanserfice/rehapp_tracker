"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Edit3, ListPlus, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ProgramForm } from "@/components/ProgramForm";
import { Toast } from "@/components/Toast";
import { db } from "@/lib/db";
import { addProgram, deleteProgram, seedIfNeeded, setActiveProgram, updateProgram } from "@/lib/store";
import type { Program } from "@/lib/types";

export default function ProgramsPage() {
  const [editing, setEditing] = useState<Program | "new" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    seedIfNeeded().catch(() => flash("Ornek veriler olusturulamadi."));
  }, []);

  const data = useLiveQuery(async () => {
    const [programs, exercises] = await Promise.all([db.programs.orderBy("createdAt").toArray(), db.exercises.orderBy("createdAt").toArray()]);
    return { programs, exercises };
  }, []) ?? { programs: [], exercises: [] };

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  return (
    <AppShell
      title="Programlar"
      subtitle="Hareketleri programa ekle, sirala ve aktif programini sec."
      action={
        <button onClick={() => setEditing("new")} className="flex h-12 w-12 items-center justify-center rounded-lg bg-leaf text-white shadow-soft" aria-label="Program ekle">
          <Plus size={22} />
        </button>
      }
    >
      <Toast message={message} />
      <div className="space-y-4">
        {editing ? (
          data.exercises.length === 0 ? (
            <EmptyState icon={ListPlus} title="Once hareket ekle" description="Program olusturmak icin en az bir hareket gerekli." />
          ) : (
            <ProgramForm
              initial={editing === "new" ? undefined : editing}
              exercises={data.exercises}
              onCancel={() => setEditing(null)}
              onError={flash}
              onSave={async (input) => {
                if (editing === "new") await addProgram(input);
                else await updateProgram(editing.id, input);
                setEditing(null);
                flash("Program kaydedildi.");
              }}
            />
          )
        ) : null}

        {data.programs.length === 0 ? (
          <EmptyState icon={ListPlus} title="Program yok" description="Bir program olusturup hareketleri siraladiginda Bugun ekrani hazir olur." />
        ) : (
          <div className="space-y-3">
            {data.programs.map((program) => {
              const names = program.exerciseIds
                .map((id) => data.exercises.find((exercise) => exercise.id === id)?.name)
                .filter(Boolean);
              return (
                <article key={program.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black">{program.name}</h2>
                      <p className="mt-1 text-sm text-ink/60">{names.length} hareket</p>
                    </div>
                    {program.isActive ? (
                      <span className="flex items-center rounded-full bg-mint px-3 py-1 text-xs font-bold text-leaf">
                        <CheckCircle2 className="mr-1" size={16} />
                        Aktif
                      </span>
                    ) : null}
                  </div>
                  <ol className="mt-3 space-y-1 text-sm text-ink/65">
                    {names.map((name, index) => (
                      <li key={`${name}-${index}`}>{index + 1}. {name}</li>
                    ))}
                  </ol>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button onClick={() => setEditing(program)} className="flex min-h-11 items-center justify-center rounded-lg bg-ink/5 font-bold text-ink">
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setActiveProgram(program.id).then(() => flash("Aktif program secildi.")).catch(() => flash("Aktif program secilemedi."))}
                      className="min-h-11 rounded-lg bg-mint font-bold text-leaf"
                    >
                      Aktif yap
                    </button>
                    <button
                      onClick={() => deleteProgram(program.id).then(() => flash("Program silindi.")).catch(() => flash("Program silinemedi."))}
                      className="flex min-h-11 items-center justify-center rounded-lg bg-clay/10 font-bold text-clay"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
