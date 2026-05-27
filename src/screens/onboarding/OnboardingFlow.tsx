import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { ProgressDots } from '../../components/ProgressDots';
import { WelcomeStep } from './steps/WelcomeStep';
import { AuthStep } from './steps/AuthStep';
import { PlacementStep } from './steps/PlacementStep';
import { GoalsStep } from './steps/GoalsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { useAppStore } from '../../store/useAppStore';

const TOTAL = 5;

export function OnboardingFlow() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signup');
  const translateX = useSharedValue(0);

  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setStep(clamped);
    translateX.value = withTiming(-clamped * width, { duration: 420 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null);
    }
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
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
          }
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
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
        }
        setTimeout(() => router.replace('/(tabs)/home'), 240);
      }}
    />,
  ];

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.top}>
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
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 10,
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
