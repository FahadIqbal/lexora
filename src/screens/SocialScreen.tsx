import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { IconSymbol } from '../components/IconSymbol';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeProvider';
import { TAB_BAR_BOTTOM } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { hapticSelection } from '../utils/haptics';

export function SocialScreen() {
  const t = useTheme();
  const xpTotal = useAppStore((s) => s.xpTotal);
  const streak = useAppStore((s) => s.streakCurrent);
  const [tab, setTab] = useState<'league' | 'friends'>('league');
  const [q, setQ] = useState('');

  const league = useMemo(
    () => [
      { rank: 1, name: 'SarahM', xp: 2840, avatar: 'S', tone: 'purple' },
      { rank: 2, name: 'Ahmed_K', xp: 2411, avatar: 'A', tone: 'teal' },
      { rank: 3, name: 'You', xp: Math.max(1840, xpTotal), avatar: 'Y', tone: 'you' },
      { rank: 4, name: 'Priya_L', xp: 1520, avatar: 'P', tone: 'pink' },
      { rank: 5, name: 'Kenji', xp: 1310, avatar: 'K', tone: 'blue' },
      { rank: 6, name: 'Marta', xp: 990, avatar: 'M', tone: 'amber' },
    ],
    [xpTotal]
  );

  const friends = useMemo(
    () => [
      { name: 'SarahM', streak: 47, xp: 2840, challenge: 'Speed Match' },
      { name: 'Priya_L', streak: 18, xp: 1520, challenge: 'Fill Sprint' },
      { name: 'Kenji', streak: 9, xp: 1310, challenge: 'Word Chain' },
    ],
    []
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(qq));
  }, [q, friends]);

  const you = league.find((p) => p.name === 'You') ?? league[2];
  const next = league.find((p) => p.rank === Math.max(1, you.rank - 1));
  const gap = next ? Math.max(0, next.xp - you.xp) : 0;

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.wrap, { paddingBottom: TAB_BAR_BOTTOM }]} showsVerticalScrollIndicator={false}>
        <AppHeader
          eyebrow="Community"
          title="League"
          subtitle="Compete weekly, challenge friends, and protect your streak."
          icon="person.2.fill"
          fallback="L"
          accent={t.colors.accentPurple}
          metric={`#${you.rank}`}
        />

        <LinearGradient
          colors={['rgba(123,111,255,0.34)', 'rgba(0,229,184,0.18)', 'rgba(255,179,71,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.22)' }]} />
          <View style={styles.heroTop}>
            <View>
              <View style={styles.leagueLabel}>
                <IconSymbol name="shield.lefthalf.filled" fallback="B" color="#A89CFF" size={14} />
                <LexText variant="label" style={{ color: '#A89CFF' }}>
                  Bronze league
                </LexText>
              </View>
              <LexText variant="h2" style={{ marginTop: 5 }}>
                Rank #{you.rank}
              </LexText>
            </View>
            <View style={[styles.rankBadge, { borderColor: 'rgba(255,179,71,0.35)', backgroundColor: 'rgba(255,179,71,0.12)' }]}>
              <IconSymbol name="flame.fill" fallback="F" color={t.colors.accentAmber} size={13} />
              <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 10 }}>
                {streak || 0}
              </LexText>
            </View>
          </View>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            {gap ? `${gap.toLocaleString()} XP to catch ${next?.name}` : 'You are holding the top spot.'}
          </LexText>
          <View style={styles.heroStats}>
            <SocialStat value={you.xp.toLocaleString()} label="weekly XP" color={t.colors.accentTeal} />
            <SocialStat value="2d 14h" label="reset" color={t.colors.accentPurple} />
            <SocialStat value="Top 10" label="promote" color={t.colors.accentAmber} />
          </View>
        </LinearGradient>

        <View style={styles.segmentWrap}>
          <Segment label="League" icon="trophy.fill" fallback="L" active={tab === 'league'} color={t.colors.accentTeal} onPress={() => setTab('league')} />
          <Segment label="Friends" icon="person.2.fill" fallback="F" active={tab === 'friends'} color={t.colors.accentPurple} onPress={() => setTab('friends')} />
        </View>

        {tab === 'league' ? (
          <Card style={{ marginTop: 12 }}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleLeft}>
                <View style={[styles.sectionGlyph, { backgroundColor: 'rgba(0,229,184,0.13)' }]}>
                  <IconSymbol name="chart.bar.xaxis" fallback="W" color={t.colors.accentTeal} size={15} />
                </View>
                <LexText variant="title">Weekly League</LexText>
              </View>
              <View style={[styles.livePill, { borderColor: t.colors.border }]}>
                <View style={[styles.liveDot, { backgroundColor: t.colors.accentTeal }]} />
                <LexText variant="label" style={{ color: t.colors.muted, fontSize: 10 }}>
                  Live
                </LexText>
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              {league.map((item) => (
                <LeagueRow key={item.rank} item={item} />
              ))}
            </View>
          </Card>
        ) : (
          <>
            <Card style={{ marginTop: 12 }}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <View style={[styles.sectionGlyph, { backgroundColor: 'rgba(123,111,255,0.14)' }]}>
                    <IconSymbol name="magnifyingglass" fallback="S" color={t.colors.accentPurple} size={15} />
                  </View>
                  <LexText variant="title">Find friends</LexText>
                </View>
              </View>
              <View style={[styles.inputShell, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                <IconSymbol name="magnifyingglass" fallback="S" color={t.colors.muted} size={15} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="Search username..."
                  placeholderTextColor={t.colors.muted}
                  style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
                />
              </View>
            </Card>

            <View style={{ marginTop: 12, gap: 10 }}>
              {filtered.map((friend) => (
                <FriendChallenge key={friend.name} friend={friend} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SocialStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.heroStat}>
      <LexText variant="h3" style={{ color, fontSize: 18 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ fontSize: 9, marginTop: 2 }}>
        {label}
      </LexText>
    </View>
  );
}

function Segment({
  label,
  icon,
  fallback,
  active,
  color,
  onPress,
}: {
  label: string;
  icon: string;
  fallback: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={[
        styles.segment,
        {
          backgroundColor: active ? `${color}24` : 'rgba(255,255,255,0.04)',
          borderColor: active ? `${color}55` : t.colors.border,
        },
      ]}
    >
      <IconSymbol name={icon} fallback={fallback} color={active ? color : t.colors.muted} size={15} />
      <LexText variant="title" style={{ textAlign: 'center', color: active ? color : t.colors.text }}>
        {label}
      </LexText>
    </Pressable>
  );
}

function LeagueRow({ item }: { item: { rank: number; name: string; xp: number; avatar: string; tone: string } }) {
  const t = useTheme();
  const you = item.name === 'You';
  const rankIcon = item.rank <= 3 ? 'medal.fill' : 'number';
  const toneColor =
    item.tone === 'purple'
      ? t.colors.accentPurple
      : item.tone === 'teal' || item.tone === 'you'
        ? t.colors.accentTeal
        : item.tone === 'pink'
          ? t.colors.accentPink
          : item.tone === 'blue'
            ? t.colors.accentBlue
          : t.colors.accentAmber;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.rank}. ${item.name}, ${item.xp.toLocaleString()} XP`}
      onPress={hapticSelection}
      style={({ pressed }) => [
        styles.leagueRow,
        {
          borderColor: you ? 'rgba(0,229,184,0.30)' : t.colors.border,
          backgroundColor: you ? 'rgba(0,229,184,0.075)' : 'rgba(255,255,255,0.025)',
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={[styles.rankToken, { backgroundColor: `${toneColor}1F`, borderColor: `${toneColor}44` }]}>
        {item.rank <= 3 ? (
          <IconSymbol name={rankIcon} fallback={String(item.rank)} color={toneColor} size={14} />
        ) : (
          <LexText variant="label" style={{ color: t.colors.muted, fontSize: 10 }}>
            {item.rank}
          </LexText>
        )}
      </View>
      <View style={[styles.avatar, { backgroundColor: `${toneColor}24`, borderColor: `${toneColor}44` }]}>
        <LexText variant="title" style={{ fontSize: 12, color: toneColor }}>
          {item.avatar}
        </LexText>
      </View>
      <LexText variant="title" style={{ flex: 1, color: you ? t.colors.accentTeal : t.colors.text }}>
        {item.name}
      </LexText>
      <LexText variant="title" style={{ color: you ? t.colors.accentTeal : t.colors.accentPurple }}>
        {item.xp.toLocaleString()}
      </LexText>
    </Pressable>
  );
}

function FriendChallenge({ friend }: { friend: { name: string; streak: number; xp: number; challenge: string } }) {
  const t = useTheme();

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.avatarLarge, { backgroundColor: 'rgba(123,111,255,0.18)', borderColor: 'rgba(123,111,255,0.35)' }]}>
          <LexText variant="title" style={{ color: t.colors.accentPurple }}>
            {friend.name.slice(0, 1)}
          </LexText>
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="title">{friend.name}</LexText>
          <LexText variant="muted" style={{ marginTop: 3, fontSize: 13 }}>
            {friend.streak} {friend.streak === 1 ? 'day' : 'days'} streak · {friend.xp.toLocaleString()} XP
          </LexText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={hapticSelection}
          style={({ pressed }) => [
            styles.challengePill,
            { borderColor: 'rgba(255,179,71,0.28)', backgroundColor: 'rgba(255,179,71,0.1)', opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <IconSymbol name="bolt.fill" fallback="C" color={t.colors.accentAmber} size={12} />
          <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 10 }}>
            Challenge
          </LexText>
        </Pressable>
      </View>
      <View style={[styles.friendQuest, { borderColor: t.colors.border }]}>
        <View style={styles.questRow}>
          <View style={[styles.sectionGlyph, { backgroundColor: 'rgba(0,229,184,0.12)' }]}>
            <IconSymbol name="gamecontroller.fill" fallback="G" color={t.colors.accentTeal} size={15} />
          </View>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color: t.colors.muted, fontSize: 10 }}>
              Suggested duel
            </LexText>
            <LexText variant="title" style={{ marginTop: 4 }}>
              {friend.challenge}
            </LexText>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerGlyph: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginTop: 16,
    borderRadius: 22,
    borderCurve: 'continuous',
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leagueLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  heroStats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  heroStat: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderCurve: 'continuous',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  segmentWrap: { flexDirection: 'row', gap: 10, marginTop: 14 },
  segment: { flex: 1, borderWidth: 1, borderRadius: 16, borderCurve: 'continuous', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionGlyph: { width: 32, height: 32, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 999 },
  inputShell: { marginTop: 12, height: 48, borderWidth: 1, borderRadius: 16, borderCurve: 'continuous', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  input: { flex: 1, height: 46, padding: 0 },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 8,
  },
  rankToken: { width: 30, height: 30, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarLarge: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  challengePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  friendQuest: { marginTop: 12, borderWidth: 1, borderRadius: 14, padding: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
