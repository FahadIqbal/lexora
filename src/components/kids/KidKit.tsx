import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '../Screen';
import { LexText } from '../LexText';
import { IconSymbol } from '../IconSymbol';
import { kidTheme as k } from '../../theme/kidTheme';
import { hapticSelection } from '../../utils/haptics';

export const kidColors = k.colors;

export function KidScreen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={[styles.screenContent, style]}>
      <FloatingShapes />
      {children}
    </View>
  );

  return (
    <Screen style={{ backgroundColor: k.colors.appBg }}>
      <LinearGradient
        colors={[k.colors.appBg, '#FFFFFF', '#F4F0FF']}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </Screen>
  );
}

export function KidHeader({
  eyebrow,
  title,
  subtitle,
  avatar,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  right?: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(360).springify().damping(17)} style={styles.header}>
      {avatar ? <KidAvatar label={avatar} size={54} /> : null}
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <LexText variant="label" style={styles.eyebrow}>
            {eyebrow}
          </LexText>
        ) : null}
        <LexText variant="h2" style={styles.headerTitle}>
          {title}
        </LexText>
        {subtitle ? (
          <LexText variant="muted" style={styles.headerSubtitle}>
            {subtitle}
          </LexText>
        ) : null}
      </View>
      {right}
    </Animated.View>
  );
}

export function KidCard({
  children,
  color = k.colors.paper,
  style,
  animated = true,
}: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}) {
  const body = (
    <View style={[styles.card, { backgroundColor: color }, style]}>
      {children}
    </View>
  );
  if (!animated) return body;
  return <Animated.View entering={FadeInDown.duration(360).springify().damping(18)}>{body}</Animated.View>;
}

export function KidButton({
  title,
  onPress,
  color = k.colors.yellow,
  icon,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
        style,
      ]}
    >
      {icon ? <IconSymbol name={icon} fallback="" color={k.colors.ink} size={17} /> : null}
      <LexText variant="title" style={styles.buttonText}>
        {title}
      </LexText>
    </Pressable>
  );
}

export function KidPill({
  label,
  active,
  color = k.colors.purple,
  onPress,
}: {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? color : k.colors.paper,
          borderColor: active ? color : k.colors.line,
        },
      ]}
    >
      <LexText variant="label" style={{ color: active ? 'white' : k.colors.muted, fontSize: 10 }}>
        {label}
      </LexText>
    </Pressable>
  );
}

export function KidAvatar({ label, size = 44, color = k.colors.lilac }: { label: string; size?: number; color?: string }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <LexText style={{ fontSize: Math.round(size * 0.48), lineHeight: Math.round(size * 0.58) }}>{label}</LexText>
    </View>
  );
}

