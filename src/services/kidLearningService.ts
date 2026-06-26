import {
  kidBadges,
  kidCourses,
  kidFriends,
  kidLeaderboard,
  kidLessons,
  kidMissions,
  kidPracticeActivities,
  kidProfiles,
  type KidPracticeMode,
} from '../data/kidContent';

export type KidLessonRuntime = {
  lessonId: string;
  progress: number;
  stars: number;
  completions: number;
  correctCount: number;
  attemptCount: number;
  xpEarned: number;
  lastCompletedAt?: number;
};

export type KidRuntimeState = {
  activeProfileId?: string;
  parentSession?: {
    email: string;
    name: string;
    signedInAt: number;
    provider: 'supabase' | 'local';
  };
  parentGatePassedAt?: number;
  lessonProgress: Record<string, KidLessonRuntime>;
  unlockedBadgeIds: string[];
  completedMissionIds: string[];
  friendChallengeCount: number;
  energy?: {
    current: number;
    max: number;
    combo: number;
  };
};

export function createInitialKidState(): KidRuntimeState {
  return {
    activeProfileId: undefined,
    parentSession: undefined,
    parentGatePassedAt: undefined,
    lessonProgress: {},
    unlockedBadgeIds: ['super-star', 'word-hero', 'listener'],
    completedMissionIds: [],
    friendChallengeCount: 0,
    energy: { current: 25, max: 25, combo: 0 },
  };
}

export function getKidEnergy(kid: KidRuntimeState) {
  return kid.energy ?? { current: 25, max: 25, combo: 0 };
}

export function getActiveKidProfile(kid: KidRuntimeState) {
  return kidProfiles.find((profile) => profile.id === kid.activeProfileId) ?? kidProfiles[0];
}

export function getLessonRuntime(kid: KidRuntimeState, lessonId: string): KidLessonRuntime {
  const base = kidLessons.find((lesson) => lesson.id === lessonId);
  const existing = kid.lessonProgress[lessonId];
  return {
    lessonId,
    progress: existing?.progress ?? base?.progress ?? 0,
    stars: existing?.stars ?? base?.stars ?? 0,
    completions: existing?.completions ?? 0,
    correctCount: existing?.correctCount ?? 0,
    attemptCount: existing?.attemptCount ?? 0,
    xpEarned: existing?.xpEarned ?? 0,
    lastCompletedAt: existing?.lastCompletedAt,
  };
}

export function getTotalStars(kid: KidRuntimeState) {
  return kidLessons.reduce((sum, lesson) => sum + getLessonRuntime(kid, lesson.id).stars, 0);
}

export function getTotalLessonXp(kid: KidRuntimeState) {
  return Object.values(kid.lessonProgress).reduce((sum, progress) => sum + progress.xpEarned, 0);
}

export function getKidCourses(kid: KidRuntimeState) {
  return kidCourses.map((course) => {
    const courseLessons = kidLessons.filter((lesson) => lesson.courseId === course.id);
    const progress =
      courseLessons.length === 0
        ? course.progress
        : courseLessons.reduce((sum, lesson) => sum + getLessonRuntime(kid, lesson.id).progress, 0) / courseLessons.length;
    return { ...course, progress };
  });
}

export function getKidLessons(kid: KidRuntimeState) {
  const stars = getTotalStars(kid);
  return kidLessons.map((lesson) => {
    const progress = getLessonRuntime(kid, lesson.id);
    const locked = lesson.locked && stars < 3;
    return { ...lesson, progress: progress.progress, stars: progress.stars, locked };
  });
}

export function getRecommendedLessons(kid: KidRuntimeState) {
  return getKidLessons(kid)
    .filter((lesson) => !lesson.locked && lesson.progress < 1)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
}

export function getKidDailyPath(kid: KidRuntimeState) {
  const lessons = getKidLessons(kid);
  const next = getContinueLesson(kid);
  const review = lessons.find((lesson) => lesson.progress > 0 && lesson.progress < 1 && lesson.id !== next.id) ?? next;
  const story = lessons.find((lesson) => !lesson.locked && (lesson.type === 'reading' || lesson.type === 'story')) ?? next;
  const speaking = lessons.find((lesson) => !lesson.locked && lesson.type === 'speaking') ?? next;

  return [
    {
      id: 'review',
      title: 'Warm-up review',
      subtitle: 'Remember words before they fade',
      icon: '🔁',
      color: review.color,
      mode: review.type,
      lessonId: review.id,
      progress: Math.min(1, review.progress + 0.18),
    },
    {
      id: 'next',
      title: next.title,
      subtitle: 'Your best next step',
      icon: next.icon,
      color: next.color,
      mode: next.type,
      lessonId: next.id,
      progress: next.progress,
    },
    {
      id: 'side-quest',
      title: story.id === next.id ? speaking.title : story.title,
      subtitle: story.id === next.id ? 'Practice speaking out loud' : 'Read a story side quest',
      icon: story.id === next.id ? speaking.icon : story.icon,
      color: story.id === next.id ? speaking.color : story.color,
      mode: story.id === next.id ? speaking.type : story.type,
      lessonId: story.id === next.id ? speaking.id : story.id,
      progress: story.id === next.id ? speaking.progress : story.progress,
    },
  ];
}

