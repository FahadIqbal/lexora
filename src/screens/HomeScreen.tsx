import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';

export function HomeScreen() {
  const t = useTheme();
  const user = useAppStore((s) => s.user);
  const streak = useAppStore((s) => s.streakCurrent);
  const streakLongest = useAppStore((s) => s.streakLongest);
  const xpToday = useAppStore((s) => s.xpToday);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const weekly = useAppStore((s) => s.getWeeklyWordsLearned());
  const dueCount = useAppStore((s) => s.getDueWordIds().length);
  const addToStudyList = useAppStore((s) => s.addToStudyList);

  const [wodExpanded, setWodExpanded] = useState(false);
  const { data: wod, loading: wodLoading } = useAsyncResource(() => repos.words.getWordOfTheDay(), []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if ([7, 30, 100].includes(streak)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [streak]);

  const wodH = useSharedValue(0);
  useEffect(() => {
    wodH.value = withSpring(wodExpanded ? 1 : 0, { damping: 18, stiffness: 180 });
  }, [wodExpanded]);

  const wodBodyStyle = useAnimatedStyle(() => ({
    height: withTiming(wodExpanded ? 140 : 0, { duration: 260, easing: Easing.out(Easing.quad) }),
    opacity: withTiming(wodExpanded ? 1 : 0, { duration: 180 }),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wodH.value * 180}deg` }],
  }));

  const dailyGoal = user.dailyGoalWords;
  // Until Supabase stats are wired, derive learnedToday from xpToday (simple heuristic, but not hardcoded).
  const learnedToday = Math.min(dailyGoal, Math.max(0, Math.round(xpToday / 40)));
  const goalP = dailyGoal ? learnedToday / dailyGoal : 0;
  const goalFill = useSharedValue(0);
  useEffect(() => {
    goalFill.value = withTiming(goalP, { duration: 550, easing: Easing.out(Easing.cubic) });
  }, [goalP]);

  const goalFillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(goalFill.value * 100)}%`,
  }));

  const actions = [
    { key: 'flashcards', icon: '🎴', label: 'Flashcards', onPress: () => router.push('/(tabs)/review') },
    { key: 'review', icon: '🔁', label: 'Review Due', onPress: () => router.push('/(tabs)/review'), badge: 8 },
    { key: 'games', icon: '🎮', label: 'Word Games', onPress: () => router.push('/(tabs)/games') },
    { key: 'list', icon: '📖', label: 'Word List', onPress: () => router.push('/dictionary') },
    { key: 'leaderboard', icon: '🏆', label: 'Leaderboard', onPress: () => router.push('/(tabs)/social') },
  ] as const;


  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LexText variant="label" style={{ color: t.colors.muted }}>
          {greeting}, {user.displayName || 'there'} ✨
        </LexText>
        <LexText variant="h2" style={{ marginTop: 6 }}>
          Your words, upgraded.
        </LexText>

        {/* Streak card */}
        <Card style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <LexText variant="h2" style={{ color: t.colors.accentAmber }}>
                🔥 {streak}
              </LexText>
              <LexText variant="muted">day streak</LexText>
            </View>
            {streak > 7 ? (
              <View style={[styles.badge, { borderColor: 'rgba(255,179,71,0.35)', backgroundColor: 'rgba(255,179,71,0.10)' }]}>
                <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 10 }}>
                  +2 XP bonus
                </LexText>
              </View>
            ) : null}
          </View>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Longest: {streakLongest}
          </LexText>

          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const completed = i < 5;
              const today = i === 4;
              return (
                <View
                  key={i}
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor: completed ? 'rgba(0,212,170,0.18)' : 'rgba(255,255,255,0.06)',
                      borderColor: completed ? 'rgba(0,212,170,0.35)' : t.colors.border,
                      transform: [{ scale: today ? 1.08 : 1 }],
                    },
                  ]}
                >
                  <LexText variant="label" style={{ fontSize: 10, color: completed ? t.colors.accentTeal : t.colors.muted }}>
                    {d}
                  </LexText>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Word of the Day */}
        <Pressable
          onPress={() => setWodExpanded((v) => !v)}
          style={{ marginTop: 12, borderRadius: 18, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['rgba(108,99,255,0.35)', 'rgba(0,212,170,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 1.2, borderRadius: 18 }}
          >
            <View style={{ borderRadius: 16, backgroundColor: t.colors.surface, padding: 16, overflow: 'hidden' }}>
              <View style={styles.wodQuote}>
                <LexText variant="h1" style={{ fontSize: 72, opacity: 0.08 }}>
                  “
                </LexText>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <LexText variant="label" style={{ color: '#A89CFF' }}>
                  WORD OF THE DAY
                </LexText>
                <Animated.View style={chevronStyle}>
                  <LexText variant="title" style={{ color: t.colors.muted }}>
                    ▾
                  </LexText>
                </Animated.View>
              </View>

              <LexText variant="h2" style={{ marginTop: 10 }}>
                {wod?.word ?? '…'}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 4, fontStyle: 'italic' }}>
                {wod?.part_of_speech ?? ''}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 8 }}>
                {wod?.short_definition ?? (wodLoading ? 'Loading word of the day…' : '')}
              </LexText>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Listen"
                    variant="ghost"
                    onPress={() => {
                      if (!wod) return;
                      Speech.speak(wod.word, { rate: 0.95, pitch: 1.0 });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Add to my list"
                    onPress={() => {
                      if (!wod) return;
                      addToStudyList(wod.id);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    }}
                    disabled={!wod}
                  />
                </View>
              </View>

              <Animated.View style={[styles.wodBody, wodBodyStyle]}>
                <View style={{ height: 10 }} />
                <LexText variant="title">Definition</LexText>
                <LexText variant="muted" style={{ marginTop: 6 }}>
                  {wod?.definition ?? ''}
                </LexText>
                <View style={{ height: 10 }} />
                <LexText variant="title">Example</LexText>
                <LexText variant="muted" style={{ marginTop: 6 }}>
                  {wod?.example_sentences?.[0]?.sentence ?? ''}
                </LexText>
                <View style={{ height: 10 }} />
                <LexText variant="title">Etymology</LexText>
                <LexText variant="muted" style={{ marginTop: 6 }}>
                  {wod?.etymology ?? ''}
                </LexText>
              </Animated.View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Daily goal progress */}
        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <LexText variant="title">Today’s goal</LexText>
            <LexText variant="muted">
              {learnedToday}/{dailyGoal} words
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
          <LexText variant="muted" style={{ marginTop: 10 }}>
            📊 {xpToday} XP today
          </LexText>
        </Card>

        {/* Continue learning */}
        <View style={{ marginTop: 12 }}>
          <Button title={`Start Today’s Words →`} onPress={() => router.push('/(tabs)/learn')} />
        </View>

        {/* Quick actions */}
        <View style={{ marginTop: 16 }}>
          <LexText variant="title">Quick actions</LexText>
          <View style={{ height: 12 }} />
          <FlashList
            data={actions as any}
            keyExtractor={(x: any) => x.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 18 }}
            renderItem={({ item }: any) => (
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.actionCard,
                  {
                    backgroundColor: t.colors.surface,
                    borderColor: t.colors.border,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <LexText variant="h3" style={{ fontSize: 20 }}>
                    {item.icon}
                  </LexText>
                  {item.badge ? (
                    <View style={[styles.badgeSmall, { backgroundColor: 'rgba(255,107,157,0.16)', borderColor: 'rgba(255,107,157,0.35)' }]}>
                      <LexText variant="label" style={{ fontSize: 10, color: t.colors.accentPink }}>
                        {item.badge}
                      </LexText>
                    </View>
                  ) : null}
                </View>
                <LexText variant="muted" style={{ marginTop: 10 }}>
                  {item.label}
                </LexText>
              </Pressable>
            )}
          />
        </View>

        {/* Words due */}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <LexText variant="title">Words due for review</LexText>
            <LexText variant="muted" style={{ color: t.colors.accentTeal }} onPress={() => router.push('/(tabs)/review')}>
              Review {dueCount} words →
            </LexText>
          </View>

          <View style={{ marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(dueCount ? ['Due now'] : ['Nothing due']).map((w) => (
              <View key={w} style={[styles.chip, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {w}
                </LexText>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly stats */}
        <Card style={{ marginTop: 18 }}>
          <LexText variant="title">Weekly stats</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Words learned per day
          </LexText>
          <View style={{ height: 12 }} />
          <WeeklyBars values={weekly} activeIndex={4} />
        </Card>

        {/* Links */}
        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Your setup</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Categories: {selectedCategories.join(', ')}
          </LexText>
          <View style={styles.quickRow}>
            <Button title="Dictionary" variant="ghost" onPress={() => router.push('/dictionary')} style={styles.quickBtn} />
            <Button title="AI Tutor" variant="ghost" onPress={() => router.push('/chat')} style={styles.quickBtn} />
            <Button title="Progress" variant="ghost" onPress={() => router.push('/progress')} style={styles.quickBtn} />
            <Button title="Settings" variant="ghost" onPress={() => router.push('/settings')} style={styles.quickBtn} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function WeeklyBars({ values, activeIndex }: { values: number[]; activeIndex: number }) {
  const t = useTheme();
  const max = Math.max(...values, 1);
  const w = 320;
  const h = 84;
  const gap = 8;
  const barW = (w - gap * (values.length - 1)) / values.length;

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      {values.map((v, i) => {
        const bh = Math.max(6, Math.round((v / max) * (h - 10)));
        const x = i * (barW + gap);
        const y = h - bh;
        const fill = i === activeIndex ? t.colors.accentPurple : 'rgba(108,99,255,0.22)';
        return <Rect key={i} x={x} y={y} width={barW} height={bh} rx={6} fill={fill} />;
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  quickBtn: {
    width: '48%',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeSmall: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDot: {
    flex: 1,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wodQuote: {
    position: 'absolute',
    right: 8,
    top: -12,
  },
  wodBody: {
    overflow: 'hidden',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  actionCard: {
    width: 140,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
