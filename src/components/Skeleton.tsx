import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export function Skeleton({ height = 14, radius = 10, style }: { height?: number; radius?: number; style?: ViewStyle }) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, []);

  const a = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 260 }],
    opacity: 0.9,
  }));

  return (
    <View
      style={[
        styles.base,
        {
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, a]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.10)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
});

