"use client";

import { db } from "./db";
import type { DailyProgress, Exercise, ExerciseProgress, Program } from "./types";

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

export const todayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sampleImage = (label: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" rx="28" fill="${bg}"/><circle cx="104" cy="92" r="34" fill="#ffffff" opacity=".55"/><path d="M104 132c54 8 105 36 138 84 33-56 79-92 138-108" fill="none" stroke="#17201b" stroke-width="18" stroke-linecap="round" opacity=".42"/><path d="M116 246h248" stroke="#17201b" stroke-width="18" stroke-linecap="round" opacity=".2"/><text x="240" y="288" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="#17201b">${label}</text></svg>`
  )}`;

export async function seedIfNeeded() {
  const exerciseCount = await db.exercises.count();
  const programCount = await db.programs.count();

  if (exerciseCount > 0 || programCount > 0) return;

  const createdAt = now();
  const exercises: Exercise[] = [
    {
      id: uid(),
      name: "Diz fleksiyon",
      description: "Hareketi yavas yap, agrida zorlamadan dur.",
      image: sampleImage("Diz", "#e7f5ed"),
      sets: 3,
      reps: 10,
      timesPerDay: 2,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: uid(),
      name: "Topuk kaydirma",
      description: "Ayagi zeminden kaldirmadan kontrollu kaydir.",
      image: sampleImage("Topuk", "#e7f0ff"),
      sets: 2,
      reps: 12,
      timesPerDay: 1,
      createdAt,
      updatedAt: createdAt
    },
    {
      id: uid(),
      name: "Quadriceps sikma",
      description: "Dizi duz tut, kasini sik ve nefesini tutma.",
      image: sampleImage("Kas", "#fff0e7"),
      sets: 3,
      durationSeconds: 20,
      timesPerDay: 3,
      createdAt,
      updatedAt: createdAt
    }
  ];

  const program: Program = {
    id: uid(),
    name: "Baslangic programi",
    exerciseIds: exercises.map((exercise) => exercise.id),
    isActive: true,
    createdAt,
    updatedAt: createdAt
  };

  await db.transaction("rw", db.exercises, db.programs, async () => {
    await db.exercises.bulkAdd(exercises);
    await db.programs.add(program);
  });
}

export async function addExercise(input: Omit<Exercise, "id" | "createdAt" | "updatedAt">) {
  const stamp = now();
  await db.exercises.add({ ...input, id: uid(), createdAt: stamp, updatedAt: stamp });
}

export async function updateExercise(id: string, input: Omit<Exercise, "id" | "createdAt" | "updatedAt">) {
  await db.exercises.update(id, { ...input, updatedAt: now() });
}

export async function deleteExercise(id: string) {
  await db.transaction("rw", db.exercises, db.programs, async () => {
    await db.exercises.delete(id);
    const programs = await db.programs.toArray();
    await Promise.all(
      programs.map((program) =>
        db.programs.update(program.id, {
          exerciseIds: program.exerciseIds.filter((exerciseId) => exerciseId !== id),
          updatedAt: now()
        })
      )
    );
  });
}

export async function addProgram(input: Pick<Program, "name" | "exerciseIds" | "isActive">) {
  const stamp = now();
  await db.transaction("rw", db.programs, async () => {
    if (input.isActive) {
      await db.programs.toCollection().modify((program) => {
        program.isActive = false;
        program.updatedAt = stamp;
      });
    }
    await db.programs.add({ ...input, id: uid(), createdAt: stamp, updatedAt: stamp });
  });
}

export async function updateProgram(id: string, input: Pick<Program, "name" | "exerciseIds" | "isActive">) {
  const stamp = now();
  await db.transaction("rw", db.programs, async () => {
    if (input.isActive) {
      await db.programs.toCollection().modify((program) => {
        if (program.id !== id) {
          program.isActive = false;
          program.updatedAt = stamp;
        }
      });
    }
    await db.programs.update(id, { ...input, updatedAt: stamp });
  });
}

export async function setActiveProgram(id: string) {
  const stamp = now();
  await db.transaction("rw", db.programs, async () => {
    await db.programs.toCollection().modify((program) => {
      program.isActive = program.id === id;
      program.updatedAt = stamp;
    });
  });
}

export async function deleteProgram(id: string) {
  await db.transaction("rw", db.programs, async () => {
    await db.programs.delete(id);
    const remaining = await db.programs.toArray();
    if (remaining.length > 0 && !remaining.some((program) => program.isActive)) {
      await db.programs.update(remaining[0].id, { isActive: true, updatedAt: now() });
    }
  });
}

function progressId(date: string, programId: string) {
  return `${date}:${programId}`;
}

export function calculateCompletion(program: Program, exercises: Exercise[], progress: ExerciseProgress[]) {
  const targets = program.exerciseIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter(Boolean) as Exercise[];
  const totalSets = targets.reduce((sum, exercise) => sum + getExerciseTargetSetCount(exercise), 0);
  const completedSets = progress.reduce((sum, item) => sum + getCompletedSetTotal(item), 0);
  return totalSets === 0 ? 0 : Math.min(100, Math.round((completedSets / totalSets) * 100));
}

export function getExerciseTargetSetCount(exercise: Exercise) {
  return Math.max(1, exercise.sets) * Math.max(1, exercise.timesPerDay);
}

export function getCompletedSetGroups(progress: ExerciseProgress | undefined, exercise: Exercise) {
  const setCount = Math.max(1, exercise.sets);
  const timesPerDay = Math.max(1, exercise.timesPerDay);
  const source = progress?.completedSetGroups ?? (progress?.completedSets.length ? [progress.completedSets] : []);

  return Array.from({ length: timesPerDay }, (_, timeIndex) => {
    const group = source[timeIndex] ?? [];
    return Array.from(new Set(group.filter((setIndex) => setIndex >= 0 && setIndex < setCount))).sort((a, b) => a - b);
  });
}

export function getCompletedSetTotal(progress: ExerciseProgress) {
  return (progress.completedSetGroups ?? [progress.completedSets]).reduce((sum, group) => sum + group.length, 0);
}

export async function ensureDailyProgress(program: Program, exercises: Exercise[]) {
  const date = todayKey();
  const id = progressId(date, program.id);
  const existing = await db.dailyProgress.get(id);
  const exerciseProgress = program.exerciseIds.map((exerciseId) => {
    const old = existing?.exerciseProgress.find((item) => item.exerciseId === exerciseId);
    const exercise = exercises.find((item) => item.id === exerciseId);
    const setCount = Math.max(1, exercise?.sets ?? 1);
    const fallbackExercise: Exercise = exercise ?? {
      id: exerciseId,
      name: "",
      description: "",
      sets: setCount,
      timesPerDay: 1,
      createdAt: "",
      updatedAt: ""
    };
    const completedSetGroups = getCompletedSetGroups(old, fallbackExercise);
    const completedSets = completedSetGroups[0] ?? [];
    return {
      exerciseId,
      completedSets,
      completedSetGroups,
      isCompleted: completedSetGroups.every((group) => group.length >= setCount)
    };
  });
  const completionPercentage = calculateCompletion(program, exercises, exerciseProgress);
  const record: DailyProgress = {
    id,
    date,
    programId: program.id,
    exerciseProgress,
    completionPercentage,
    completedAt: completionPercentage === 100 ? existing?.completedAt ?? now() : undefined
  };

  if (existing) {
    await db.dailyProgress.put(record);
  } else {
    await db.dailyProgress.add(record);
  }

  return record;
}

export async function toggleSet(program: Program, exercises: Exercise[], exerciseId: string, setIndex: number, timeIndex = 0) {
  const current = await ensureDailyProgress(program, exercises);
  const exercise = exercises.find((item) => item.id === exerciseId);
  const setCount = Math.max(1, exercise?.sets ?? 1);
  const exerciseProgress = current.exerciseProgress.map((item) => {
    if (item.exerciseId !== exerciseId) return item;
    const fallbackExercise: Exercise = exercise ?? {
      id: exerciseId,
      name: "",
      description: "",
      sets: setCount,
      timesPerDay: 1,
      createdAt: "",
      updatedAt: ""
    };
    const completedSetGroups = getCompletedSetGroups(item, fallbackExercise);
    const currentGroup = completedSetGroups[timeIndex] ?? [];
    const exists = currentGroup.includes(setIndex);
    completedSetGroups[timeIndex] = exists
      ? currentGroup.filter((index) => index !== setIndex)
      : [...currentGroup, setIndex].sort((a, b) => a - b);
    return {
      ...item,
      completedSets: completedSetGroups[0] ?? [],
      completedSetGroups,
      isCompleted: completedSetGroups.every((group) => group.length >= setCount)
    };
  });
  const completionPercentage = calculateCompletion(program, exercises, exerciseProgress);
  await db.dailyProgress.put({
    ...current,
    exerciseProgress,
    completionPercentage,
    completedAt: completionPercentage === 100 ? current.completedAt ?? now() : undefined
  });
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Fotoğraf okunamadı."));
    reader.readAsDataURL(file);
  });
}
