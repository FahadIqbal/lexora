export function isoDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function isoDateFromMs(ms: number): string {
  return isoDate(new Date(ms));
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00.000Z`).getTime();
  const b = new Date(`${bIso}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function isYesterday(prevIso: string, todayIso: string): boolean {
  return daysBetween(prevIso, todayIso) === 1;
}

