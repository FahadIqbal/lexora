import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from './Screen';
import { LexText } from './LexText';
import { useTheme } from '../theme/ThemeProvider';

export function RouteFallback({ label = 'Preparing your adventure' }: { label?: string }) {
  const t = useTheme();

  return (
    <Screen>
      <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
        <LinearGradient
          colors={[t.colors.accentPurple, t.colors.accentBlue, t.colors.accentTeal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.orb, { shadowColor: t.colors.accentPurple }]}
        >
          <LexText variant="h2" style={styles.logo}>
            L
          </LexText>
        </LinearGradient>
        <ActivityIndicator size="small" color={t.colors.accentAmber} />
        <LexText variant="title" style={styles.label}>
          {label}
        </LexText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
  },
  label: {
    textAlign: 'center',
  },
});
