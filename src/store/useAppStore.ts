import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays } from 'date-fns';
import { isoDate, isYesterday } from '../utils/date';
import type { DailyStat, WordProgress } from '../domain/schema';
import { DailyStatSchema, WordProgressSchema } from '../domain/schema';
import { sm2Update } from '../utils/srs';

type UserProfile = {
  id?: string;
  displayName: string;
  dailyGoalWords: number;
  proficiencyLevel?: string; // A1–C2
  isPremium: boolean;
  isAdmin: boolean;
};

type AppState = {
  hydrated: boolean;
  user: UserProfile;
  onboardingCompleted: boolean;
  selectedCategories: string[];
  learningWhy: string[];
  streakCurrent: number;
  xpToday: number;
  xpTotal: number;
  streakLongest: number;
  lastActiveDate?: string; // yyyy-MM-dd

  wordProgress: Record<string, WordProgress>; // keyed by wordId
  dailyStats: Record<string, DailyStat>; // keyed by yyyy-MM-dd

  setOnboardingCompleted: (v: boolean) => void;
  setSelectedCategories: (slugs: string[]) => void;
  toggleLearningWhy: (slug: string) => void;
  setDailyGoalWords: (n: number) => void;
  setProficiencyLevel: (lvl: string) => void;
  setDisplayName: (name: string) => void;
  setUserId: (id?: string) => void;
  setIsAdmin: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  addXp: (n: number) => void;
  ensureToday: () => void;

  // learning actions (fully workable offline)
  addToStudyList: (wordId: string) => void;
  recordLearned: (wordId: string) => void;
  recordReview: (wordId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;

  // selectors/helpers
  getDueWordIds: (today?: string) => string[];
  getWeeklyWordsLearned: (today?: string) => number[]; // length 7
  getHeatmap30: (today?: string) => number[]; // length 30 (0..4)
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      let dueCache:
        | {
            today: string;
            wordProgress: AppState['wordProgress'];
            result: string[];
          }
        | null = null;

      let weeklyCache:
        | {
            today: string;
            dailyStats: AppState['dailyStats'];
            result: number[];
          }
        | null = null;

      let heatmapCache:
        | {
            today: string;
            dailyStats: AppState['dailyStats'];
            result: number[];
          }
        | null = null;

      return {
      hydrated: false,
      user: {
        displayName: '',
        dailyGoalWords: 10,
        proficiencyLevel: undefined,
        isPremium: false,
        isAdmin: false,
      },
      onboardingCompleted: false,
      selectedCategories: [],
      learningWhy: [],
      streakCurrent: 0,
      xpToday: 0,
      xpTotal: 0,
      streakLongest: 0,
      lastActiveDate: undefined,
      wordProgress: {},
      dailyStats: {},

      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
      setSelectedCategories: (slugs) => set({ selectedCategories: slugs }),
      toggleLearningWhy: (slug) =>
        set((s) => ({
          learningWhy: s.learningWhy.includes(slug)
            ? s.learningWhy.filter((x) => x !== slug)
            : [...s.learningWhy, slug],
        })),
      setDailyGoalWords: (n) =>
        set((s) => ({
          user: { ...s.user, dailyGoalWords: n },
        })),
      setProficiencyLevel: (lvl) =>
        set((s) => ({
          user: { ...s.user, proficiencyLevel: lvl },
        })),
      setDisplayName: (name) =>
        set((s) => ({
          user: { ...s.user, displayName: name },
        })),
      setUserId: (id) =>
        set((s) => ({
          user: { ...s.user, id },
        })),
      setIsAdmin: (v) =>
        set((s) => ({
          user: { ...s.user, isAdmin: v },
        })),
      setHydrated: (v) => set({ hydrated: v }),
      ensureToday: () =>
        set((s) => {
          const today = isoDate();

          // 1) XP today reset if date changed
          let xpToday = s.xpToday;
          if (s.lastActiveDate && s.lastActiveDate !== today) {
            xpToday = 0;
          }

          // 2) streak update if new day activity
          let streakCurrent = s.streakCurrent;
          let streakLongest = s.streakLongest;
          if (!s.lastActiveDate) {
            streakCurrent = 0;
          } else if (s.lastActiveDate !== today) {
            // streak increments only when first activity of a new day happens (handled below in bump)
          }

          // 3) ensure daily stat entry exists
          const existing = s.dailyStats[today];
          const stat = existing ? DailyStatSchema.parse(existing) : DailyStatSchema.parse({ date: today });

          return {
            xpToday,
            streakCurrent,
            streakLongest,
            dailyStats: { ...s.dailyStats, [today]: stat },
          };
        }),

      addXp: (n) =>
        set((s) => {
          const today = isoDate();
          const prev = s.dailyStats[today] ? DailyStatSchema.parse(s.dailyStats[today]) : DailyStatSchema.parse({ date: today });

          // bump streak on first activity of the day
          let streakCurrent = s.streakCurrent;
          let streakLongest = s.streakLongest;
          let lastActiveDate = s.lastActiveDate;
          if (s.lastActiveDate !== today) {
            if (s.lastActiveDate && isYesterday(s.lastActiveDate, today)) streakCurrent = s.streakCurrent + 1;
            else streakCurrent = 1;
            streakLongest = Math.max(streakLongest, streakCurrent);
            lastActiveDate = today;
          }

          return {
            lastActiveDate,
            streakCurrent,
            streakLongest,
            xpToday: s.xpToday + n,
            xpTotal: s.xpTotal + n,
            dailyStats: {
              ...s.dailyStats,
              [today]: { ...prev, xpEarned: prev.xpEarned + n },
            },
          };
        }),

      addToStudyList: (wordId) =>
        set((s) => {
          const today = isoDate();
          const prev = s.wordProgress[wordId] ? WordProgressSchema.parse(s.wordProgress[wordId]) : WordProgressSchema.parse({ wordId });
          if (prev.status !== 'new') return {};

          const nextReviewDate = addDays(new Date(`${today}T00:00:00.000Z`), 1).toISOString().slice(0, 10);
          return {
            wordProgress: {
              ...s.wordProgress,
              [wordId]: { ...prev, status: 'learning', firstSeenAt: prev.firstSeenAt ?? Date.now(), nextReviewDate },
            },
          };
        }),

      recordLearned: (wordId) =>
        set((s) => {
          const today = isoDate();
          const prevStat = s.dailyStats[today] ? DailyStatSchema.parse(s.dailyStats[today]) : DailyStatSchema.parse({ date: today });
          const prev = s.wordProgress[wordId] ? WordProgressSchema.parse(s.wordProgress[wordId]) : WordProgressSchema.parse({ wordId });

          // bump streak on first activity of the day
          let streakCurrent = s.streakCurrent;
          let streakLongest = s.streakLongest;
          if (s.lastActiveDate !== today) {
            if (s.lastActiveDate && isYesterday(s.lastActiveDate, today)) streakCurrent = s.streakCurrent + 1;
            else streakCurrent = 1;
            streakLongest = Math.max(streakLongest, streakCurrent);
          }

          // next review tomorrow
          const nextReviewDate = addDays(new Date(`${today}T00:00:00.000Z`), 1).toISOString().slice(0, 10);

          return {
            lastActiveDate: today,
            streakCurrent,
            streakLongest,
            dailyStats: {
              ...s.dailyStats,
              [today]: { ...prevStat, wordsLearned: prevStat.wordsLearned + 1, sessionsCount: prevStat.sessionsCount + 1 },
            },
            wordProgress: {
              ...s.wordProgress,
              [wordId]: {
                ...prev,
                status: prev.status === 'mastered' ? 'mastered' : 'reviewing',
                firstSeenAt: prev.firstSeenAt ?? Date.now(),
                nextReviewDate,
              },
            },
          };
        }),

      recordReview: (wordId, quality) =>
        set((s) => {
          const today = isoDate();
          const prevStat = s.dailyStats[today] ? DailyStatSchema.parse(s.dailyStats[today]) : DailyStatSchema.parse({ date: today });
          const prev = s.wordProgress[wordId] ? WordProgressSchema.parse(s.wordProgress[wordId]) : WordProgressSchema.parse({ wordId });

          // bump streak on first activity of the day
          let streakCurrent = s.streakCurrent;
          let streakLongest = s.streakLongest;
          if (s.lastActiveDate !== today) {
            if (s.lastActiveDate && isYesterday(s.lastActiveDate, today)) streakCurrent = s.streakCurrent + 1;
            else streakCurrent = 1;
            streakLongest = Math.max(streakLongest, streakCurrent);
          }

          const updated = sm2Update({
            easeFactor: prev.easeFactor ?? 2.5,
            interval: prev.interval ?? 1,
            repetitions: prev.repetitions ?? 0,
            quality,
          });

          const correct = quality >= 3;
          const repetitions = updated.repetitions;
          const mastered = repetitions >= 8 && updated.interval >= 30;

          return {
            lastActiveDate: today,
            streakCurrent,
            streakLongest,
            dailyStats: {
              ...s.dailyStats,
              [today]: {
                ...prevStat,
                wordsReviewed: prevStat.wordsReviewed + 1,
                sessionsCount: prevStat.sessionsCount + 1,
                accuracyCorrect: prevStat.accuracyCorrect + (correct ? 1 : 0),
                accuracyTotal: prevStat.accuracyTotal + 1,
              },
            },
            wordProgress: {
              ...s.wordProgress,
              [wordId]: {
                ...prev,
                status: mastered ? 'mastered' : 'reviewing',
                easeFactor: updated.easeFactor,
                interval: updated.interval,
                repetitions: updated.repetitions,
                nextReviewDate: updated.nextReviewDate,
                lastReviewedAt: Date.now(),
                correctCount: prev.correctCount + (correct ? 1 : 0),
                incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
                masteredAt: mastered ? prev.masteredAt ?? Date.now() : prev.masteredAt,
              },
            },
          };
        }),

      getDueWordIds: (todayArg) => {
        const today = todayArg ?? isoDate();
        const wordProgress = get().wordProgress ?? {};
        if (dueCache && dueCache.today === today && dueCache.wordProgress === wordProgress) {
          return dueCache.result;
        }

        const entries = Object.values(wordProgress);
        const result = entries
          .filter((p: WordProgress) => {
            if (p.status === 'new') return false;
            if (!p.nextReviewDate) return true;
            return p.nextReviewDate <= today;
          })
          .map((p: WordProgress) => p.wordId);

        dueCache = { today, wordProgress, result };
        return result;
      },

      getWeeklyWordsLearned: (todayArg) => {
        const s = get();
        const today = todayArg ?? isoDate();
        if (weeklyCache && weeklyCache.today === today && weeklyCache.dailyStats === s.dailyStats) {
          return weeklyCache.result;
        }
        const out: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = addDays(new Date(`${today}T00:00:00.000Z`), -i).toISOString().slice(0, 10);
          const stat = s.dailyStats[d] ? DailyStatSchema.parse(s.dailyStats[d]) : DailyStatSchema.parse({ date: d });
          out.push(stat.wordsLearned);
        }
        weeklyCache = { today, dailyStats: s.dailyStats, result: out };
        return out;
      },

      getHeatmap30: (todayArg) => {
        const s = get();
        const today = todayArg ?? isoDate();
        if (heatmapCache && heatmapCache.today === today && heatmapCache.dailyStats === s.dailyStats) {
          return heatmapCache.result;
        }
        const out: number[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = addDays(new Date(`${today}T00:00:00.000Z`), -i).toISOString().slice(0, 10);
          const stat = s.dailyStats[d] ? DailyStatSchema.parse(s.dailyStats[d]) : DailyStatSchema.parse({ date: d });
          const total = stat.wordsLearned + stat.wordsReviewed;
          const intensity = total === 0 ? 0 : total < 3 ? 1 : total < 6 ? 2 : total < 10 ? 3 : 4;
          out.push(intensity);
        }
        heatmapCache = { today, dailyStats: s.dailyStats, result: out };
        return out;
      },
      };
    },
    {
      name: 'lexora-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, _error) => {
        state?.setHydrated(true);
      },
      partialize: (s) => ({
        user: s.user,
        onboardingCompleted: s.onboardingCompleted,
        selectedCategories: s.selectedCategories,
        learningWhy: s.learningWhy,
        streakCurrent: s.streakCurrent,
        streakLongest: s.streakLongest,
        lastActiveDate: s.lastActiveDate,
        xpToday: s.xpToday,
        xpTotal: s.xpTotal,
        wordProgress: s.wordProgress,
        dailyStats: s.dailyStats,
      }),
    }
  )
);
