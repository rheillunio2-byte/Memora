export const shortDate = (n: number) => new Date(n).toLocaleDateString(undefined, { month: "short", day: "numeric" });
export const formatMinutes = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
export const pluralize = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
export const greetingFor = (hour: number) => (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
export const initialsOf = (name?: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase() : "M";
};
export const sameAnswer = (given: string | undefined, answer: string) => (given || "").trim().toLowerCase() === answer.trim().toLowerCase();
