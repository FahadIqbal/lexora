import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';

export function SocialScreen() {
  const t = useTheme();
  const [tab, setTab] = useState<'league' | 'friends'>('league');

  const league = useMemo(
    () => [
      { rank: 1, name: 'SarahM', xp: 2840, zone: 'promote' },
      { rank: 2, name: 'Ahmed_K', xp: 2411, zone: 'promote' },
      { rank: 3, name: 'You', xp: 1840, zone: 'you' },
      { rank: 4, name: 'Priya_L', xp: 1520, zone: 'neutral' },
      { rank: 5, name: 'Kenji', xp: 1310, zone: 'neutral' },
      { rank: 6, name: 'Marta', xp: 990, zone: 'relegate' },
    ],
    []
  );

  const [q, setQ] = useState('');
  const friends = useMemo(
    () => [
      { name: 'SarahM', streak: 47, xp: 2840 },
      { name: 'Priya_L', streak: 18, xp: 1520 },
      { name: 'Kenji', streak: 9, xp: 1310 },
    ],
    []
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(qq));
  }, [q, friends]);

  return (
    <Screen>
      <View style={styles.wrap}>
        <LexText variant="h2">Leaderboard & Social</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Weekly leagues, friends, and challenges (mock data for now).
        </LexText>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={() => setTab('league')}
            style={[
              styles.seg,
              {
                backgroundColor: tab === 'league' ? 'rgba(0,212,170,0.14)' : 'rgba(255,255,255,0.04)',
                borderColor: tab === 'league' ? 'rgba(0,212,170,0.35)' : t.colors.border,
              },
            ]}
          >
            <LexText variant="title" style={{ textAlign: 'center', color: tab === 'league' ? t.colors.accentTeal : t.colors.text }}>
              League
            </LexText>
          </Pressable>
          <Pressable
            onPress={() => setTab('friends')}
            style={[
              styles.seg,
              {
                backgroundColor: tab === 'friends' ? 'rgba(108,99,255,0.14)' : 'rgba(255,255,255,0.04)',
                borderColor: tab === 'friends' ? 'rgba(108,99,255,0.35)' : t.colors.border,
              },
            ]}
          >
            <LexText variant="title" style={{ textAlign: 'center', color: tab === 'friends' ? '#A89CFF' : t.colors.text }}>
              Friends
            </LexText>
          </Pressable>
        </View>

        {tab === 'league' ? (
          <>
            <Card style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <LexText variant="title">Bronze League</LexText>
                <LexText variant="muted">Resets in 2d 14h</LexText>
              </View>
              <LexText variant="muted" style={{ marginTop: 8 }}>
                Top 10 promote · Bottom 5 relegate
              </LexText>
            </Card>

            <View style={{ flex: 1, marginTop: 12 }}>
              <FlashList
                data={league as any}
                keyExtractor={(x: any) => String(x.rank)}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }: any) => {
                  const you = item.zone === 'you';
                  const zoneBg =
                    item.zone === 'promote'
                      ? 'rgba(0,212,170,0.08)'
                      : item.zone === 'relegate'
                        ? 'rgba(255,107,157,0.08)'
                        : 'transparent';
                  return (
                    <View
                      style={[
                        styles.row,
                        { backgroundColor: t.colors.surface, borderColor: t.colors.border },
                        you ? { borderColor: 'rgba(0,212,170,0.45)' } : null,
                        { overflow: 'hidden' },
                      ]}
                    >
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: zoneBg }]} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <LexText variant="title" style={{ width: 26, textAlign: 'center' }}>
                          {item.rank}
                        </LexText>
                        <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: t.colors.border }]}>
                          <LexText variant="title" style={{ fontSize: 12 }}>
                            {item.name.slice(0, 1).toUpperCase()}
                          </LexText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <LexText variant="title" style={you ? { color: t.colors.accentTeal } : null}>
                            {item.name}
                          </LexText>
                        </View>
                        <LexText variant="title" style={{ color: t.colors.accentPurple }}>
                          {item.xp.toLocaleString()}
                        </LexText>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          </>
        ) : (
          <>
            <Card style={{ marginTop: 12 }}>
              <LexText variant="title">Find friends</LexText>
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search username…"
                placeholderTextColor={t.colors.muted}
                style={[
                  styles.input,
                  { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)', color: t.colors.text, fontFamily: t.font.body.regular },
                ]}
              />
            </Card>

            <Card style={{ marginTop: 12 }}>
              <LexText variant="title">Friends</LexText>
              <View style={{ height: 10 }} />
              {filtered.map((f) => (
                <View key={f.name} style={[styles.friendRow, { borderColor: t.colors.border }]}>
                  <LexText variant="title">{f.name}</LexText>
                  <LexText variant="muted">🔥 {f.streak}</LexText>
                  <LexText variant="muted" style={{ marginLeft: 'auto', color: t.colors.accentPurple }}>
                    {f.xp.toLocaleString()} XP
                  </LexText>
                </View>
              ))}
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  seg: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
  row: { borderWidth: 1, borderRadius: 18, padding: 14 },
  avatar: { width: 30, height: 30, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  input: { marginTop: 10, height: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  friendRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, alignItems: 'center' },
});
