import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeProvider';
import { LexText } from '../../../components/LexText';

export function FloatingLabelInput({ label, value, onFocus, onBlur, ...props }: TextInputProps & { label: string }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const p = useSharedValue(0);

  useEffect(() => {
    const active = focused || Boolean(value?.length);
    p.value = withTiming(active ? 1 : 0, { duration: 160 });
  }, [focused, value]);

  const labelStyle = useAnimatedStyle(() => {
    const y = interpolate(p.value, [0, 1], [0, -18]);
    const s = interpolate(p.value, [0, 1], [1, 0.86]);
    return {
      transform: [{ translateY: y }, { scale: s }],
      opacity: interpolate(p.value, [0, 1], [0.7, 1]),
    };
  });

  return (
    <View style={[styles.wrap, { borderColor: focused ? t.colors.accentTeal : t.colors.border }]}>
      <Animated.View style={[styles.label, labelStyle]}>
        <LexText variant="muted" style={{ fontSize: 12, color: focused ? t.colors.accentTeal : t.colors.muted }}>
          {label}
        </LexText>
      </Animated.View>

      <TextInput
        {...props}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholder={focused ? '' : label}
        placeholderTextColor={t.colors.muted}
        style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 54,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  label: {
    position: 'absolute',
    left: 14,
    top: 16,
  },
  input: {
    height: 54,
    fontSize: 15,
  },
});

