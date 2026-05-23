import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function OnboardingScreen() {
  return (
    <Screen>
      <View style={styles.wrap}>
        <LexText variant="h1">Own Every Word You Say</LexText>
        <LexText variant="muted" style={{ marginTop: 10 }}>
          This will become the 5-screen cinematic onboarding + placement test flow. For now it’s a scaffold.
        </LexText>

        <Card style={{ marginTop: 18 }}>
          <LexText variant="title">Next screens to implement</LexText>
          <LexText variant="muted" style={{ marginTop: 10 }}>
            1) Welcome · 2) Sign up/in · 3) Placement test · 4) Goal setting · 5) Category picker
          </LexText>
        </Card>

        <View style={{ marginTop: 18, gap: 10 }}>
          <Button title="Finish onboarding → Home" onPress={() => router.replace('/(tabs)/home')} />
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18, justifyContent: 'center' },
});

