import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export function Shimmer({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const a = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 240 }],
    opacity: 0.55,
  }));

  return (
    <View style={[styles.wrap, style]}>
      {children}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, a]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
});

