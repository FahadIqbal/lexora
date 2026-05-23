import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';

export function PaywallScreen() {
  const t = useTheme();
  return (
    <Screen>
      <View style={styles.wrap}>
        <LexText variant="h2">Go Premium</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Unlock everything — advanced categories, unlimited AI tutor, all games, offline mode, and deep stats.
        </LexText>

        <Card style={{ marginTop: 16 }}>
          <LexText variant="title">What you get</LexText>
          <View style={{ marginTop: 10, gap: 8 }}>
            <LexText variant="muted">✓ 50+ word categories</LexText>
            <LexText variant="muted">✓ AI Tutor Chat (unlimited)</LexText>
            <LexText variant="muted">✓ All 6 game modes</LexText>
            <LexText variant="muted">✓ Offline mode</LexText>
            <LexText variant="muted">✓ Advanced stats & insights</LexText>
          </View>
        </Card>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={[styles.priceCard, { borderColor: t.colors.border, backgroundColor: t.colors.surface }]}>
              <LexText variant="title">Monthly</LexText>
              <LexText variant="h2" style={{ fontSize: 24, marginTop: 8 }}>
                RM14.90
              </LexText>
              <LexText variant="muted">per month</LexText>
              <View style={{ marginTop: 12 }}>
                <Button title="Choose" onPress={() => {}} />
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.priceCard, { borderColor: 'rgba(0,212,170,0.35)', backgroundColor: 'rgba(0,212,170,0.08)' }]}>
              <LexText variant="title">Yearly</LexText>
              <LexText variant="h2" style={{ fontSize: 24, marginTop: 8 }}>
                RM89.90
              </LexText>
              <LexText variant="muted">best value</LexText>
              <View style={{ marginTop: 12 }}>
                <Button title="Start 7-day trial" onPress={() => {}} />
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          <Button title="Restore purchases" variant="ghost" onPress={() => {}} />
          <Button title="Close" variant="ghost" onPress={() => router.back()} />
          <LexText variant="muted" style={{ textAlign: 'center', fontSize: 12 }}>
            Payments are scaffolded — RevenueCat wiring comes after API keys are ready.
          </LexText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  priceCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
});

