import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import type { AnimationObject } from 'lottie-react-native';

export function LexoraLottie({
  source,
  size = 160,
  speed = 1,
  style,
}: {
  source: AnimationObject;
  size?: number;
  speed?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, { width: size, height: size }, style]}
    >
      <LottieView autoPlay loop source={source} speed={speed} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
