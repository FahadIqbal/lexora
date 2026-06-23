import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { LexText } from '../../components/LexText';
import { ProgressDots } from '../../components/ProgressDots';
import { IconSymbol } from '../../components/IconSymbol';
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
  const dragStartX = useSharedValue(0);
  const stepSV = useSharedValue(0);

  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    const changed = clamped !== step;
    stepSV.value = clamped;
    setStep(clamped);
    translateX.value = withTiming(-clamped * width, { duration: 320, easing: Easing.out(Easing.cubic) });
    if (changed) hapticImpact(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    stepSV.value = step;
    translateX.value = withTiming(-step * width, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [step, width]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => {
    const maxOffset = Math.max(1, width * (TOTAL - 1));
    const draggedProgress = Math.min(1, Math.max(0, Math.abs(translateX.value) / maxOffset));
    const p = 0.12 + draggedProgress * 0.88;
    return { width: `${Math.round(p * 100)}%` };
  });

  const swipeHint =
    step === 1
      ? 'Finish account to continue'
      : step === TOTAL - 1
        ? 'Pick topics to finish'
        : step === 0
          ? 'Swipe left'
          : 'Swipe left or right';

  const panGesture = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-18, 18])
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      const currentStep = stepSV.value;
      const canSwipeBack = currentStep > 0;
      const canSwipeForward = currentStep < TOTAL - 1 && currentStep !== 1;
      const dampedTranslation =
        (!canSwipeForward && event.translationX < 0) || (!canSwipeBack && event.translationX > 0)
          ? event.translationX * 0.18
          : event.translationX;
      const minX = -width * (TOTAL - 1);
      const nextX = dragStartX.value + dampedTranslation;
      translateX.value = Math.max(minX, Math.min(0, nextX));
    })
    .onEnd((event) => {
      const currentStep = stepSV.value;
      const canSwipeBack = currentStep > 0;
      const canSwipeForward = currentStep < TOTAL - 1 && currentStep !== 1;
      const threshold = Math.max(52, width * 0.18);
      let target = currentStep;

      if (canSwipeForward && (event.translationX < -threshold || event.velocityX < -720)) {
        target = currentStep + 1;
      } else if (canSwipeBack && (event.translationX > threshold || event.velocityX > 720)) {
        target = currentStep - 1;
      }

      runOnJS(go)(target);
    });

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
        <View style={styles.progressFooter}>
          <ProgressDots total={TOTAL} activeIndex={step} />
          <View style={[styles.swipePill, { borderColor: t.colors.border, backgroundColor: t.colors.surfaceGlass }]}>
            <IconSymbol name="arrow.left.arrow.right" fallback="<>" color={step === 1 || step === TOTAL - 1 ? t.colors.muted : t.colors.accentTeal} size={13} />
            <LexText variant="label" numberOfLines={1} style={{ color: step === 1 || step === TOTAL - 1 ? t.colors.muted : t.colors.accentTeal, fontSize: 9 }}>
              {swipeHint}
            </LexText>
          </View>
        </View>
      </Animated.View>

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.row, { width: width * TOTAL }, containerStyle]}>
            {steps.map((node, i) => (
              <View key={i} style={{ width }}>
                {node}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
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
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  swipePill: {
    minHeight: 30,
    maxWidth: 190,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
