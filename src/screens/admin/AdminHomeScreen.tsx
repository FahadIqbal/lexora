import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { LexText } from '../../components/LexText';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeProvider';
import { hasSupabase } from '../../services/env';
import { useAppStore } from '../../store/useAppStore';

export function AdminHomeScreen() {
  const t = useTheme();
  const userId = useAppStore((s) => s.user.id);
  const isAdmin = useAppStore((s) => s.user.isAdmin);

  const status = useMemo(() => {
    if (!hasSupabase()) return { title: 'Backend not configured', body: 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
    if (!userId) return { title: 'Sign in required', body: 'Sign in to access the admin panel.' };
    if (!isAdmin) return { title: 'Access denied', body: 'Your account is not marked as admin in the database.' };
    return null;
  }, [userId, isAdmin]);

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <LexText variant="h2">Admin</LexText>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <LexText variant="title" style={{ color: t.colors.muted }}>
              Close
            </LexText>
          </Pressable>
        </View>

        <LexText variant="muted" style={{ marginTop: 6 }}>
          Manage dictionary content and app configuration.
        </LexText>

        {status ? (
          <Card style={{ marginTop: 16 }}>
            <LexText variant="title">{status.title}</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              {status.body}
            </LexText>
          </Card>
        ) : (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Pressable
              onPress={() => router.push('/admin/words')}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: t.colors.surface, borderColor: t.colors.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <LexText variant="title">Words</LexText>
                <LexText variant="muted" style={{ marginTop: 4 }}>
                  Create, edit, and delete dictionary entries.
                </LexText>
              </View>
              <LexText variant="title" style={{ color: t.colors.muted }}>
                →
              </LexText>
            </Pressable>

            <Pressable
              onPress={() => router.push('/admin/categories')}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: t.colors.surface, borderColor: t.colors.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <LexText variant="title">Categories</LexText>
                <LexText variant="muted" style={{ marginTop: 4 }}>
                  Manage categories, premium flags, and colors.
                </LexText>
              </View>
              <LexText variant="title" style={{ color: t.colors.muted }}>
                →
              </LexText>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  row: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
});
