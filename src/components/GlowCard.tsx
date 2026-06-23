import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface GlowCardProps {
  children: React.ReactNode;
  colors?: [string, string];
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  borderWidth?: number;
  radius?: number;
}

export function GlowCard({
  children,
  colors,
  style,
  innerStyle,
  borderWidth = 1.5,
  radius = 20,
}: GlowCardProps) {
  const t = useTheme();
  const borderColors: [string, string] = colors ?? [
    'rgba(123,111,255,0.65)',
    'rgba(0,229,184,0.45)',
  ];

  return (
    <LinearGradient
      colors={borderColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, padding: borderWidth }, style]}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor: t.colors.surfaceGlassStrong,
            borderRadius: radius - 2,
            boxShadow: `0 18px 38px ${t.colors.shadow}`,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 16,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
});
