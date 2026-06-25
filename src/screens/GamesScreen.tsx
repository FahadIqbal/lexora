import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { GlowCard } from '../components/GlowCard';
import { useTheme } from '../theme/ThemeProvider';
import { gameList } from './games/gamesData';
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticImpact } from '../utils/haptics';
import { useAppStore } from '../store/useAppStore';

export function GamesScreen() {
  const t = useTheme();
  const xpToday = useAppStore((s) => s.xpToday);
  const streak = useAppStore((s) => s.streakCurrent);
  const dueCount = useAppStore((s) => s.getDueWordIds().length);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);

  const featured = gameList.find((g) => g.featured) ?? gameList[0];
  const rest = gameList.filter((g) => !g.featured);
  const recommended = useMemo(() => {
    if (dueCount > 0) return gameList.find((g) => g.slug === 'true-false') ?? featured;
    if (xpToday < 40) return featured;
    if (streak >= 3) return gameList.find((g) => g.slug === 'word-chain') ?? featured;
    return gameList.find((g) => g.slug === 'scramble') ?? featured;
  }, [dueCount, featured, streak, xpToday]);

  const arcadePlan = useMemo(
    () => [
      {
        label: 'Warm up',
        game: gameList.find((g) => g.slug === 'true-false') ?? featured,
        note: dueCount > 0 ? `${dueCount} due cards` : 'low pressure',
      },
      {
        label: 'Focus',
        game: recommended,
        note: `${recommended.xpReward} XP target`,
      },
      {
        label: 'Stretch',
        game: gameList.find((g) => g.slug === 'definition-type') ?? featured,
        note: 'precision recall',
      },
    ],
    [dueCount, featured, recommended]
  );

  const pulse = useSharedValue(1);
  const drift = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.quad) })
      ),
      -1
    );
    drift.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift, pulse]);

  const playPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const orbOneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 16 }, { translateY: drift.value * -10 }, { scale: 1 + drift.value * 0.06 }],
  }));

  const orbTwoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * -12 }, { translateY: drift.value * 12 }, { scale: 1.05 - drift.value * 0.05 }],
  }));

  const goToGame = (slug: string) => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/games/${slug}`);
  };

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.wrap, { paddingBottom: TAB_BAR_BOTTOM }]}
        showsVerticalScrollIndicator={false}
      >
        <LexText variant="h2">Word Games</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Quick drills tuned for today’s memory curve.
        </LexText>

        {/* ── Arcade Plan ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: 16 }}>
          <View style={[styles.planCard, { borderColor: t.colors.border }]}>
            <LinearGradient
              colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)', 'rgba(255,179,71,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.ambientOrb, styles.ambientOrbOne, { backgroundColor: `${recommended.colors[0]}33` }, orbOneStyle]} />
            <Animated.View style={[styles.ambientOrb, styles.ambientOrbTwo, { backgroundColor: `${recommended.colors[1]}28` }, orbTwoStyle]} />
            <View style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                  Today’s arcade run
                </LexText>
                <LexText variant="h3" style={{ marginTop: 6 }}>
                  {recommended.title}
                </LexText>
                <LexText variant="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  {dueCount > 0
                    ? 'Start with fast recall to reinforce due words.'
                    : xpToday < 40
                    ? `Earn a quick win toward your ${dailyGoalWords}-word rhythm.`
                    : 'You have momentum. Push recall under a little pressure.'}
                </LexText>
              </View>
              <View style={[styles.planIcon, { borderColor: `${recommended.colors[0]}66`, backgroundColor: `${recommended.colors[0]}22` }]}>
                <LexText style={{ fontSize: 30 }}>{recommended.icon}</LexText>
              </View>
            </View>

            <View style={styles.planStats}>
              <PlanMetric value={String(streak)} label="streak" color={t.colors.accentAmber} />
              <PlanMetric value={String(xpToday)} label="XP today" color={t.colors.accentPurple} />
              <PlanMetric value={String(dueCount)} label="due" color={dueCount > 0 ? t.colors.accentPink : t.colors.muted} />
            </View>

            <Animated.View style={playPulseStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Play recommended game, ${recommended.title}`}
                onPress={() => goToGame(recommended.slug)}
                style={({ pressed }) => [
                  styles.primaryPlay,
                  {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.18)',
                    opacity: pressed ? 0.86 : 1,
                  },
                ]}
              >
                <View>
                  <LexText variant="title" style={{ color: 'white' }}>
                    Play recommended
                  </LexText>
                  <LexText variant="label" style={{ color: 'rgba(255,255,255,0.58)', fontSize: 9, marginTop: 2 }}>
                    {recommended.xpReward} XP / under 2 min
                  </LexText>
                </View>
                <View style={[styles.playArrow, { backgroundColor: `${recommended.colors[0]}26`, borderColor: `${recommended.colors[0]}55` }]}>
                  <LexText variant="title" style={{ color: recommended.colors[0], fontSize: 18 }}>
                    →
                  </LexText>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>

        <View style={styles.playlistRow}>
          {arcadePlan.map((item, index) => (
            <AnimatedPressable
              key={`${item.label}-${item.game.slug}`}
              entering={FadeInDown.delay(70 + index * 45).duration(360).springify().damping(17)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}: ${item.game.title}. ${item.note}.`}
              onPress={() => goToGame(item.game.slug)}
              style={({ pressed }) => [
                styles.playlistCard,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: index === 1 ? item.game.colors[0] : t.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <LexText variant="label" style={{ color: index === 1 ? item.game.colors[0] : t.colors.muted, fontSize: 9 }}>
                {item.label}
              </LexText>
              <LexText style={{ fontSize: 22, marginTop: 8 }}>{item.game.icon}</LexText>
              <LexText variant="title" style={{ fontSize: 12, marginTop: 7 }} numberOfLines={1}>
                {item.game.title}
              </LexText>
              <LexText variant="muted" style={{ fontSize: 11, lineHeight: 14, marginTop: 3 }} numberOfLines={2}>
                {item.note}
              </LexText>
            </AnimatedPressable>
          ))}
        </View>

        {/* ── Featured Game ─────────────────────────────────── */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Featured game, ${featured.title}. ${featured.subtitle}.`}
          onPress={() => goToGame(featured.slug)}
          style={({ pressed }) => ({ marginTop: 18, opacity: pressed ? 0.92 : 1 })}
        >
          <LinearGradient
            colors={featured.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 22 }]} />
            <View style={styles.featuredBadge}>
              <LexText variant="label" style={{ color: 'white', fontSize: 10 }}>⭐ FEATURED</LexText>
            </View>
            <LexText style={{ fontSize: 52, marginTop: 10 }}>{featured.icon}</LexText>
            <LexText variant="h2" style={{ color: 'white', marginTop: 10 }}>
              {featured.title}
            </LexText>
            <LexText style={{ color: 'rgba(255,255,255,0.78)', marginTop: 6, fontSize: 14 }}>
              {featured.subtitle}
            </LexText>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'center' }}>
              <DifficultyPips level={featured.difficulty} />
              <View style={styles.xpTag}>
                <LexText variant="label" style={{ color: 'white', fontSize: 10 }}>
                  +{featured.xpReward} XP
                </LexText>
              </View>
            </View>
            <View style={[styles.playBtn]}>
              <LexText variant="title" style={{ color: 'white', fontFamily: t.font.heading.bold }}>
                Play now →
              </LexText>
            </View>
          </LinearGradient>
        </Pressable>

        {/* ── Game Grid ─────────────────────────────────────── */}
        <LexText variant="label" style={{ color: t.colors.muted, marginTop: 20 }}>
          ALL GAMES
        </LexText>

        <View style={[styles.grid, { marginTop: 10 }]}>
          {rest.map((g, index) => (
            <AnimatedPressable
              key={g.slug}
              entering={FadeInDown.delay(110 + index * 35).duration(360).springify().damping(18)}
              accessibilityRole="button"
              accessibilityLabel={`${g.title}. ${g.subtitle}. Difficulty ${g.difficulty} of 5. Rewards ${g.xpReward} XP.`}
              onPress={() => goToGame(g.slug)}
              style={({ pressed }) => [
                styles.gameCard,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: t.colors.border,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={[`${g.colors[0]}28`, `${g.colors[1]}14`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.gameIconBg, { backgroundColor: `${g.colors[0]}22`, borderColor: `${g.colors[0]}44` }]}>
                <LexText style={{ fontSize: 24 }}>{g.icon}</LexText>
              </View>
              <LexText variant="title" style={{ marginTop: 10, fontSize: 14 }}>
                {g.title}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
                {g.subtitle}
              </LexText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <DifficultyPips level={g.difficulty} color={g.colors[0]} />
                <View style={[styles.rewardChip, { backgroundColor: `${g.colors[0]}18`, borderColor: `${g.colors[0]}35` }]}>
                  <LexText variant="label" style={{ fontSize: 9, color: g.colors[0] }}>
                    +{g.xpReward} XP
                  </LexText>
                </View>
              </View>
            </AnimatedPressable>
          ))}
        </View>

        {/* ── Tip ───────────────────────────────────────────── */}
        <GlowCard
          colors={['rgba(255,179,71,0.45)', 'rgba(255,107,157,0.3)']}
          style={{ marginTop: 14 }}
        >
          <LexText variant="label" style={{ color: t.colors.accentAmber }}>💡 PRO TIP</LexText>
          <LexText variant="muted" style={{ marginTop: 8, fontSize: 14 }}>
            Play games immediately after Learn Mode for a 40% retention boost. Your brain is primed!
          </LexText>
        </GlowCard>
      </ScrollView>
    </Screen>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DifficultyPips({ level, color }: { level: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor:
              i <= level
                ? (color ?? 'rgba(255,255,255,0.8)')
                : 'rgba(255,255,255,0.18)',
          }}
        />
      ))}
    </View>
  );
}

function PlanMetric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.planMetric}>
      <LexText variant="h3" style={{ color, fontSize: 20, textAlign: 'center' }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  planCard: {
    minHeight: 236,
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 18,
  },
  ambientOrb: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    opacity: 0.78,
  },
  ambientOrbOne: {
    right: -42,
    top: -42,
  },
  ambientOrbTwo: {
    left: -58,
    bottom: -60,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  planIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  planMetric: {
    flex: 1,
    minHeight: 62,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  primaryPlay: {
    minHeight: 48,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  playlistCard: {
    flex: 1,
    minHeight: 128,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 12,
    overflow: 'hidden',
  },
  featuredCard: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  rewardChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  gameIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
