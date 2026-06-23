import React from 'react';
import { Pressable, StyleSheet, type ViewStyle, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { LexText } from './LexText';
import { hapticSelection } from '../utils/haptics';

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
        if (!disabled) hapticSelection();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && { boxShadow: `0 14px 30px ${t.colors.glowTeal}` },
        variant === 'ghost' && { backgroundColor: t.colors.surfaceGlassStrong, borderColor: t.colors.borderBright },
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
    height: 52,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
