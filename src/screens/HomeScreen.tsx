import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { GlowCard } from '../components/GlowCard';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/IconSymbol';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useShallow } from 'zustand/react/shallow';
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticImpact, hapticNotify, hapticSelection } from '../utils/haptics';

export function HomeScreen() {
  const t = useTheme();
  const user = useAppStore((s) => s.user);
  const isPremium = useAppStore((s) => s.user.isPremium);
  const streak = useAppStore((s) => s.streakCurrent);
  const streakLongest = useAppStore((s) => s.streakLongest);
  const xpToday = useAppStore((s) => s.xpToday);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const weekly = useAppStore(useShallow((s) => s.getWeeklyWordsLearned()));
  const dueIds = useAppStore(useShallow((s) => s.getDueWordIds()));
  const dueCount = dueIds.length;
  const addToStudyList = useAppStore((s) => s.addToStudyList);

  const [wodExpanded, setWodExpanded] = useState(false);
  const { data: wod, loading: wodLoading } = useAsyncResource(
    () => repos.words.getWordOfTheDay(),
    []
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const level = Math.max(1, Math.floor(xpTotal / 600) + 1);
  const xpInLevel = xpTotal % 600;
  const levelProgress = xpInLevel / 600;

  const dailyGoal = user.dailyGoalWords;
  const learnedToday = Math.min(dailyGoal, Math.max(0, Math.round(xpToday / 40)));
  const goalP = dailyGoal ? learnedToday / dailyGoal : 0;

  // Daily Challenge (deterministic by day of week)
  const dailyChallenge = useMemo(() => {
    const challenges = [
      { title: 'Weekend Warrior', slug: 'speed-match', emoji: '🏆', colors: ['#FFB347', '#FF6B9D'] as [string, string] },
      { title: 'Speed Vocab Battle', slug: 'speed-match', emoji: '⚡', colors: ['#FF8C42', '#FFB347'] as [string, string] },
      { title: 'Fill Sprint', slug: 'fill-blank', emoji: '🧩', colors: ['#7B6FFF', '#A86EFF'] as [string, string] },
      { title: 'Scramble Derby', slug: 'scramble', emoji: '🔤', colors: ['#00E5B8', '#00B8D4'] as [string, string] },
      { title: 'Definition Blitz', slug: 'definition-type', emoji: '⌨️', colors: ['#5BA8FF', '#7B6FFF'] as [string, string] },
      { title: 'True or False Friday', slug: 'true-false', emoji: '↔️', colors: ['#FF6B9D', '#FF8C42'] as [string, string] },
      { title: 'Chain Master', slug: 'word-chain', emoji: '🔗', colors: ['#4CE77D', '#00E5B8'] as [string, string] },
    ];
    return challenges[new Date().getDay()];
  }, []);

  const timeRemaining = useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m left`;
  }, []);

  const weeklyMarkers = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const marks = weekly.slice(-7);
    const todayIdx = (new Date().getDay() + 6) % 7;
    return { days, marks, todayIdx };
  }, [weekly]);

  const dailyMission = useMemo(() => {
    if (dueCount > 0) {
      return {
        eyebrow: 'Smart next step',
        title: `Review ${dueCount} due ${dueCount === 1 ? 'card' : 'cards'}`,
        detail: 'Protect your memory curve before learning new words.',
        action: 'Start review',
        route: '/(tabs)/review' as const,
        colors: ['rgba(255,107,157,0.28)', 'rgba(123,111,255,0.14)'] as [string, string],
        accent: t.colors.accentPink,
        score: Math.min(1, dueCount / Math.max(8, dailyGoal)),
      };
    }

    if (goalP < 1) {
      const remaining = Math.max(1, dailyGoal - learnedToday);
      return {
        eyebrow: 'Today’s mission',
        title: `Learn ${remaining} more ${remaining === 1 ? 'word' : 'words'}`,
        detail: 'A short swipe session is enough to move your streak forward.',
        action: 'Continue learning',
        route: '/(tabs)/learn' as const,
        colors: ['rgba(0,229,184,0.24)', 'rgba(91,168,255,0.13)'] as [string, string],
        accent: t.colors.accentTeal,
        score: goalP,
      };
    }

    if (!isPremium && xpTotal >= 500) {
      return {
        eyebrow: 'Level up your loop',
        title: 'Unlock deeper practice',
        detail: 'You have momentum. Add tutor coaching, premium packs, and deeper insights.',
        action: 'See premium',
        route: '/paywall' as const,
        colors: ['rgba(123,111,255,0.26)', 'rgba(255,107,157,0.14)'] as [string, string],
        accent: t.colors.accentPurple,
        score: 1,
      };
    }

    return {
      eyebrow: 'Goal complete',
      title: 'Keep the streak warm',
      detail: 'Play today’s challenge for a bonus burst without adding pressure.',
      action: 'Play challenge',
      route: `/games/${dailyChallenge.slug}` as const,
      colors: ['rgba(255,179,71,0.26)', 'rgba(0,229,184,0.12)'] as [string, string],
      accent: t.colors.accentAmber,
      score: 1,
    };
  }, [dailyGoal, dailyChallenge.slug, dueCount, goalP, isPremium, learnedToday, t.colors.accentAmber, t.colors.accentPink, t.colors.accentPurple, t.colors.accentTeal, xpTotal]);

  // Animations
  const flameScale = useSharedValue(1);
  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 700, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) })
      ),
      -1
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const xpFill = useSharedValue(0);
  useEffect(() => {
    xpFill.value = withTiming(levelProgress, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [levelProgress]);
  const xpFillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(xpFill.value * 100)}%`,
  }));

  const goalFill = useSharedValue(0);
  useEffect(() => {
    goalFill.value = withTiming(goalP, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [goalP]);

  const goalFillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(goalFill.value * 100)}%`,
  }));

  const wodH = useSharedValue(0);
  useEffect(() => {
    wodH.value = withSpring(wodExpanded ? 1 : 0, { damping: 18, stiffness: 180 });
  }, [wodExpanded]);

  const wodBodyStyle = useAnimatedStyle(() => ({
    height: withTiming(wodExpanded ? 160 : 0, { duration: 260, easing: Easing.out(Easing.quad) }),
    opacity: withTiming(wodExpanded ? 1 : 0, { duration: 200 }),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wodH.value * 180}deg` }],
  }));

  const quickActions = [
    {
      key: 'learn',
      symbol: 'book.fill',
      fallback: 'L',
      label: 'Learn',
      onPress: () => router.push('/(tabs)/learn'),
      accent: t.colors.accentPurple,
      colors: ['rgba(123,111,255,0.3)', 'rgba(123,111,255,0.1)'] as [string, string],
    },
    {
      key: 'review',
      symbol: 'arrow.clockwise',
      fallback: 'R',
      label: 'Review',
      onPress: () => router.push('/(tabs)/review'),
      badge: dueCount,
      accent: t.colors.accentTeal,
      colors: ['rgba(0,229,184,0.3)', 'rgba(0,229,184,0.1)'] as [string, string],
    },
    {
      key: 'games',
      symbol: 'gamecontroller.fill',
      fallback: 'G',
      label: 'Games',
      onPress: () => router.push('/(tabs)/games'),
      accent: t.colors.accentAmber,
      colors: ['rgba(255,140,66,0.3)', 'rgba(255,179,71,0.1)'] as [string, string],
    },
    {
      key: 'dict',
      symbol: 'text.book.closed.fill',
      fallback: 'D',
      label: 'Dictionary',
      onPress: () => router.push('/dictionary'),
      accent: t.colors.accentBlue,
      colors: ['rgba(91,168,255,0.3)', 'rgba(91,168,255,0.1)'] as [string, string],
    },
    {
      key: 'progress',
      symbol: 'chart.bar.fill',
      fallback: 'P',
      label: 'Progress',
      onPress: () => router.push('/progress'),
      accent: '#4CE77D',
      colors: ['rgba(76,231,125,0.3)', 'rgba(76,231,125,0.1)'] as [string, string],
    },
    {
      key: 'ai',
      symbol: 'sparkles',
      fallback: 'AI',
      label: 'AI Tutor',
      onPress: () => router.push('/chat'),
      accent: t.colors.accentPink,
      colors: ['rgba(255,107,157,0.3)', 'rgba(255,107,157,0.1)'] as [string, string],
    },
  ];

  const sessionPath = useMemo(
    () => [
      {
        key: 'review',
        label: dueCount > 0 ? 'Clear memory debt' : 'Memory protected',
        detail: dueCount > 0 ? `${dueCount} due now` : 'No reviews due',
        state: dueCount > 0 ? 'Start' : 'Done',
        symbol: 'arrow.clockwise',
        fallback: 'R',
        accent: dueCount > 0 ? t.colors.accentPink : t.colors.accentTeal,
        done: dueCount === 0,
        onPress: () => router.push('/(tabs)/review'),
      },
      {
        key: 'learn',
        label: goalP >= 1 ? 'Daily goal complete' : 'Build today’s set',
        detail: `${learnedToday}/${dailyGoal} words`,
        state: goalP >= 1 ? 'Done' : 'Learn',
        symbol: 'book.fill',
        fallback: 'L',
        accent: t.colors.accentTeal,
        done: goalP >= 1,
        onPress: () => router.push('/(tabs)/learn'),
      },
      {
        key: 'play',
        label: 'Lock it in with play',
        detail: dailyChallenge.title,
        state: 'Play',
        symbol: 'gamecontroller.fill',
        fallback: 'G',
        accent: t.colors.accentAmber,
        done: false,
        onPress: () => router.push(`/games/${dailyChallenge.slug}`),
      },
    ],
    [dailyChallenge.slug, dailyChallenge.title, dailyGoal, dueCount, goalP, learnedToday, t.colors.accentAmber, t.colors.accentPink, t.colors.accentTeal]
  );

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_BOTTOM }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color: t.colors.muted }}>
              {greeting} ✨
            </LexText>
            <LexText variant="h2" style={{ marginTop: 2 }}>
              {user.displayName || 'Welcome back'}
            </LexText>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: t.colors.surface2, borderColor: t.colors.border }]}>
            <LexText variant="label" style={{ color: t.colors.accentPurple, fontSize: 11 }}>
              LVL {level}
            </LexText>
          </View>
        </View>

        {/* Level XP progress bar */}
        <View style={styles.xpBarTrack}>
          <Animated.View style={[StyleSheet.absoluteFill, xpFillStyle]}>
            <LinearGradient
              colors={[t.colors.accentPurple, t.colors.accentBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <LexText variant="label" style={{ color: t.colors.muted, marginTop: 4, fontSize: 10 }}>
          {xpInLevel} / 600 XP to Level {level + 1}
        </LexText>

        <Animated.View entering={FadeInDown.delay(40).duration(420)} style={[styles.pathCard, { borderColor: t.colors.borderBright }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.075)', 'rgba(123,111,255,0.08)', 'rgba(0,229,184,0.045)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.pathHeader}>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Today's path
              </LexText>
              <LexText variant="h3" style={{ marginTop: 4 }}>
                One guided loop, three wins
              </LexText>
            </View>
            <View style={[styles.pathBadge, { borderColor: t.colors.borderBright }]}>
              <LexText variant="label" style={{ color: t.colors.mutedStrong, fontSize: 10 }}>
                {Math.round(goalP * 100)}%
              </LexText>
            </View>
          </View>
          <View style={styles.pathSteps}>
            {sessionPath.map(({ key, ...item }, index) => (
              <SessionPathItem key={key} index={index + 1} {...item} />
            ))}
          </View>
        </Animated.View>

        {/* ── Streak Card ────────────────────────────────────── */}
        <GlowCard
          colors={['rgba(255,179,71,0.55)', 'rgba(255,107,157,0.3)']}
          style={{ marginTop: 18 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Animated.View style={flameStyle}>
                <LexText variant="h1" style={{ fontSize: 40 }}>🔥</LexText>
              </Animated.View>
              <View>
                <LexText variant="h2" style={{ color: t.colors.accentAmber, fontSize: 36 }}>
                  {streak}
                </LexText>
                <LexText variant="muted" style={{ marginTop: -2 }}>day streak</LexText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              {streak >= 7 && (
                <View style={[styles.badge, { borderColor: 'rgba(255,179,71,0.4)', backgroundColor: 'rgba(255,179,71,0.12)' }]}>
                  <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 10 }}>
                    🛡 SHIELD
                  </LexText>
                </View>
              )}
              <LexText variant="muted" style={{ fontSize: 12 }}>best {streakLongest}</LexText>
            </View>
          </View>

          {/* Weekly dots */}
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 14 }}>
            {weeklyMarkers.days.map((d, i) => {
              const completed = (weeklyMarkers.marks[i] ?? 0) > 0;
              const today = i === weeklyMarkers.todayIdx;
              return (
                <View
                  key={i}
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: completed
                        ? 'rgba(0,229,184,0.22)'
                        : 'rgba(255,255,255,0.06)',
                      borderColor: completed
                        ? 'rgba(0,229,184,0.4)'
                        : t.colors.border,
                      borderWidth: today ? 1.5 : 1,
                      transform: [{ scale: today ? 1.1 : 1 }],
                    },
                  ]}
                >
                  <LexText
                    variant="label"
                    style={{
                      fontSize: 10,
                      color: completed ? t.colors.accentTeal : t.colors.muted,
                    }}
                  >
                    {d}
                  </LexText>
                </View>
              );
            })}
          </View>
        </GlowCard>

        {/* ── Today's Stats Row ──────────────────────────────── */}
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <StatBento
            value={String(learnedToday)}
            label="learned"
            color={t.colors.accentTeal}
          />
          <StatBento
            value={String(xpToday)}
            label="XP today"
            color={t.colors.accentPurple}
          />
          <StatBento
            value={String(dueCount)}
            label="due now"
            color={dueCount > 0 ? t.colors.accentPink : t.colors.muted}
          />
        </View>

        {/* ── Smart Mission ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(420)} style={{ marginTop: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${dailyMission.eyebrow}. ${dailyMission.title}. ${dailyMission.action}.`}
            onPress={() => {
              hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
              router.push(dailyMission.route);
            }}
            style={({ pressed }) => [
              styles.missionCard,
              {
                borderColor: 'rgba(255,255,255,0.10)',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <LinearGradient
              colors={dailyMission.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.missionHeader}>
              <View style={{ flex: 1 }}>
                <LexText variant="label" style={{ color: dailyMission.accent, fontSize: 10 }}>
                  {dailyMission.eyebrow}
                </LexText>
                <LexText variant="h3" style={{ marginTop: 6 }}>
                  {dailyMission.title}
                </LexText>
              </View>
              <MissionRing progress={dailyMission.score} color={dailyMission.accent} />
            </View>
            <LexText variant="muted" style={{ marginTop: 10 }}>
              {dailyMission.detail}
            </LexText>
            <View style={styles.missionFooter}>
              <LexText variant="title" style={{ color: dailyMission.accent, fontSize: 14 }}>
                {dailyMission.action}
              </LexText>
              <LexText variant="title" style={{ color: dailyMission.accent, fontSize: 18 }}>
                →
              </LexText>
            </View>
          </Pressable>
        </Animated.View>

        {/* ── Daily Challenge ────────────────────────────────── */}
        <Pressable
          onPress={() => {
            hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/games/${dailyChallenge.slug}`);
          }}
          style={{ marginTop: 12 }}
        >
          <LinearGradient
            colors={dailyChallenge.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.challengeCard}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={styles.challengeBadge}>
                  <LexText variant="label" style={{ color: 'white', fontSize: 10, letterSpacing: 0 }}>
                    ⚡ DAILY CHALLENGE
                  </LexText>
                </View>
                <LexText variant="h3" style={{ color: 'white', marginTop: 8 }}>
                  {dailyChallenge.emoji} {dailyChallenge.title}
                </LexText>
                <LexText style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
                  {timeRemaining}
                </LexText>
              </View>
              <View style={styles.xpBonusBadge}>
                <LexText
                  variant="h3"
                  style={{ color: 'white', fontSize: 18, textAlign: 'center' }}
                >
                  2×
                </LexText>
                <LexText variant="label" style={{ color: 'white', fontSize: 9 }}>
                  XP
                </LexText>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* ── Word of the Day ────────────────────────────────── */}
        <Pressable
          onPress={() => setWodExpanded((v) => !v)}
          style={{ marginTop: 12 }}
        >
          <GlowCard colors={['rgba(123,111,255,0.55)', 'rgba(0,229,184,0.35)']}>
            <LexText style={styles.wodQuoteMark}>"</LexText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <LexText variant="label" style={{ color: '#A89CFF', fontSize: 11 }}>
                📖 WORD OF THE DAY
              </LexText>
              <Animated.View style={chevronStyle}>
                <LexText variant="body" style={{ color: t.colors.muted }}>▾</LexText>
              </Animated.View>
            </View>

            <LexText variant="h2" style={{ marginTop: 10, fontSize: 34 }}>
              {wod?.word ?? '…'}
            </LexText>
            <LexText
              variant="muted"
              style={{ marginTop: 4, color: t.colors.accentPink, fontStyle: 'italic', fontSize: 14 }}
            >
              {wod?.phonetic ?? ''} · {wod?.part_of_speech ?? ''}
            </LexText>
            <LexText variant="muted" style={{ marginTop: 8, lineHeight: 20 }}>
              {wod?.short_definition ?? (wodLoading ? 'Loading…' : '')}
            </LexText>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (!wod) return;
                  Speech.speak(wod.word, { rate: 0.9, pitch: 1.0 });
                  hapticSelection();
                }}
                style={[styles.wodBtn, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.07)' }]}
              >
                <LexText variant="title" style={{ fontSize: 14 }}>🔊 Listen</LexText>
              </Pressable>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (!wod) return;
                  addToStudyList(wod.id);
                  hapticNotify(Haptics.NotificationFeedbackType.Success);
                }}
                style={[styles.wodBtn, { borderColor: 'rgba(0,229,184,0.35)', backgroundColor: 'rgba(0,229,184,0.1)', flex: 1 }]}
              >
                <LexText variant="title" style={{ fontSize: 14, color: t.colors.accentTeal }}>
                  + Add to list
                </LexText>
              </Pressable>
            </View>

            <Animated.View style={[styles.wodBody, wodBodyStyle]}>
              <View style={{ height: 12 }} />
              <LexText variant="label">FULL DEFINITION</LexText>
              <LexText variant="muted" style={{ marginTop: 6, lineHeight: 20 }}>
                {wod?.definition ?? ''}
              </LexText>
              {wod?.example_sentences?.[0]?.sentence ? (
                <>
                  <View style={{ height: 10 }} />
                  <LexText variant="label">EXAMPLE</LexText>
                  <LexText variant="muted" style={{ marginTop: 6, fontStyle: 'italic', lineHeight: 20 }}>
                    "{wod.example_sentences[0].sentence}"
                  </LexText>
                </>
              ) : null}
            </Animated.View>
          </GlowCard>
        </Pressable>

        {/* ── Today's Goal ───────────────────────────────────── */}
        <View style={[styles.goalCard, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <LexText variant="title">Today's goal</LexText>
            <LexText variant="muted" style={{ color: goalP >= 1 ? t.colors.accentTeal : t.colors.muted }}>
              {learnedToday}/{dailyGoal} words{goalP >= 1 ? ' ✓' : ''}
            </LexText>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[StyleSheet.absoluteFill, goalFillStyle]}>
              <LinearGradient
                colors={[t.colors.accentPurple, t.colors.accentTeal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Button
              title={goalP >= 1 ? '🎉 Goal complete! Practice more →' : `Start Today's ${dailyGoal} Words →`}
              onPress={() => router.push('/(tabs)/learn')}
            />
          </View>
        </View>

        {/* ── Quick Actions Grid ─────────────────────────────── */}
        <LexText variant="label" style={{ color: t.colors.muted, marginTop: 20 }}>
          QUICK ACTIONS
        </LexText>
        <View style={[styles.actionsGrid, { marginTop: 10 }]}>
          {quickActions.map((a) => (
            <Pressable
              key={a.key}
              onPress={() => {
                hapticSelection();
                a.onPress();
              }}
              style={({ pressed }) => [
                styles.actionTile,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: t.colors.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={a.colors}
                style={styles.actionIconBg}
              >
                <IconSymbol name={a.symbol} fallback={a.fallback} color={a.accent} size={22} />
              </LinearGradient>
              <LexText variant="title" style={{ fontSize: 13, marginTop: 8 }}>
                {a.label}
              </LexText>
              {a.badge ? (
                <View style={[styles.actionBadge, { backgroundColor: 'rgba(255,107,157,0.15)', borderColor: 'rgba(255,107,157,0.35)' }]}>
                  <LexText variant="label" style={{ fontSize: 10, color: t.colors.accentPink }}>
                    {a.badge}
                  </LexText>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        {/* ── Weekly Activity ────────────────────────────────── */}
        <View style={[styles.weekCard, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
          <LexText variant="title">Weekly activity</LexText>
          <LexText variant="muted" style={{ marginTop: 4, fontSize: 13 }}>
            Words learned per day
          </LexText>
          <View style={{ height: 14 }} />
          <WeeklyBars values={weekly.slice(-7)} todayIdx={(new Date().getDay() + 6) % 7} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatBento({ value, label, color }: { value: string; label: string; color: string }) {
  const t = useTheme();
  return (
    <View style={[styles.statBento, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
      <LexText variant="h2" style={{ fontSize: 26, color }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ marginTop: 4, fontSize: 10 }}>
        {label}
      </LexText>
    </View>
  );
}

function SessionPathItem({
  index,
  label,
  detail,
  state,
  symbol,
  fallback,
  accent,
  done,
  onPress,
}: {
  index: number;
  label: string;
  detail: string;
  state: string;
  symbol: string;
  fallback: string;
  accent: string;
  done: boolean;
  onPress: () => void;
}) {
  const t = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${index}. ${label}. ${detail}. ${state}.`}
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.pathStep,
        {
          borderColor: done ? `${accent}55` : t.colors.border,
          backgroundColor: done ? `${accent}14` : 'rgba(255,255,255,0.045)',
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <View style={[styles.pathIcon, { backgroundColor: `${accent}1A`, borderColor: `${accent}44` }]}>
        <IconSymbol name={symbol} fallback={fallback} color={accent} size={17} />
      </View>
      <View style={{ flex: 1 }}>
        <LexText variant="title" style={{ fontSize: 14 }} numberOfLines={1}>
          {label}
        </LexText>
        <LexText variant="muted" style={{ marginTop: 2, fontSize: 12, lineHeight: 16 }} numberOfLines={1}>
          {detail}
        </LexText>
      </View>
      <View style={[styles.pathState, { borderColor: `${accent}44`, backgroundColor: `${accent}14` }]}>
        <LexText variant="label" style={{ color: accent, fontSize: 9 }}>
          {state}
        </LexText>
      </View>
    </Pressable>
  );
}

function MissionRing({ progress, color }: { progress: number; color: string }) {
  const size = 50;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={styles.missionRing}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={5}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.missionRingText}>
        <LexText variant="label" style={{ color, fontSize: 10 }}>
          {Math.round(clamped * 100)}
        </LexText>
      </View>
    </View>
  );
}

function WeeklyBars({ values, todayIdx }: { values: number[]; todayIdx: number }) {
  const t = useTheme();
  const max = Math.max(...values, 1);
  const H = 72;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View>
      <Svg width="100%" height={H} viewBox="0 0 100 100" preserveAspectRatio="none">
        {values.map((v, i) => {
          const barSegW = 100 / values.length;
          const bh = Math.max(4, Math.round((v / max) * 100));
          const x = i * barSegW + barSegW * 0.12;
          const w = barSegW * 0.76;
          const y = 100 - bh;
          const isToday = i === todayIdx;
          const hasData = v > 0;
          const fill = isToday
            ? t.colors.accentTeal
            : hasData
            ? 'rgba(123,111,255,0.55)'
            : 'rgba(255,255,255,0.08)';
          return <Rect key={i} x={x} y={y} width={w} height={bh} rx={3} fill={fill} />;
        })}
      </Svg>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {days.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <LexText
              variant="label"
              style={{ fontSize: 10, color: i === todayIdx ? t.colors.accentTeal : t.colors.muted }}
            >
              {d}
            </LexText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  xpBarTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBento: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 14,
    alignItems: 'center',
  },
  pathCard: {
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 16,
    marginTop: 12,
    boxShadow: '0 18px 34px rgba(0,0,0,0.34)',
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pathBadge: {
    minWidth: 52,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  pathSteps: {
    gap: 8,
    marginTop: 14,
  },
  pathStep: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pathIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathState: {
    minWidth: 46,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  missionCard: {
    minHeight: 170,
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 18,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  missionFooter: {
    minHeight: 42,
    marginTop: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionRing: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionRingText: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeCard: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  challengeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpBonusBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  wodBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  wodBody: {
    overflow: 'hidden',
  },
  wodQuoteMark: {
    position: 'absolute',
    top: -14,
    right: 14,
    fontSize: 86,
    lineHeight: 92,
    color: 'rgba(123,111,255,0.18)',
    fontFamily: 'Georgia',
  },
  goalCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 14,
    alignItems: 'center',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  dayDot: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
});
