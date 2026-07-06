import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { LexText } from '../../../components/LexText';

export function FloatingLabelInput({ label, value, onFocus, onBlur, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  const inputRef = React.useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const p = useSharedValue(0);

  useEffect(() => {
    const active = focused || Boolean(value?.length);
    p.value = withTiming(active ? 1 : 0, { duration: 160 });
  }, [focused, value]);

  const labelStyle = useAnimatedStyle(() => {
    const y = interpolate(p.value, [0, 1], [0, -20]);
    const s = interpolate(p.value, [0, 1], [1, 0.82]);
    return {
      transform: [{ translateY: y }, { scale: s }],
      opacity: interpolate(p.value, [0, 1], [0.7, 1]),
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.wrap,
        {
          borderColor: focused ? t.colors.accentTeal : t.colors.border,
          backgroundColor: focused ? 'rgba(0,229,184,0.06)' : 'rgba(255,255,255,0.035)',
        },
      ]}
    >
      <Animated.View style={[styles.label, labelStyle]}>
        <LexText
          variant="muted"
          numberOfLines={1}
          style={{
            fontSize: 12,
            color: focused ? t.colors.accentTeal : t.colors.mutedStrong,
            backgroundColor: t.colors.bg,
            paddingHorizontal: 4,
          }}
        >
          {label}
        </LexText>
      </Animated.View>

      <TextInput
        {...props}
        ref={inputRef}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholder=""
        placeholderTextColor={t.colors.muted}
        style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 58,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  label: {
    position: 'absolute',
    left: 12,
    top: 19,
    zIndex: 2,
  },
  input: {
    height: 38,
    fontSize: 15,
    padding: 0,
    paddingTop: 8,
  },
});
