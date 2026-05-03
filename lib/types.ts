export interface Exercise {
  id: string;
  name: string;
  description: string;
  image?: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  timesPerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  name: string;
  exerciseIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  completedSets: number[];
  completedSetGroups?: number[][];
  isCompleted: boolean;
}

export interface DailyProgress {
  id: string;
  date: string;
  programId: string;
  exerciseProgress: ExerciseProgress[];
  completionPercentage: number;
  completedAt?: string;
}
