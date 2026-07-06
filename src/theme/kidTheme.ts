export const kidTheme = {
  colors: {
    appBg: '#F7FBFF',
    paper: '#FFFFFF',
    ink: '#22234A',
    muted: '#6F7392',
    purple: '#8174F2',
    purpleDeep: '#4A38C9',
    blue: '#55B7FF',
    sky: '#DDF2FF',
    yellow: '#FFD93D',
    yellowSoft: '#FFF3B4',
    coral: '#FF7A7A',
    coralSoft: '#FFE2DF',
    mint: '#51D9A8',
    mintSoft: '#DCFBEF',
    lilac: '#EEEAFE',
    line: 'rgba(34,35,74,0.10)',
    shadow: 'rgba(71,57,146,0.16)',
    success: '#24B76E',
    danger: '#F05B62',
  },
  radius: {
    sm: 16,
    md: 22,
    lg: 30,
    xl: 38,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
  },
} as const;

export type KidTheme = typeof kidTheme;
