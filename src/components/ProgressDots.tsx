import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export function ProgressDots({ total, activeIndex }: { total: number; activeIndex: number }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} activeColor={t.colors.accentPurple} inactiveColor={t.colors.border} />
      ))}
    </View>
  );
}

function Dot({ active, activeColor, inactiveColor }: { active: boolean; activeColor: string; inactiveColor: string }) {
  const a = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(active ? 1.35 : 1, { damping: 18, stiffness: 180 }) }],
      backgroundColor: active ? activeColor : inactiveColor,
      opacity: active ? 1 : 0.8,
    };
  }, [active, activeColor, inactiveColor]);

  return <Animated.View style={[styles.dot, a]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});

