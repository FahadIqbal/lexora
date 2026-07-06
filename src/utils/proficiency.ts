import type { Difficulty } from '../domain/schema';

export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const PROFICIENCY_LEVELS = new Set<ProficiencyLevel>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export function normalizeProficiencyLevel(value?: string | null): ProficiencyLevel | null {
  const level = value?.trim().toUpperCase();
  if (!level) return null;
  return PROFICIENCY_LEVELS.has(level as ProficiencyLevel) ? (level as ProficiencyLevel) : null;
}

export function getDifficultyMaxForProficiency(value?: string | null): Difficulty | null {
  const level = normalizeProficiencyLevel(value);
  if (!level) return null;
  if (level === 'A1' || level === 'A2') return 2;
  if (level === 'B1') return 3;
  if (level === 'B2') return 4;
  return 5;
}

export function getDisplayProficiency(value?: string | null, fallback: ProficiencyLevel = 'B1') {
  return normalizeProficiencyLevel(value) ?? fallback;
}
