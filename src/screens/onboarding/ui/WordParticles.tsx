import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';

export function WordParticles({ words }: { words: string[] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Particle key={i} word={words[i % words.length]} seed={i} />
      ))}
    </View>
  );
}

function Particle({ word, seed }: { word: string; seed: number }) {
  const t = useTheme();
  const left = ((seed * 73) % 100) / 100;
  const delay = (seed * 140) % 1200;
  const size = 12 + ((seed * 17) % 7);
  const startTop = ((seed * 19) % 80) / 100;

  const y = useSharedValue(0);
  const o = useSharedValue(0);

  const duration = 4200 + ((seed * 311) % 1600);

  useEffect(() => {
    // float up and fade
    y.value = withDelay(
      delay,
      withRepeat(withTiming(-48 - (seed % 5) * 10, { duration, easing: Easing.out(Easing.quad) }), -1, false)
    );
    o.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }), -1, true)
    );
  }, [delay, duration]);

  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: 0.25 + 0.35 * o.value,
  }));

  return (
    <Animated.View
      style={[
        styles.p,
        a,
        {
          left: `${left * 84 + 6}%`,
          top: `${startTop * 84 + 6}%`,
        },
      ]}
    >
      <Text
        style={{
          color: t.colors.muted,
          fontSize: size,
          fontFamily: t.font.body.italicLight,
          letterSpacing: 0.4,
        }}
      >
        {word}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  p: {
    position: 'absolute',
    transform: [{ translateY: -8 }],
  },
});
