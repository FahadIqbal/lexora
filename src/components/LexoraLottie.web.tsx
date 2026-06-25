import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

export function LexoraLottie({
  size = 160,
  style,
}: {
  source: unknown;
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
      <View style={styles.webFallback}>
        <View style={styles.webRing} />
        <View style={styles.webCore} />
        <View style={[styles.webSpark, styles.webSparkTop]} />
        <View style={[styles.webSpark, styles.webSparkBottom]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFallback: {
    width: '82%',
    height: '82%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,229,184,0.24)',
    backgroundColor: 'rgba(123,111,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  webRing: {
    position: 'absolute',
    width: '68%',
    height: '68%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  webCore: {
    width: '34%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,229,184,0.34)',
  },
  webSpark: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,179,71,0.72)',
  },
  webSparkTop: {
    top: '22%',
    right: '25%',
  },
  webSparkBottom: {
    bottom: '24%',
    left: '25%',
    backgroundColor: 'rgba(255,107,157,0.62)',
  },
});
