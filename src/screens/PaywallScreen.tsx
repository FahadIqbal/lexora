import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { TAB_BAR_BOTTOM } from '../theme';

export function PaywallScreen() {
  const t = useTheme();
  const showCheckoutAlert = (plan: string) => {
    Alert.alert('Checkout unavailable', `${plan} checkout is not connected in this build.`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
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
                <Button title="Choose" onPress={() => showCheckoutAlert('Monthly')} />
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
                <Button title="Start 7-day trial" onPress={() => showCheckoutAlert('Yearly trial')} />
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          <Button
            title="Restore purchases"
            variant="ghost"
            onPress={() => Alert.alert('Restore unavailable', 'Purchase restore is not connected in this build.')}
          />
          <Button title="Close" variant="ghost" onPress={() => router.back()} />
          <LexText variant="muted" style={{ textAlign: 'center', fontSize: 12 }}>
            Checkout is disabled until billing products are configured.
          </LexText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  priceCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
});
