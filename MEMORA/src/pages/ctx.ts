import type { Dispatch, SetStateAction } from "react";
import type { AppData, Flashcard, Page, StudyQuestion, StudySet } from "../types";
import type { ConfirmOptions, ToastTone } from "../components/ui";

export type ChartPoint = { day: string; accuracy: number; minutes: number };
/** Shared app state and actions. All logic lives in App.tsx; pages only render. */
export type Ctx = {
  data: AppData; setData: Dispatch<SetStateAction<AppData>>; activeSet?: StudySet;
  go: (p: Page) => void; openCreate: () => void; openUpgrade: () => void;
  notify: (msg: string, tone?: ToastTone) => void; confirm: (o: ConfirmOptions) => void;
  updateSet: (id: string, patch: Partial<StudySet>) => void; selectSet: (id: string) => void; deleteSet: (id: string) => void;
  query: string; filteredSets: StudySet[];
  allMistakes: (StudyQuestion & { attemptId: string })[]; totalQuestions: number; correctQuestions: number; accuracy: number;
  dueCards: (Flashcard & { setId: string })[]; chartData: ChartPoint[];
};
