import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { LexText } from '../../components/LexText';
import { ProgressDots } from '../../components/ProgressDots';
import { WelcomeStep } from './steps/WelcomeStep';
import { AuthStep } from './steps/AuthStep';
import { PlacementStep } from './steps/PlacementStep';
import { GoalsStep } from './steps/GoalsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { useAppStore } from '../../store/useAppStore';
import { Haptics, hapticImpact, hapticNotify } from '../../utils/haptics';

const TOTAL = 5;
const STEP_LABELS = ['Welcome', 'Account', 'Level', 'Goal', 'Topics'] as const;

export function OnboardingFlow() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signup');
  const translateX = useSharedValue(0);

  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setStep(clamped);
    translateX.value = withTiming(-clamped * width, { duration: 420 });
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    translateX.value = -step * width;
  }, [step, width]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => {
    const p = interpolate(step, [0, TOTAL - 1], [0.12, 1]);
    return { width: `${Math.round(p * 100)}%` };
  }, [step]);

  const steps = [
    <WelcomeStep
      key="welcome"
      onNext={() => {
        setAuthInitialMode('signup');
        go(1);
      }}
      onSignIn={() => {
        setAuthInitialMode('signin');
        go(1);
      }}
    />,
    <AuthStep
      key="auth"
      initialMode={authInitialMode}
      onBack={() => go(0)}
      onNext={({ mode }) => {
        if (mode === 'signin') {
          setOnboardingCompleted(true);
          hapticNotify(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/(tabs)/home'), 180);
          return;
        }
        go(2);
      }}
    />,
    <PlacementStep key="placement" onBack={() => go(1)} onNext={() => go(3)} />,
    <GoalsStep key="goals" onBack={() => go(2)} onNext={() => go(4)} />,
    <CategoriesStep
      key="categories"
      onBack={() => go(3)}
      onFinish={() => {
        setOnboardingCompleted(true);
        hapticNotify(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.replace('/(tabs)/home'), 240);
      }}
    />,
  ];

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.stepMeta}>
          <View>
            <LexText variant="label" style={{ color: t.colors.accentTeal }}>
              Setup
            </LexText>
            <LexText variant="title" style={{ marginTop: 2 }}>
              {STEP_LABELS[step]}
            </LexText>
          </View>
          <View style={[styles.stepPill, { borderColor: t.colors.border }]}>
            <LexText variant="label" style={{ color: t.colors.text, fontSize: 10 }}>
              {step + 1}/{TOTAL}
            </LexText>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: t.colors.accentPurple }, progressBarStyle]} />
        </View>
        <ProgressDots total={TOTAL} activeIndex={step} />
      </Animated.View>

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View style={[styles.row, { width: width * TOTAL }, containerStyle]}>
          {steps.map((node, i) => (
            <View key={i} style={{ width }}>
              {node}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 10,
  },
  stepMeta: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepPill: {
    minWidth: 54,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
