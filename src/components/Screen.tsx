import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
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
  return <Container style={[styles.base, { backgroundColor: t.colors.bg }, style]}>{children}</Container>;
}

const styles = StyleSheet.create({
  base: { flex: 1 },
});
