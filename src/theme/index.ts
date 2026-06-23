/** Bottom padding to add to scrollable screens so content clears the floating tab bar. */
export const TAB_BAR_BOTTOM = 110;

export const theme = {
  colors: {
    bg: '#080816',
    bgElevated: '#0B0B1E',
    surface: '#0E0E24',
    surface2: '#151530',
    surface3: '#1D1D40',
    surfaceGlass: 'rgba(255,255,255,0.055)',
    surfaceGlassStrong: 'rgba(255,255,255,0.085)',
    border: 'rgba(255,255,255,0.08)',
    borderBright: 'rgba(255,255,255,0.18)',
    text: '#F2F0FF',
    muted: 'rgba(242,240,255,0.5)',
    mutedStrong: 'rgba(242,240,255,0.68)',

    accentPurple: '#7B6FFF',
    accentPink: '#FF6B9D',
    accentTeal: '#00E5B8',
    accentAmber: '#FFB347',
    accentBlue: '#5BA8FF',

    // Glow overlays for shadow-like effects
    glowPurple: 'rgba(123,111,255,0.35)',
    glowTeal: 'rgba(0,229,184,0.35)',
    glowPink: 'rgba(255,107,157,0.35)',
    glowAmber: 'rgba(255,179,71,0.35)',
    shadow: 'rgba(0,0,0,0.42)',
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