export function getContinueLesson(kid: KidRuntimeState) {
  return getRecommendedLessons(kid)[0] ?? getKidLessons(kid).find((lesson) => !lesson.locked) ?? getKidLessons(kid)[0];
}

export function getKidBadges(kid: KidRuntimeState) {
  const stars = getTotalStars(kid);
  const completedLessons = Object.values(kid.lessonProgress).filter((item) => item.progress >= 1).length;

  return kidBadges.map((badge) => {
    const earnedByProgress =
      (badge.id === 'reader' && completedLessons >= 2) ||
      (badge.id === 'speaker' && completedLessons >= 3) ||
      (badge.id === 'grammar' && stars >= 8);
    const unlocked = kid.unlockedBadgeIds.includes(badge.id) || earnedByProgress;
    const progress = unlocked ? 1 : badge.progress;
    return { ...badge, unlocked, progress };
  });
}

export function getKidMissions(kid: KidRuntimeState) {
  const completedLessons = Object.values(kid.lessonProgress).filter((item) => item.progress >= 1).length;
  const hasListening = Boolean(kid.lessonProgress['listen-colors']?.progress);
  const challengeProgress = Math.min(1, kid.friendChallengeCount / 1);

  return kidMissions.map((mission) => {
    if (mission.id === 'daily-words') {
      return { ...mission, progress: Math.min(1, completedLessons / 2), completed: completedLessons >= 2 };
    }
    if (mission.id === 'listen') {
      return { ...mission, progress: hasListening ? 1 : 0, completed: hasListening };
    }
    if (mission.id === 'friend') {
      return { ...mission, progress: challengeProgress, completed: challengeProgress >= 1 };
    }
    return { ...mission, completed: kid.completedMissionIds.includes(mission.id) };
  });
}

export function getKidLeaderboard(kid: KidRuntimeState, xpTotal: number) {
  const profile = getActiveKidProfile(kid);
  const self = {
    rank: 0,
    name: profile.name,
    avatar: profile.avatar,
    xp: profile.xp + xpTotal + getTotalLessonXp(kid),
    streak: profile.streak,
  };
  return [...kidLeaderboard.filter((row) => row.name !== self.name), self]
    .sort((a, b) => b.xp - a.xp)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function getKidFriends(kid: KidRuntimeState) {
  return kidFriends.map((friend, index) => ({
    ...friend,
    challenged: kid.friendChallengeCount > index,
  }));
}

export function getKidPracticeActivities(mode?: string) {
  const requested = mode as KidPracticeMode | undefined;
  const byMode = kidPracticeActivities.filter((activity) => activity.mode === requested);
  if (byMode.length > 0) return byMode;
  return kidPracticeActivities.filter((activity) => activity.mode === 'vocabulary');
}

export function recordKidPracticeAnswer(kid: KidRuntimeState, correct: boolean): KidRuntimeState {
  const energy = getKidEnergy(kid);
  const combo = correct ? energy.combo + 1 : 0;
  const bonus = correct && combo > 0 && combo % 3 === 0 ? 1 : 0;
  const current = Math.max(0, Math.min(energy.max, energy.current + bonus - (correct ? 0 : 1)));
  return {
    ...kid,
    energy: {
      ...energy,
      current,
      combo,
    },
  };
}

export function completeKidLesson(
  kid: KidRuntimeState,
  input: {
    lessonId: string;
    xp: number;
    stars: number;
    correctCount: number;
    attemptCount: number;
  }
): KidRuntimeState {
  const previous = getLessonRuntime(kid, input.lessonId);
  const nextProgress = Math.max(previous.progress, 1);
  const nextStars = Math.max(previous.stars, input.stars);
  const next: KidLessonRuntime = {
    lessonId: input.lessonId,
    progress: nextProgress,
    stars: nextStars,
    completions: previous.completions + 1,
    correctCount: previous.correctCount + input.correctCount,
    attemptCount: previous.attemptCount + input.attemptCount,
    xpEarned: previous.xpEarned + input.xp,
    lastCompletedAt: Date.now(),
  };

  const unlockedBadgeIds = new Set(kid.unlockedBadgeIds);
  for (const badge of getKidBadges({ ...kid, lessonProgress: { ...kid.lessonProgress, [input.lessonId]: next } })) {
    if (badge.unlocked) unlockedBadgeIds.add(badge.id);
  }

  return {
    ...kid,
    lessonProgress: { ...kid.lessonProgress, [input.lessonId]: next },
    unlockedBadgeIds: Array.from(unlockedBadgeIds),
  };
}
