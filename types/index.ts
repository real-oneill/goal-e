export type Discipline = 'bjj' | 'workout' | 'guitar';

export interface BJJDetails {
  energyLevel: number;
  motivationLevel: number;
  sleepQuality: number;
  dietQuality: number;
  physicalCondition: number;
  sessionDurationMinutes: number;
  techniques: string[];
  sparringRounds: number;
  sparringMinutes: number;
  drillingRounds: number;
  drillingMinutes: number;
  metMonthlyObjective: boolean;
  keyTakeaways: string;
}

export interface GuitarDetails {
  sessionDurationMinutes: number;
  scalesPracticed: string[];
  songsWorkedOn: string[];
  chordsLearned: string[];
  chordDiagrams: ChordDiagramData[];
  keyTakeaways: string;
}

export interface ChordDiagramData {
  id: string;
  name: string;
  strings: number[];
  startFret: number;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  unit: 'lbs' | 'kg';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutDetails {
  energyLevel: number;
  motivationLevel: number;
  sleepQuality: number;
  dietQuality: number;
  physicalCondition: number;
  completedAllWorkouts: boolean;
  sessionDurationMinutes: number;
  exercises: WorkoutExercise[];
  keyTakeaways: string;
}

export interface Session {
  id: string;
  discipline: Discipline;
  date: string;
  objective: string;
  actualWork: string;
  notes: string;
  improvements: string;
  metDailyObjective: boolean;
  bjj?: BJJDetails;
  guitar?: GuitarDetails;
  workout?: WorkoutDetails;
  createdAt: string;
}

export interface MonthlyGoal {
  id: string;
  discipline: Discipline;
  period: 'monthly' | 'yearly';
  month: string;
  goal: string;
  reflection: string;
  isComplete: boolean;
  createdAt: string;
}
