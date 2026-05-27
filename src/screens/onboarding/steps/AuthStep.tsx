import React, { useEffect, useMemo, useState } from 'react';
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
import { hasSupabase } from '../../../services/env';
import { getSupabase } from '../../../services/supabase';
import { upsertUserProfile } from '../../../services/supabaseHelpers';

export function AuthStep({
  onBack,
  onNext,
  initialMode,
}: {
  onBack: () => void;
  onNext: (result: { mode: 'signup' | 'signin' }) => void;
  initialMode?: 'signup' | 'signin';
}) {
  const t = useTheme();
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const setUserId = useAppStore((s) => s.setUserId);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode ?? 'signup');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!initialMode) return;
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const valid = useMemo(() => /\S+@\S+\.\S+/.test(email) && password.length >= 6, [email, password]);

  const submit = async () => {
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

    const name = email.split('@')[0] || '';
    setDisplayName(name);

    if (!hasSupabase()) {
      if (mode === 'signin') setOnboardingCompleted(true);
      onNext({ mode });
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const authResult =
        mode === 'signup'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (authResult.error) throw authResult.error;

      const userId = authResult.data.user?.id ?? authResult.data.session?.user?.id;
      if (userId) {
        setUserId(userId);
        await upsertUserProfile({
          id: userId,
          display_name: name,
          daily_goal_words: dailyGoalWords,
        }).catch(() => null);
      }

      if (mode === 'signin') setOnboardingCompleted(true);
      onNext({ mode });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            {hasSupabase() ? 'Sign in with Supabase (email + password).' : 'Local mode. Add Supabase env vars to enable real sign-in.'}
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
          <Button title={mode === 'signup' ? 'Continue' : 'Sign in'} onPress={submit} disabled={!valid || submitting} />
          <Button title="Back" variant="ghost" onPress={onBack} />
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeInDown.delay(240).duration(520)} style={{ marginTop: 12 }}>
            <LexText variant="muted" style={{ color: t.colors.accentPink }}>
              {error}
            </LexText>
          </Animated.View>
        ) : null}

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
