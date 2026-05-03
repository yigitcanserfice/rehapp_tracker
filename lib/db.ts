import Dexie, { type Table } from "dexie";
import type { DailyProgress, Exercise, Program } from "./types";

export class RehabDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  programs!: Table<Program, string>;
  dailyProgress!: Table<DailyProgress, string>;

  constructor() {
    super("rehab-tracker-db");

    this.version(1).stores({
      exercises: "id, name, createdAt, updatedAt",
      programs: "id, isActive, createdAt, updatedAt",
      dailyProgress: "id, date, programId, completedAt"
    });
  }
}

export const db = new RehabDatabase();
