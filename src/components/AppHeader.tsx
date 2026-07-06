import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LexText } from './LexText';
import { IconSymbol } from './IconSymbol';
import { useTheme } from '../theme/ThemeProvider';

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  fallback,
  accent,
  metric,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  fallback?: string;
  accent?: string;
  metric?: string;
}) {
  const t = useTheme();
  const color = accent ?? t.colors.accentTeal;

  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <LexText variant="label" style={{ color }}>
            {eyebrow}
          </LexText>
        ) : null}
        <LexText variant="h2" style={{ marginTop: eyebrow ? 4 : 0 }}>
          {title}
        </LexText>
        {subtitle ? (
          <LexText variant="muted" style={{ marginTop: 6 }}>
            {subtitle}
          </LexText>
        ) : null}
      </View>
      {icon ? (
        <LinearGradient
          colors={[`${color}38`, 'rgba(255,255,255,0.07)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glyph, { borderColor: `${color}55` }]}
        >
          <IconSymbol name={icon} fallback={fallback ?? ''} color={color} size={20} />
          {metric ? (
            <LexText variant="label" numberOfLines={1} style={{ color, fontSize: 8, marginTop: 2 }}>
              {metric}
            </LexText>
          ) : null}
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  glyph: {
    width: 54,
    height: 54,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
