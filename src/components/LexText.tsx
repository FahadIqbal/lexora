import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'muted'
  | 'label'
  | 'mono';

export function LexText({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const t = useTheme();

  const base = (() => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: t.font.heading.extrabold,
          fontSize: 42,
          lineHeight: 46,
          letterSpacing: -0.8,
          color: t.colors.text,
        };
      case 'h2':
        return {
          fontFamily: t.font.heading.bold,
          fontSize: 30,
          lineHeight: 34,
          letterSpacing: -0.4,
          color: t.colors.text,
        };
      case 'h3':
        return {
          fontFamily: t.font.heading.semibold,
          fontSize: 22,
          lineHeight: 26,
          letterSpacing: -0.2,
          color: t.colors.text,
        };
      case 'title':
        return {
          fontFamily: t.font.body.medium,
          fontSize: 16,
          lineHeight: 20,
          letterSpacing: -0.1,
          color: t.colors.text,
        };
      case 'label':
        return {
          fontFamily: t.font.body.medium,
          fontSize: 12,
          letterSpacing: 0.9,
          textTransform: 'uppercase' as const,
          color: t.colors.muted,
        };
      case 'muted':
        return { fontFamily: t.font.body.regular, fontSize: 15, lineHeight: 22, color: t.colors.muted };
      case 'mono':
        return { fontFamily: undefined, fontSize: 12, lineHeight: 16, color: t.colors.text };
      case 'body':
      default:
        return { fontFamily: t.font.body.regular, fontSize: 15, lineHeight: 22, color: t.colors.text };
    }
  })();

  return <Text {...props} style={[base, style]} />;
}
