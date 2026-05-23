import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';

export function GameShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useTheme();

  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <LexText variant="h2" style={{ fontSize: 26 }}>
              {title}
            </LexText>
            {subtitle ? (
              <LexText variant="muted" style={{ marginTop: 4 }}>
                {subtitle}
              </LexText>
            ) : null}
          </View>
          <Button title="Close" variant="ghost" onPress={() => router.back()} style={{ width: 90, height: 40 }} />
        </View>

        <View style={{ flex: 1 }}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  footer: { paddingTop: 12 },
});

