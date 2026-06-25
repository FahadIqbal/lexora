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
        colors={[t.colors.bgElevated, t.colors.bg, 'rgba(8,20,28,0.98)']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,216,167,0.09)', 'rgba(138,124,255,0.04)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topWash}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,200,87,0.035)', 'rgba(79,179,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomWash}
      />
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
    height: 260,
  },
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },
});
