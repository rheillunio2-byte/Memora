// SM-2-inspired scheduling. Extracted unchanged from App.tsx so it can be unit-tested.
export type RecallLevel = "again" | "hard" | "good" | "easy";
export const QUALITY: Record<RecallLevel, number> = { again: 0, hard: 1, good: 3, easy: 5 };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function schedule(quality: number, reps: number, interval: number, ease: number) {
  const nextReps = quality < 3 ? 0 : reps + 1;
  const nextInterval = quality < 3 ? 1 : reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease);
  const nextEase = clamp(ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)), 1.3, 2.8);
  return { reps: nextReps, interval: nextInterval, ease: nextEase };
}
