import React from 'react';
import { Pressable, StyleSheet, type ViewStyle, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { LexText } from './LexText';

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled,
  ...props
}: PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
}) {
  const t = useTheme();

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(e) => {
        if (!disabled && process.env.EXPO_OS !== 'web') {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' && { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: t.colors.border },
        pressed && !disabled ? { transform: [{ scale: 0.96 }] } : null,
        disabled ? { opacity: 0.5 } : null,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[t.colors.accentPurple, t.colors.accentTeal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <LexText
        variant="title"
        style={{
          color: variant === 'primary' ? 'white' : t.colors.text,
          fontFamily: t.font.heading.bold,
          textAlign: 'center',
        }}
      >
        {title}
      </LexText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