export function KidProgressBar({ progress, color = k.colors.purple }: { progress: number; color?: string }) {
  const fill = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, progress));
  useEffect(() => {
    fill.value = withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [clamped, fill]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.round(fill.value * 100)}%` }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

export function CharacterBubble({ mood = 'happy', text }: { mood?: 'happy' | 'star' | 'listen' | 'read'; text?: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(withTiming(-6, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 900 })),
      -1
    );
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const face = mood === 'star' ? '🌟' : mood === 'listen' ? '🐰' : mood === 'read' ? '📚' : '😊';

  return (
    <Animated.View style={[styles.character, style]}>
      <LexText style={{ fontSize: 44, lineHeight: 54 }}>{face}</LexText>
      {text ? (
        <LexText variant="title" style={{ color: k.colors.ink, textAlign: 'center', marginTop: 4, fontSize: 13 }}>
          {text}
        </LexText>
      ) : null}
    </Animated.View>
  );
}

export function BadgeTile({ icon, title, locked, progress }: { icon: string; title: string; locked?: boolean; progress?: number }) {
  return (
    <KidCard animated={false} style={[styles.badgeTile, locked ? { opacity: 0.48 } : null]}>
      <LexText style={{ fontSize: 34, lineHeight: 42, textAlign: 'center' }}>{locked ? '🔒' : icon}</LexText>
      <LexText variant="title" numberOfLines={2} style={{ color: k.colors.ink, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
        {title}
      </LexText>
      {typeof progress === 'number' ? <KidProgressBar progress={progress} color={locked ? k.colors.muted : k.colors.yellow} /> : null}
    </KidCard>
  );
}

export function LessonCard({
  title,
  subtitle,
  icon,
  color,
  progress,
  locked,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  progress: number;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      disabled={locked}
      style={({ pressed }) => [{ opacity: locked ? 0.55 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      <KidCard animated={false} style={styles.lessonCard}>
        <LinearGradient colors={[color, '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lessonArt}>
          <LexText style={{ fontSize: 42, lineHeight: 52 }}>{locked ? '🔒' : icon}</LexText>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: k.colors.ink, fontSize: 18 }}>
            {title}
          </LexText>
          <LexText variant="muted" numberOfLines={2} style={{ color: k.colors.muted, marginTop: 4, fontSize: 13 }}>
            {subtitle}
          </LexText>
          <View style={{ marginTop: 10 }}>
            <KidProgressBar progress={progress} color={color} />
          </View>
        </View>
        <View style={styles.lessonArrow}>
          <LexText variant="title" style={{ color: k.colors.ink }}>
            →
          </LexText>
        </View>
      </KidCard>
    </Pressable>
  );
}

export function QuizOption({
  label,
  selected,
  correct,
  wrong,
  onPress,
}: {
  label: string;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  useEffect(() => {
    if (!wrong) return;
    shake.value = withSequence(withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }), withTiming(0, { duration: 45 }));
  }, [shake, wrong]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const bg = correct ? k.colors.mintSoft : wrong ? k.colors.coralSoft : selected ? k.colors.yellowSoft : k.colors.paper;
  const border = correct ? k.colors.success : wrong ? k.colors.danger : selected ? k.colors.yellow : k.colors.line;

  return (
    <Animated.View style={shakeStyle}>
      <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
        <LexText variant="title" style={{ color: k.colors.ink, fontSize: 18 }}>
          {label}
        </LexText>
      </Pressable>
    </Animated.View>
  );
}

export function FloatingShapes() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.shape, styles.shapeOne]} />
      <View style={[styles.shape, styles.shapeTwo]} />
      <View style={[styles.shape, styles.shapeThree]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    minHeight: '100%',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 34,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: k.colors.purple, fontSize: 11 },
  headerTitle: { color: k.colors.ink, fontSize: 31, lineHeight: 36 },
  headerSubtitle: { color: k.colors.muted, fontSize: 14, lineHeight: 20 },
  card: {
    borderRadius: k.radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: k.colors.line,
    padding: 16,
    boxShadow: `0 14px 28px ${k.colors.shadow}`,
  },
  button: {
    minHeight: 54,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,35,74,0.08)',
    boxShadow: `0 10px 18px ${k.colors.shadow}`,
  },
  buttonText: { color: k.colors.ink, fontSize: 16 },
  pill: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    boxShadow: `0 8px 16px ${k.colors.shadow}`,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(34,35,74,0.08)',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  character: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 108,
    minHeight: 108,
    borderRadius: 36,
    backgroundColor: k.colors.paper,
    borderWidth: 1,
    borderColor: k.colors.line,
    padding: 12,
    boxShadow: `0 12px 24px ${k.colors.shadow}`,
  },
  badgeTile: { width: 112, minHeight: 132, alignItems: 'center', gap: 8 },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  lessonArt: {
    width: 82,
    height: 82,
    borderRadius: 26,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: k.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    minHeight: 62,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 2,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shape: { position: 'absolute', borderRadius: 999, opacity: 0.45 },
  shapeOne: { width: 84, height: 84, right: -30, top: 64, backgroundColor: k.colors.yellowSoft },
  shapeTwo: { width: 58, height: 58, left: -22, top: 220, backgroundColor: k.colors.sky },
  shapeThree: { width: 90, height: 90, right: -34, bottom: 130, backgroundColor: k.colors.coralSoft },
});
