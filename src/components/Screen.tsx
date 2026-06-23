import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export function Screen({
  children,
  style,
  safe = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  safe?: boolean;
}) {
  const t = useTheme();
  const Container: any = safe ? SafeAreaView : View;
  return (
    <Container style={[styles.base, { backgroundColor: t.colors.bg }, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={[t.colors.bgElevated, t.colors.bg, 'rgba(13,18,42,0.98)']}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.topWash, { backgroundColor: 'rgba(123,111,255,0.045)' }]} />
      <View pointerEvents="none" style={[styles.bottomWash, { backgroundColor: 'rgba(0,229,184,0.035)' }]} />
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1, overflow: 'hidden' },
  topWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 220,
  },
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
});
