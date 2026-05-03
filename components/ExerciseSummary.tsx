import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { Exercise } from "@/lib/types";

export function ExerciseSummary({ exercise, done }: { exercise: Exercise; done?: boolean }) {
  return (
    <div className="flex gap-3 rounded-lg border border-ink/10 bg-white p-3 shadow-soft">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-mint">
        {exercise.image ? <Image src={exercise.image} alt="" fill className="object-cover" sizes="80px" unoptimized /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-ink">{exercise.name}</h3>
          {done ? <CheckCircle2 className="shrink-0 text-leaf" size={20} /> : null}
        </div>
        <p className="mt-1 text-sm text-ink/65">
          {exercise.sets} set · {exercise.reps ? `${exercise.reps} tekrar` : `${exercise.durationSeconds} sn`} · gunde {exercise.timesPerDay}
        </p>
        {exercise.description ? <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink/55">{exercise.description}</p> : null}
      </div>
    </div>
  );
}
