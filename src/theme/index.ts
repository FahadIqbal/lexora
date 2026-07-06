/** Bottom padding for scrollable content above native tabs and bottom controls. */
export const TAB_BAR_BOTTOM = 34;

export const theme = {
  colors: {
    bg: '#070A12',
    bgElevated: '#0B1020',
    surface: '#101827',
    surface2: '#162033',
    surface3: '#202B41',
    surfaceGlass: 'rgba(255,255,255,0.06)',
    surfaceGlassStrong: 'rgba(255,255,255,0.095)',
    border: 'rgba(255,255,255,0.10)',
    borderBright: 'rgba(255,255,255,0.20)',
    text: '#F7F4EC',
    muted: 'rgba(247,244,236,0.52)',
    mutedStrong: 'rgba(247,244,236,0.72)',

    accentPurple: '#8A7CFF',
    accentPink: '#FF5D8F',
    accentTeal: '#00D8A7',
    accentAmber: '#FFC857',
    accentBlue: '#4FB3FF',

    // Glow overlays for shadow-like effects
    glowPurple: 'rgba(138,124,255,0.32)',
    glowTeal: 'rgba(0,216,167,0.30)',
    glowPink: 'rgba(255,93,143,0.28)',
    glowAmber: 'rgba(255,200,87,0.28)',
    shadow: 'rgba(0,0,0,0.48)',
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
    6: 36,
  },
  font: {
    heading: {
      regular: 'DMSans_400Regular',
      medium: 'DMSans_500Medium',
      semibold: 'DMSans_600SemiBold',
      bold: 'DMSans_700Bold',
      extrabold: 'DMSans_800ExtraBold',
    },
    body: {
      light: 'DMSans_300Light',
      regular: 'DMSans_400Regular',
      medium: 'DMSans_500Medium',
      semibold: 'DMSans_600SemiBold',
      bold: 'DMSans_700Bold',
      extrabold: 'DMSans_800ExtraBold',
      italicLight: 'DMSans_300Light_Italic',
    },
  },
} as const;

export type Theme = typeof theme;
