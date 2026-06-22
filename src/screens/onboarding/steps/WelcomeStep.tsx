import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolate,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ProgressDots } from '../../../components/ProgressDots';
import { WordParticles } from '../ui/WordParticles';
import { Shimmer } from '../ui/Shimmer';
import { Haptics, hapticImpact, hapticNotify, hapticSelection } from '../../../utils/haptics';

type Slide =
  | {
      kind: 'feature';
      emoji: string;
      title: string;
      body: string[];
    }
  | {
      kind: 'demo';
      title: string;
    };

function useHaptics() {
  return {
    selection: () => hapticSelection(),
    light: () => hapticImpact(Haptics.ImpactFeedbackStyle.Light),
    success: () => hapticNotify(Haptics.NotificationFeedbackType.Success),
    error: () => hapticNotify(Haptics.NotificationFeedbackType.Error),
  };
}

function FeatureSlideCard({
  index,
  interval,
  scrollX,
  title,
  emoji,
  body,
  count,
  onPressIndex,
}: {
  index: number;
  interval: number;
  scrollX: SharedValue<number>;
  title: string;
  emoji: string;
  body: string[];
  count: number;
  onPressIndex: () => void;
}) {
  const t = useTheme();

  const a = useAnimatedStyle(() => {
    const x = scrollX.value;
    const input = [(index - 1) * interval, index * interval, (index + 1) * interval];
    const translate = interpolate(x, input, [-22, 0, 22], Extrapolate.CLAMP);
    const scale = interpolate(x, input, [0.96, 1, 0.96], Extrapolate.CLAMP);
    const opacity = interpolate(x, input, [0.55, 1, 0.55], Extrapolate.CLAMP);
    return {
      transform: [{ translateY: 0 }, { translateX: translate }, { scale }],
      opacity,
    };
  }, [index, interval]);

  return (
    <Animated.View style={[{ width: interval, paddingRight: 12 }, a]}>
      <Card style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <LexText variant="h2" style={{ fontSize: 22 }}>
            {emoji} {title}
          </LexText>
          <Pressable onPress={onPressIndex} style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.7 : 1 }]} hitSlop={10}>
            <LexText variant="muted" style={{ color: t.colors.muted }}>
              {index + 1}/{count}
            </LexText>
          </Pressable>
        </View>
        <View style={{ marginTop: 10, gap: 8 }}>
          {body.map((line) => (
            <LexText key={line} variant="muted" style={{ lineHeight: 19 }}>
              • {line}
            </LexText>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}

function DemoSlideCard({
  index,
  interval,
  scrollX,
  count,
  onPressIndex,
}: {
  index: number;
  interval: number;
  scrollX: SharedValue<number>;
  count: number;
  onPressIndex: () => void;
}) {
  const t = useTheme();
  const h = useHaptics();
  const flip = useSharedValue(0);
  const demoProgress = useSharedValue(0.35);

  const a = useAnimatedStyle(() => {
    const x = scrollX.value;
    const input = [(index - 1) * interval, index * interval, (index + 1) * interval];
    const translate = interpolate(x, input, [-22, 0, 22], Extrapolate.CLAMP);
    const scale = interpolate(x, input, [0.96, 1, 0.96], Extrapolate.CLAMP);
    const opacity = interpolate(x, input, [0.55, 1, 0.55], Extrapolate.CLAMP);
    return {
      transform: [{ translateX: translate }, { scale }],
      opacity,
    };
  }, [index, interval]);

  const frontStyle = useAnimatedStyle(() => {
    return { transform: [{ perspective: 900 }, { rotateY: `${flip.value}deg` }] };
  });

  const backStyle = useAnimatedStyle(() => {
    return { transform: [{ perspective: 900 }, { rotateY: `${flip.value + 180}deg` }] };
  });

  const progressStyle = useAnimatedStyle(() => {
    return { width: `${Math.round(demoProgress.value * 100)}%` };
  });

  const setProgress = (p: number) => {
    demoProgress.value = withTiming(p, { duration: 420 });
  };

  const toggleFlip = () => {
    const next = flip.value >= 90 ? 0 : 180;
    flip.value = withTiming(next, { duration: 520 });
  };

  return (
    <Animated.View style={[{ width: interval, paddingRight: 12 }, a]}>
      <Card style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <LexText variant="h2" style={{ fontSize: 22 }}>
            ✨ A quick taste
          </LexText>
          <Pressable onPress={onPressIndex} style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.7 : 1 }]} hitSlop={10}>
            <LexText variant="muted" style={{ color: t.colors.muted }}>
              {index + 1}/{count}
            </LexText>
          </Pressable>
        </View>

        <View style={{ marginTop: 10 }}>
          <LexText variant="muted">Tap the card to flip. Tap a rating to see how review adapts.</LexText>
        </View>

        <View style={{ marginTop: 14 }}>
          <Pressable
            onPress={() => {
              h.light();
              toggleFlip();
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
          >
            <View style={{ height: 140 }}>
              <Animated.View style={[styles.demoCard, { borderColor: t.colors.border, backgroundColor: t.colors.surface }, frontStyle]}>
                <LexText variant="muted">Word</LexText>
                <LexText variant="h2" style={{ fontSize: 34, marginTop: 6 }}>
                  ephemeral
                </LexText>
                <LexText variant="muted" style={{ marginTop: 8 }}>
                  Tap to reveal meaning
                </LexText>
              </Animated.View>
              <Animated.View
                style={[
                  styles.demoCard,
                  StyleSheet.absoluteFill,
                  { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' },
                  backStyle,
                ]}
              >
                <LexText variant="muted">Meaning</LexText>
                <LexText variant="title" style={{ marginTop: 8 }}>
                  Short-lived; lasting a very brief time.
                </LexText>
                <LexText variant="muted" style={{ marginTop: 10 }}>
                  “The opportunity was ephemeral.”
                </LexText>
              </Animated.View>
            </View>
          </Pressable>
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Again', color: t.colors.accentPink, p: 0.25 },
            { label: 'Hard', color: t.colors.accentPurple, p: 0.5 },
            { label: 'Easy', color: t.colors.accentTeal, p: 0.82 },
          ].map((x) => (
            <Pressable
              key={x.label}
              onPress={() => {
                h.selection();
                setProgress(x.p);
                if (x.label === 'Easy') h.success();
                if (x.label === 'Again') h.error();
              }}
              style={({ pressed }) => [
                styles.ratingChip,
                { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)', opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: x.color }} />
              <LexText variant="body" style={{ fontSize: 12 }}>
                {x.label}
              </LexText>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <LexText variant="title">Streak preview</LexText>
            <LexText variant="muted">🔥 3 days</LexText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: t.colors.accentTeal }, progressStyle]} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

export function WelcomeStep({ onNext, onSignIn }: { onNext: () => void; onSignIn: () => void }) {
  const t = useTheme();
  const h = useHaptics();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const slides = useMemo<Slide[]>(
    () => [
      {
        kind: 'feature',
        emoji: '🧠',
        title: 'Memory science, built-in',
        body: ['Spaced review that adapts to you', 'Quick ratings → smarter scheduling', 'See streaks and progress grow'],
      },
      {
        kind: 'feature',
        emoji: '🎮',
        title: 'Games that make it fun',
        body: ['Fast micro-games for recall', 'Multiple modes to prevent boredom', 'Practice feels like play'],
      },
      {
        kind: 'feature',
        emoji: '🤝',
        title: 'A coach in your pocket',
        body: ['Ask for examples, synonyms, quizzes', 'Learn nuance, not just definitions', 'Get help when you get stuck'],
      },
      { kind: 'demo', title: 'A quick taste' },
    ],
    []
  );

  const interval = Math.max(280, width - 72);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, idx));
    scrollRef.current?.scrollTo({ x: clamped * interval, animated: true });
    setActive(clamped);
    h.selection();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <WordParticles
        words={['Eloquent', 'Serendipity', 'Ephemeral', 'Lucid', 'Tenacious', 'Nuance', 'Vivid', 'Resolve']}
      />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(500).springify().damping(16)}>
          <View style={styles.headerRow}>
            <LexText variant="h1">Own Every{'\n'}Word You Say</LexText>
            <Pressable
              onPress={() => {
                h.light();
                onNext();
              }}
              style={({ pressed }) => [{ paddingVertical: 10, paddingHorizontal: 10, opacity: pressed ? 0.7 : 1 }]}
              hitSlop={10}
            >
              <LexText variant="muted" style={{ color: t.colors.accentTeal, fontFamily: t.font.body.medium }}>
                Skip
              </LexText>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(520).springify().damping(16)}>
          <LexText variant="muted" style={{ marginTop: 10, maxWidth: 360 }}>
            A cinematic vocabulary system built around memory science, beautiful motion, and playful practice.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(520).springify().damping(16)} style={{ marginTop: 16 }}>
          <Animated.ScrollView
            ref={(r: ScrollView | null) => {
              scrollRef.current = r;
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={interval}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 18 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / interval);
              if (idx !== active) {
                setActive(idx);
                h.selection();
              }
            }}
          >
            {slides.map((s, i) =>
              s.kind === 'demo' ? (
                <DemoSlideCard
                  key={`${s.kind}-${s.title}`}
                  index={i}
                  interval={interval}
                  scrollX={scrollX}
                  count={slides.length}
                  onPressIndex={() => goTo(i)}
                />
              ) : (
                <FeatureSlideCard
                  key={`${s.kind}-${s.title}`}
                  index={i}
                  interval={interval}
                  scrollX={scrollX}
                  count={slides.length}
                  emoji={s.emoji}
                  title={s.title}
                  body={s.body}
                  onPressIndex={() => goTo(i)}
                />
              )
            )}
          </Animated.ScrollView>
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ProgressDots total={slides.length} activeIndex={active} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(520).springify().damping(16)} style={{ marginTop: 18 }}>
          <Shimmer>
            <Button title="Get Started" onPress={onNext} />
          </Shimmer>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(520).springify().damping(16)} style={{ marginTop: 14 }}>
          <LexText variant="muted" style={{ textAlign: 'center' }}>
            Already have account?{' '}
            <LexText
              variant="body"
              style={{ color: t.colors.accentTeal, fontFamily: t.font.body.medium }}
              onPress={onSignIn}
            >
              Sign in
            </LexText>
          </LexText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  demoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    backfaceVisibility: 'hidden',
  },
  ratingChip: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
