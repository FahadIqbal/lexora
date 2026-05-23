import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../theme/ThemeProvider';
import { FloatingLabelInput } from '../ui/FloatingLabelInput';
import { useAppStore } from '../../../store/useAppStore';

export function AuthStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const t = useTheme();
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const valid = useMemo(() => /\S+@\S+\.\S+/.test(email) && password.length >= 6, [email, password]);

  const submit = () => {
    if (!valid) {
      shake.value = withSequence(
        withTiming(-10, { duration: 40 }),
        withTiming(10, { duration: 40 }),
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
      return;
    }
    // Until Supabase Auth is wired, derive a friendly display name from email.
    const name = email.split('@')[0] || '';
    setDisplayName(name);
    onNext();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Mock auth for now. Later: Supabase Auth (email + Google/Apple).
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(520)} style={{ marginTop: 18 }}>
          <Animated.View style={shakeStyle}>
            <FloatingLabelInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={{ height: 12 }} />
            <FloatingLabelInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          </Animated.View>
          {!valid ? (
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Use a valid email and a password of 6+ characters.
            </LexText>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(520)} style={{ marginTop: 18, gap: 10 }}>
          <Button title={mode === 'signup' ? 'Continue' : 'Sign in'} onPress={submit} />
          <Button title="Back" variant="ghost" onPress={onBack} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(520)} style={{ marginTop: 14 }}>
          <LexText variant="muted" style={{ textAlign: 'center' }}>
            {mode === 'signup' ? 'Already have account? ' : "Don't have an account? "}
            <LexText
              variant="body"
              style={{ color: t.colors.accentTeal, fontFamily: t.font.body.medium }}
              onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </LexText>
          </LexText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 18, justifyContent: 'center' },
});
