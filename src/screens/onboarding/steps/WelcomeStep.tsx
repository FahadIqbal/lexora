import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeProvider';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { LexoraLottie } from '../../../components/LexoraLottie';
import { Shimmer } from '../ui/Shimmer';
import { Haptics, hapticImpact, hapticSelection } from '../../../utils/haptics';
import wordQuestOrbit from '../../../animations/word-quest-orbit.json';

const LOOP = [
  { label: 'Learn', body: '3 fresh words', color: 'teal' },
  { label: 'Review', body: 'Smart recall', color: 'purple' },
  { label: 'Play', body: 'Earn XP', color: 'amber' },
] as const;

const FEATURES = [
  { title: 'Tiny daily sessions', body: 'A first win in under five minutes.' },
  { title: 'Memory that adapts', body: 'Reviews change as your confidence grows.' },
  { title: 'Playful progress', body: 'Streaks, XP, and games keep practice alive.' },
] as const;

export function WelcomeStep({ onNext, onSignIn }: { onNext: () => void; onSignIn: () => void }) {
  const t = useTheme();

  const next = () => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).springify().damping(16)} style={styles.topRow}>
          <View style={[styles.brandMark, { borderColor: t.colors.borderBright }]}>
            <LinearGradient
              colors={[t.colors.accentPurple, t.colors.accentTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LexText variant="title" style={{ color: 'white', fontFamily: t.font.heading.bold }}>
              L
            </LexText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            onPress={next}
            hitSlop={10}
            style={({ pressed }) => [styles.skipButton, { opacity: pressed ? 0.65 : 1 }]}
          >
            <LexText variant="title" style={{ color: t.colors.accentTeal, fontSize: 14 }}>
              Skip
            </LexText>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(520).springify().damping(16)}>
          <LexText variant="label" style={{ color: t.colors.accentTeal }}>
            Lexora
          </LexText>
          <LexText variant="h1" style={styles.headline}>
            Play your way to sharper words.
          </LexText>
          <LexText variant="muted" style={styles.subhead}>
            Learn sharper words through quick games, smart review, and a daily loop that feels easy to return to.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(130).duration(540).springify().damping(16)} style={styles.hero}>
          <LinearGradient
            colors={['rgba(123,111,255,0.28)', 'rgba(0,229,184,0.12)', 'rgba(255,179,71,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroHeader}>
            <View>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Today's first win
              </LexText>
              <LexText variant="h2" style={{ marginTop: 4, fontSize: 27 }}>
                4-minute word quest
              </LexText>
            </View>
            <View style={[styles.xpBadge, { borderColor: t.colors.borderBright }]}>
              <LexText variant="title" style={{ fontSize: 14 }}>
                +80 XP
              </LexText>
            </View>
          </View>

          <View style={styles.animationStage}>
            <LexoraLottie source={wordQuestOrbit} size={188} speed={0.88} style={styles.questLottie} />
            <View style={[styles.floatingChip, styles.floatingChipLeft, { borderColor: 'rgba(0,229,184,0.24)' }]}>
              <LexText variant="label" style={{ color: t.colors.accentTeal, fontSize: 9 }}>
                Learn
              </LexText>
            </View>
            <View style={[styles.floatingChip, styles.floatingChipRight, { borderColor: 'rgba(255,179,71,0.28)' }]}>
              <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 9 }}>
                +XP
              </LexText>
            </View>
          </View>

          <View style={styles.wordCard}>
            <LexText variant="label" style={{ color: t.colors.muted }}>
              Word card
            </LexText>
            <LexText variant="h2" style={{ marginTop: 6 }}>
              ephemeral
            </LexText>
            <LexText variant="body" style={{ marginTop: 8, color: 'rgba(242,240,255,0.78)' }}>
              Short-lived; lasting for a very brief time.
            </LexText>
            <View style={styles.choiceRow}>
              {['Again', 'Hard', 'Easy'].map((label, index) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`Preview ${label} rating`}
                  onPress={() => hapticSelection()}
                  style={({ pressed }) => [
                    styles.ratingChip,
                    {
                      borderColor: index === 2 ? t.colors.accentTeal : t.colors.border,
                      backgroundColor: index === 2 ? 'rgba(0,229,184,0.16)' : 'rgba(255,255,255,0.07)',
                      opacity: pressed ? 0.78 : 1,
                    },
                  ]}
                >
                  <LexText variant="title" style={{ fontSize: 12 }}>
                    {label}
                  </LexText>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(520)} style={styles.loopGrid}>
          {LOOP.map((item, index) => {
            const color =
              item.color === 'teal' ? t.colors.accentTeal : item.color === 'purple' ? t.colors.accentPurple : t.colors.accentAmber;
            return (
              <View key={item.label} style={[styles.loopStep, { borderColor: index === 0 ? color : t.colors.border }]}>
                <View style={[styles.loopDot, { backgroundColor: color }]} />
                <LexText variant="title" style={{ marginTop: 10 }}>
                  {item.label}
                </LexText>
                <LexText variant="muted" style={{ fontSize: 12, lineHeight: 17, marginTop: 2 }}>
                  {item.body}
                </LexText>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(520)} style={styles.featureStack}>
          {FEATURES.map((item) => (
            <View key={item.title} style={[styles.featureRow, { borderColor: t.colors.border }]}>
              <View style={[styles.check, { backgroundColor: 'rgba(0,229,184,0.16)' }]}>
                <LexText variant="title" style={{ color: t.colors.accentTeal, fontSize: 13 }}>
                  ✓
                </LexText>
              </View>
              <View style={{ flex: 1 }}>
                <LexText variant="title">{item.title}</LexText>
                <LexText variant="muted" style={{ fontSize: 13, lineHeight: 18, marginTop: 2 }}>
                  {item.body}
                </LexText>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(520)} style={styles.actions}>
          <Shimmer>
            <Button title="Start my first quest" onPress={next} />
          </Shimmer>
          <LexText variant="muted" style={{ textAlign: 'center' }}>
            Already learning with Lexora?{' '}
            <LexText
              variant="body"
              style={{ color: t.colors.accentTeal, fontFamily: t.font.body.medium }}
              onPress={onSignIn}
            >
              Sign in
            </LexText>
          </LexText>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: 18,
    paddingBottom: 34,
    gap: 18,
  },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headline: {
    marginTop: 8,
    fontSize: 29,
    lineHeight: 33,
  },
  subhead: {
    marginTop: 10,
    maxWidth: 390,
  },
  hero: {
    borderRadius: 26,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  animationStage: {
    minHeight: 168,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  questLottie: {
    opacity: 0.98,
  },
  floatingChip: {
    position: 'absolute',
    minWidth: 62,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(8,8,22,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingChipLeft: {
    left: 12,
    top: 28,
  },
  floatingChipRight: {
    right: 10,
    bottom: 24,
  },
  xpBadge: {
    minWidth: 70,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  wordCard: {
    marginTop: 18,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(8,8,22,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  ratingChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  loopGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  loopStep: {
    flex: 1,
    minHeight: 96,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.045)',
    padding: 12,
  },
  loopDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  featureStack: {
    gap: 10,
  },
  featureRow: {
    minHeight: 72,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.045)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 14,
  },
});
