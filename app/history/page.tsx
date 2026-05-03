"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { Toast } from "@/components/Toast";
import { db } from "@/lib/db";
import { getCompletedSetGroups, seedIfNeeded } from "@/lib/store";

export default function HistoryPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    seedIfNeeded().catch(() => flash("Ornek veriler olusturulamadi."));
  }, []);

  const data = useLiveQuery(async () => {
    const [records, programs, exercises] = await Promise.all([
      db.dailyProgress.orderBy("date").reverse().toArray(),
      db.programs.toArray(),
      db.exercises.toArray()
    ]);
    return { records, programs, exercises };
  }, []) ?? { records: [], programs: [], exercises: [] };

  const completedRecords = useMemo(() => data.records.filter((record) => record.completionPercentage > 0), [data.records]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  return (
    <AppShell title="Gecmis" subtitle="Gunluk tamamlanma yuzdelerini ve biten hareketleri tarih bazli gor.">
      <Toast message={message} />
      {completedRecords.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Kayit henuz yok" description="Bugun ekraninda set isaretledikce gecmis burada olusur." />
      ) : (
        <div className="space-y-3">
          {completedRecords.map((record) => {
            const program = data.programs.find((item) => item.id === record.programId);
            const done = record.exerciseProgress.filter((item) => item.isCompleted);
            return (
              <article key={record.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{formatDate(record.date)}</h2>
                    <p className="mt-1 text-sm text-ink/60">{program?.name ?? "Silinmis program"}</p>
                  </div>
                  <span className="rounded-full bg-mint px-3 py-1 text-sm font-black text-leaf">%{record.completionPercentage}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-leaf" style={{ width: `${record.completionPercentage}%` }} />
                </div>
                <div className="mt-3 space-y-1 text-sm text-ink/65">
                  {done.length === 0 ? (
                    <p>Henuz tamamlanan hareket yok.</p>
                  ) : (
                    done.map((item) => {
                      const exercise = data.exercises.find((entry) => entry.id === item.exerciseId);
                      if (!exercise) return <p key={item.exerciseId}>Tamamlandi: Silinmis hareket</p>;

                      const setCount = Math.max(1, exercise.sets);
                      const totalTimes = Math.max(1, exercise.timesPerDay);
                      const completedTimes = getCompletedSetGroups(item, exercise).filter((group) => group.length >= setCount).length;

                      return (
                        <p key={item.exerciseId}>
                          Tamamlandi: {exercise.name} ({completedTimes}/{totalTimes} gunluk tekrar)
                        </p>
                      );
                    })
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}
