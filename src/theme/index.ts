export const theme = {
  colors: {
    bg: '#0A0A12',
    surface: '#111120',
    surface2: '#171728',
    border: 'rgba(255,255,255,0.07)',
    text: '#F0EEFF',
    muted: 'rgba(240,238,255,0.45)',

    accentPurple: '#6C63FF',
    accentPink: '#FF6B9D',
    accentTeal: '#00D4AA',
    accentAmber: '#FFB347',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 48,
  },
  radius: {
    1: 8,
    2: 12,
    3: 16,
    4: 20,
    5: 28,
  },
  font: {
    heading: {
      regular: 'Syne_400Regular',
      medium: 'Syne_500Medium',
      semibold: 'Syne_600SemiBold',
      bold: 'Syne_700Bold',
      extrabold: 'Syne_800ExtraBold',
    },
    body: {
      light: 'DMSans_300Light',
      regular: 'DMSans_400Regular',
      medium: 'DMSans_500Medium',
      italicLight: 'DMSans_300Light_Italic',
    },
  },
} as const;

export type Theme = typeof theme;

