export const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatDate(input: string) {
  return new Date(input).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function formatMonth(month: string) {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function scoreTone(score: number) {
  if (score >= 90) {
    return "text-glow";
  }
  if (score >= 80) {
    return "text-pulse";
  }
  if (score >= 70) {
    return "text-gold";
  }
  return "text-ember";
}
