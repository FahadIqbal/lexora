import { getKidAdaptiveReviewSummary } from './kidAdaptiveLearningService';
import { getKidContentCreationEngine } from './kidContentCreationEngine';
import { getKidDailyQuest } from './kidDailyQuestService';
import {
  getActiveKidProfile,
  getKidLessons,
  type KidRuntimeState,
} from './kidLearningService';

export type KidParentInsightCard = {
  id: string;
  title: string;
  value: string;
  detail: string;
  icon: string;
  color: string;
  progress: number;
};

export type KidParentControl = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  requiresGate?: boolean;
};

export type KidParentDashboard = {
  child: ReturnType<typeof getActiveKidProfile>;
  totalXp: number;
  totalLessons: number;
  completedLessons: number;
  attempts: number;
  correct: number;
  accuracy: number;
  offlineReadyCount: number;
  pulse: {
    title: string;
    body: string;
    icon: string;
    color: string;
    progress: number;
    label: string;
  };
  insights: KidParentInsightCard[];
  controls: KidParentControl[];
};

export function getKidParentDashboard(kid: KidRuntimeState, xpTotal: number, now = Date.now()): KidParentDashboard {
  const child = getActiveKidProfile(kid);
  const lessons = getKidLessons(kid);
  const completedLessons = lessons.filter((lesson) => lesson.progress >= 1).length;
  const attempts = Object.values(kid.lessonProgress).reduce((sum, item) => sum + item.attemptCount, 0);
  const correct = Object.values(kid.lessonProgress).reduce((sum, item) => sum + item.correctCount, 0);
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  const dailyQuest = getKidDailyQuest(kid, now);
  const review = getKidAdaptiveReviewSummary(kid, now);
  const contentEngine = getKidContentCreationEngine(kid, now);
  const lessonProgress = lessons.length ? completedLessons / lessons.length : 0;
  const questProgress = dailyQuest.completion;
  const accuracyProgress = attempts ? accuracy / 100 : 0.42;
  const pulseProgress = Math.max(questProgress, lessonProgress, accuracyProgress);
  const contentPackCount = contentEngine.coverage.find((item) => item.label === 'Packs')?.value ?? '0';

  const pulse =
    attempts === 0
      ? {
          title: `${child.name}'s plan is ready`,
          body: 'Start with one short lesson, then the dashboard will show accuracy, recall timing, and quest health.',
          icon: '🧭',
          color: '#8174F2',
          progress: Math.max(0.24, questProgress),
          label: 'Ready',
        }
      : accuracy >= 80
        ? {
            title: `${child.name} is learning steadily`,
            body: `${accuracy}% accuracy, ${Math.round(questProgress * 100)}% daily quest progress, and ${review.dueCount} review cards ready.`,
            icon: '✅',
            color: '#51D9A8',
            progress: pulseProgress,
            label: 'Healthy',
          }
        : {
            title: `${child.name} needs a gentle boost`,
            body: `Accuracy is ${accuracy}%. Keep sessions short and start with ${review.focusTitle.toLowerCase()}.`,
            icon: '🎯',
            color: '#FF7A7A',
            progress: pulseProgress,
            label: 'Support',
          };

  return {
    child,
    totalXp: child.xp + xpTotal,
    totalLessons: lessons.length,
    completedLessons,
    attempts,
    correct,
    accuracy,
    offlineReadyCount: lessons.length,
    pulse,
    insights: [
      {
        id: 'accuracy',
        title: 'Practice accuracy',
        value: attempts ? `${accuracy}%` : 'Ready',
        detail: attempts ? `${correct}/${attempts} answers correct across completed practice.` : 'No scored practice yet. Start with a quick picture lesson.',
        icon: accuracy >= 80 ? '✅' : '🎯',
        color: accuracy >= 80 ? '#51D9A8' : '#FF7A7A',
        progress: attempts ? accuracy / 100 : 0.18,
      },
      {
        id: 'review',
        title: 'Memory timing',
        value: review.dueCount ? `${review.dueCount} due` : review.nextReviewLabel,
        detail: review.focusBody,
        icon: '🔁',
        color: '#55B7FF',
        progress: Math.max(review.progress.recall, review.progress.strong, review.progress.fresh),
      },
      {
        id: 'quest',
        title: 'Daily quest',
        value: `${Math.round(dailyQuest.completion * 100)}%`,
        detail: dailyQuest.parentSummary,
        icon: dailyQuest.themeIcon,
        color: dailyQuest.color,
        progress: dailyQuest.completion,
      },
      {
        id: 'content',
        title: 'Fresh content',
        value: `${contentPackCount} packs`,
        detail: contentEngine.creatorLine,
        icon: '✨',
        color: '#8174F2',
        progress: 1,
      },
    ],
    controls: [
      {
        id: 'lessons',
        title: `${completedLessons}/${lessons.length} lessons complete`,
        subtitle: 'Review the course path or continue the next lesson.',
        icon: '📚',
        color: '#8174F2',
        route: '/(tabs)/learn',
      },
      {
        id: 'admin',
        title: 'Create or edit lesson content',
        subtitle: 'Parent gate required before teacher tools open.',
        icon: '👩‍🏫',
        color: '#FF7A7A',
        route: '/admin',
        requiresGate: true,
      },
      {
        id: 'review',
        title: 'Review vocabulary practice',
        subtitle: review.focusTitle,
        icon: '🔁',
        color: '#55B7FF',
        route: '/(tabs)/review',
      },
    ],
  };
}
