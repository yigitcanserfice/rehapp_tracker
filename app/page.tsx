"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Dumbbell, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ProgressRing } from "@/components/ProgressRing";
import { Toast } from "@/components/Toast";
import { db } from "@/lib/db";
import { ensureDailyProgress, getCompletedSetGroups, seedIfNeeded, toggleSet, todayKey } from "@/lib/store";

export default function TodayPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    seedIfNeeded().catch(() => flash("Ornek veriler olusturulamadi."));
  }, []);

  const data = useLiveQuery(async () => {
    const [programs, exercises] = await Promise.all([db.programs.toArray(), db.exercises.toArray()]);
    const activeProgram = programs.find((program) => program.isActive);
    const progress = activeProgram ? await db.dailyProgress.get(`${todayKey()}:${activeProgram.id}`) : undefined;
    return { activeProgram, exercises, progress };
  }, []);

  useEffect(() => {
    if (!data?.activeProgram) return;
    ensureDailyProgress(data.activeProgram, data.exercises).catch(() => flash("Bugunku takip kaydi hazirlanamadi."));
  }, [data?.activeProgram?.id, data?.exercises.length]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  const orderedExercises = useMemo(() => {
    if (!data?.activeProgram) return [];
    return data.activeProgram.exerciseIds
      .map((id) => data.exercises.find((exercise) => exercise.id === id))
      .filter(Boolean);
  }, [data]);

  const completion = data?.progress?.completionPercentage ?? 0;

  return (
    <AppShell title="Bugun" subtitle={data?.activeProgram ? data.activeProgram.name : "Aktif programini sec ve bugunku takibe basla."}>
      <Toast message={message} />
      {!data ? null : !data.activeProgram ? (
        <EmptyState
          icon={Dumbbell}
          title="Aktif program yok"
          description="Bugun ekrani icin once bir program olusturup aktif yapman gerekiyor."
          action={
            <Link href="/programs" className="inline-flex min-h-12 items-center rounded-lg bg-leaf px-5 font-bold text-white">
              <Plus className="mr-2" size={18} />
              Program olustur
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <section className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div>
              <p className="text-sm font-bold text-leaf">Gunluk ilerleme</p>
              <h2 className="mt-2 text-2xl font-black">{completion === 100 ? "Tamamlandi" : "Devam ediyor"}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">{orderedExercises.length} hareket, gunluk tekrar ve set takibi.</p>
            </div>
            <ProgressRing value={completion} />
          </section>

          {completion === 100 ? (
            <div className="celebrate-pop rounded-lg border border-leaf/20 bg-mint p-4 text-center shadow-soft">
              <Sparkles className="mx-auto text-leaf" size={30} />
              <p className="mt-2 text-lg font-black">Bugunku program bitti.</p>
              <p className="mt-1 text-sm text-ink/65">Kucuk ama gercek bir galibiyet.</p>
            </div>
          ) : null}

          <div className="space-y-3">
            {orderedExercises.map((exercise) => {
              const item = data.progress?.exerciseProgress.find((progress) => progress.exerciseId === exercise!.id);
              const setCount = Math.max(1, exercise!.sets);
              const timesPerDay = Math.max(1, exercise!.timesPerDay);
              const completedSetGroups = getCompletedSetGroups(item, exercise!);
              const completedTimes = completedSetGroups.filter((group) => group.length >= setCount).length;
              const completed = item?.isCompleted ?? false;
              return (
                <article key={exercise!.id} className="rounded-lg border border-ink/10 bg-white p-3 shadow-soft">
                  <div className="flex gap-3">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-mint">
                      {exercise!.image ? <Image src={exercise!.image} alt="" fill className="object-cover" sizes="96px" unoptimized /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black">{exercise!.name}</h3>
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${completed ? "bg-mint text-leaf" : "bg-ink/5 text-ink/60"}`}>
                          {completed ? "Tamam" : "Acik"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink/65">
                        {exercise!.sets} set · {exercise!.reps ? `${exercise!.reps} tekrar` : `${exercise!.durationSeconds} sn`} · gunde {exercise!.timesPerDay}
                      </p>
                      <p className="mt-1 text-xs font-bold text-leaf">
                        {completedTimes}/{timesPerDay} gunluk tekrar tamam
                      </p>
                      {exercise!.description ? <p className="mt-2 text-sm leading-5 text-ink/55">{exercise!.description}</p> : null}
                    </div>
                  </div>
                  <div className="mt-3 space-y-3">
                    {Array.from({ length: timesPerDay }, (_, timeIndex) => (
                      <section key={timeIndex} className="rounded-lg bg-ink/[0.03] p-2">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black text-ink">{timeIndex + 1}. gunluk tekrar</h4>
                          <span className="text-xs font-bold text-ink/55">
                            {completedSetGroups[timeIndex]?.length ?? 0}/{setCount} set
                          </span>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-2">
                          {Array.from({ length: setCount }, (_, setIndex) => {
                            const checked = completedSetGroups[timeIndex]?.includes(setIndex) ?? false;
                            return (
                              <button
                                key={`${timeIndex}-${setIndex}`}
                                onClick={() =>
                                  toggleSet(data.activeProgram!, data.exercises, exercise!.id, setIndex, timeIndex).catch(() =>
                                    flash("Set durumu kaydedilemedi.")
                                  )
                                }
                                className={`flex min-h-12 items-center justify-center rounded-lg border font-bold ${
                                  checked ? "border-leaf bg-leaf text-white" : "border-ink/10 bg-white text-ink"
                                }`}
                              >
                                {checked ? <Check className="mr-1" size={18} /> : null}
                                Set {setIndex + 1}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
