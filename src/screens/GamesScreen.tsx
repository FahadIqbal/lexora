import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { GlowCard } from '../components/GlowCard';
import { useTheme } from '../theme/ThemeProvider';
import { gameList } from './games/gamesData';
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticImpact } from '../utils/haptics';

export function GamesScreen() {
  const t = useTheme();

  const featured = gameList.find((g) => g.featured) ?? gameList[0];
  const rest = gameList.filter((g) => !g.featured);

  const goToGame = (slug: string) => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/games/${slug}`);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.wrap, { paddingBottom: TAB_BAR_BOTTOM }]}
        showsVerticalScrollIndicator={false}
      >
        <LexText variant="h2">Word Games</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Addictive drills that lock words into memory.
        </LexText>

        {/* ── Featured Game ─────────────────────────────────── */}
        <Pressable
          onPress={() => goToGame(featured.slug)}
          style={({ pressed }) => ({ marginTop: 18, opacity: pressed ? 0.92 : 1 })}
        >
          <LinearGradient
            colors={featured.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 22 }]} />
            <View style={styles.featuredBadge}>
              <LexText variant="label" style={{ color: 'white', fontSize: 10 }}>⭐ FEATURED</LexText>
            </View>
            <LexText style={{ fontSize: 52, marginTop: 10 }}>{featured.icon}</LexText>
            <LexText variant="h2" style={{ color: 'white', marginTop: 10 }}>
              {featured.title}
            </LexText>
            <LexText style={{ color: 'rgba(255,255,255,0.78)', marginTop: 6, fontSize: 14 }}>
              {featured.subtitle}
            </LexText>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'center' }}>
              <DifficultyPips level={featured.difficulty} />
              <View style={styles.xpTag}>
                <LexText variant="label" style={{ color: 'white', fontSize: 10 }}>
                  +{featured.xpReward} XP
                </LexText>
              </View>
            </View>
            <View style={[styles.playBtn]}>
              <LexText variant="title" style={{ color: 'white', fontFamily: 'Syne_700Bold' }}>
                Play now →
              </LexText>
            </View>
          </LinearGradient>
        </Pressable>

        {/* ── Game Grid ─────────────────────────────────────── */}
        <LexText variant="label" style={{ color: t.colors.muted, marginTop: 20 }}>
          ALL GAMES
        </LexText>

        <View style={[styles.grid, { marginTop: 10 }]}>
          {rest.map((g) => (
            <Pressable
              key={g.slug}
              onPress={() => goToGame(g.slug)}
              style={({ pressed }) => [
                styles.gameCard,
                {
                  backgroundColor: t.colors.surface,
                  borderColor: t.colors.border,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={[`${g.colors[0]}28`, `${g.colors[1]}14`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.gameIconBg, { backgroundColor: `${g.colors[0]}22`, borderColor: `${g.colors[0]}44` }]}>
                <LexText style={{ fontSize: 24 }}>{g.icon}</LexText>
              </View>
              <LexText variant="title" style={{ marginTop: 10, fontSize: 14 }}>
                {g.title}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 4, fontSize: 12, lineHeight: 16 }}>
                {g.subtitle}
              </LexText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <DifficultyPips level={g.difficulty} color={g.colors[0]} />
                <LexText variant="label" style={{ fontSize: 10, color: g.colors[0] }}>
                  +{g.xpReward} XP
                </LexText>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Tip ───────────────────────────────────────────── */}
        <GlowCard
          colors={['rgba(255,179,71,0.45)', 'rgba(255,107,157,0.3)']}
          style={{ marginTop: 14 }}
        >
          <LexText variant="label" style={{ color: t.colors.accentAmber }}>💡 PRO TIP</LexText>
          <LexText variant="muted" style={{ marginTop: 8, fontSize: 14 }}>
            Play games immediately after Learn Mode for a 40% retention boost. Your brain is primed!
          </LexText>
        </GlowCard>
      </ScrollView>
    </Screen>
  );
}

function DifficultyPips({ level, color }: { level: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor:
              i <= level
                ? (color ?? 'rgba(255,255,255,0.8)')
                : 'rgba(255,255,255,0.18)',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  featuredCard: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  gameIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
