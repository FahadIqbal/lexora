import { addDays, startOfToday } from 'date-fns';

export type SrsState = {
  easeFactor: number; // default 2.5
  interval: number; // days
  repetitions: number;
};

export type SrsUpdateInput = SrsState & {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
};

export type SrsUpdateResult = SrsState & {
  nextReviewDate: string; // yyyy-MM-dd
};

/**
 * SM-2 inspired scheduling.
 * Notes (aligned to your prompt):
 * - 0–1: again → interval reset to 1
 * - 2: hard → interval × 1.2
 * - 3: good → interval × easeFactor
 * - 4–5: easy → interval × easeFactor × 1.3, easeFactor increases
 */
export function sm2Update(input: SrsUpdateInput): SrsUpdateResult {
  const { quality } = input;
  let easeFactor = input.easeFactor ?? 2.5;
  let interval = input.interval ?? 1;
  let repetitions = input.repetitions ?? 0;

  if (quality <= 1) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;

    if (quality === 2) {
      interval = Math.max(1, Math.round(interval * 1.2));
    } else if (quality === 3) {
      interval = Math.max(1, Math.round(interval * easeFactor));
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
      // gentle EF increase for "easy"
      easeFactor = Math.min(3.0, easeFactor + 0.05);
    }
  }

  // SM-2 keeps EF >= 1.3
  easeFactor = Math.max(1.3, easeFactor);

  const next = addDays(startOfToday(), interval);
  const nextReviewDate = next.toISOString().slice(0, 10);

  return { easeFactor, interval, repetitions, nextReviewDate };
}

