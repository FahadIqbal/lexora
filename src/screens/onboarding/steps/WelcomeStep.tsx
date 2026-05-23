import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { WordParticles } from '../ui/WordParticles';
import { Shimmer } from '../ui/Shimmer';

export function WelcomeStep({ onNext, onSignIn }: { onNext: () => void; onSignIn: () => void }) {
  const t = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <WordParticles
        words={['Eloquent', 'Serendipity', 'Ephemeral', 'Lucid', 'Tenacious', 'Nuance', 'Vivid', 'Resolve']}
      />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(500).springify().damping(16)}>
          <LexText variant="h1">Own Every{'\n'}Word You Say</LexText>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(90).duration(520).springify().damping(16)}>
          <LexText variant="muted" style={{ marginTop: 10, maxWidth: 340 }}>
            A cinematic vocabulary system built around memory science, beautiful motion, and playful practice.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(520).springify().damping(16)} style={{ marginTop: 18 }}>
          <Shimmer>
            <Button title="Get Started" onPress={onNext} />
          </Shimmer>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(520).springify().damping(16)} style={{ marginTop: 14 }}>
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
});

