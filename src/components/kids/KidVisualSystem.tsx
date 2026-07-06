import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { hapticSelection } from '../../utils/haptics';
import { LexText } from '../LexText';
import { KidButton, KidPill, KidProgressBar, kidColors as c } from './KidKit';

export type KidMissionNodeState = 'complete' | 'active' | 'ready';

export type KidMissionNode = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  accent: string;
  progress: number;
  state: KidMissionNodeState;
  rewardLabel: string;
  route: string;
};

export type KidOnboardingFocusOption = {
  id: string;
  label: string;
  icon: string;
};

export function KidMissionConstellation({
  eyebrow,
  title,
  subtitle,
  nodes,
  progress,
  rewardLabel,
  primaryLabel,
  onPrimaryPress,
  onNodePress,
  style,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  nodes: KidMissionNode[];
  progress: number;
  rewardLabel: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  onNodePress: (node: KidMissionNode) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const activeNode = nodes.find((node) => node.state === 'active') ?? nodes.find((node) => node.state !== 'complete') ?? nodes[0];

  return (
    <Animated.View entering={FadeInDown.duration(420).springify().damping(17)} style={[styles.constellationWrap, style]}>
      <LinearGradient
        colors={['#3420A8', '#8174F2', '#55B7FF']}
        start={{ x: 0.02, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.constellation}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.glowMoon} />
          <View style={styles.glowMint} />
          <View style={styles.stageFloor} />
          <Svg width="100%" height="100%" viewBox="0 0 340 260" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
            <Path
              d="M40 156 C90 92 132 88 170 126 C214 171 248 84 306 112"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M40 156 C90 92 132 88 170 126 C214 171 248 84 306 112"
              stroke="rgba(255,217,61,0.68)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="9 13"
              fill="none"
            />
          </Svg>
          <KidOrbitToken icon="A" color="#FFD93D" style={styles.orbitOne} />
          <KidOrbitToken icon="♪" color="#51D9A8" delay={220} style={styles.orbitTwo} />
          <KidOrbitToken icon="✓" color="#FF7A7A" delay={440} style={styles.orbitThree} />
        </View>

        <View style={styles.constellationHeader}>
          <View style={{ flex: 1 }}>
            <KidPill label={eyebrow} active color="rgba(255,255,255,0.20)" />
            <LexText variant="h2" numberOfLines={2} style={styles.constellationTitle}>
              {title}
            </LexText>
            <LexText variant="muted" numberOfLines={2} style={styles.constellationSubtitle}>
              {subtitle}
            </LexText>
          </View>
          <View style={styles.rewardCapsule}>
            <LexText style={{ fontSize: 24, lineHeight: 30 }}>⭐</LexText>
            <LexText variant="label" style={{ color: c.ink, fontSize: 11 }}>
              {rewardLabel}
            </LexText>
          </View>
        </View>

        <View style={styles.constellationStage}>
          {nodes.slice(0, 4).map((node, index) => (
            <MissionNode key={node.id} node={node} index={index} onPress={() => onNodePress(node)} />
          ))}
        </View>

        <View style={styles.constellationFooter}>
          <View style={{ flex: 1 }}>
            <View style={styles.progressMeta}>
              <LexText variant="label" style={{ color: 'rgba(255,255,255,0.84)' }}>
                {activeNode?.label ?? 'Quest'} now
              </LexText>
              <LexText variant="label" style={{ color: '#FFFFFF' }}>
                {Math.round(progress * 100)}%
              </LexText>
            </View>
            <KidProgressBar progress={progress} color="#FFD93D" />
            <LexText variant="muted" numberOfLines={1} style={styles.activeNodeLine}>
              {activeNode?.title}
            </LexText>
          </View>
          <KidButton title={primaryLabel} onPress={onPrimaryPress} color="#FFD93D" style={styles.constellationCta} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function KidOnboardingDock({
  step,
  total,
  title,
  color,
  accent,
  primaryLabel,
  showFocusPicker,
  focusOptions,
  selectedFocusIds,
  onStepPress,
  onPrimaryPress,
  onBackPress,
  onParentPress,
  onToggleFocus,
}: {
  step: number;
  total: number;
  title: string;
  color: string;
  accent: string;
  primaryLabel: string;
  showFocusPicker: boolean;
  focusOptions: readonly KidOnboardingFocusOption[];
  selectedFocusIds: readonly string[];
  onStepPress: (step: number) => void;
  onPrimaryPress: () => void;
  onBackPress: () => void;
  onParentPress: () => void;
  onToggleFocus: (id: string) => void;
}) {
  const progress = total > 0 ? (step + 1) / total : 0;

  return (
    <Animated.View entering={FadeInDown.duration(360).springify().damping(18)} style={styles.onboardingDockShadow}>
      <LinearGradient colors={['rgba(255,255,255,0.98)', '#F7FBFF']} style={styles.onboardingDock}>
        <View style={styles.onboardingDockTop}>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color }}>
              {showFocusPicker ? 'Choose your adventure' : 'Swipe the story'}
            </LexText>
            <LexText variant="title" numberOfLines={1} style={styles.onboardingDockTitle}>
              {title}
            </LexText>
          </View>
          <View style={[styles.onboardingDockOrb, { backgroundColor: `${accent}55` }]}>
            <LexText variant="title" style={{ color: c.ink }}>
              {step + 1}
            </LexText>
            <LexText variant="label" style={{ color: c.muted, fontSize: 8 }}>
              of {total}
            </LexText>
          </View>
        </View>

        <KidProgressBar progress={progress} color={color} />

        <View style={styles.onboardingDots}>
          {Array.from({ length: total }).map((_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Go to onboarding step ${index + 1}`}
              accessibilityState={{ selected: index === step }}
              onPress={() => onStepPress(index)}
              style={[styles.onboardingDotPressable, index === step ? { backgroundColor: `${color}18` } : null]}
            >
              <View style={[styles.onboardingDot, { width: index === step ? 28 : 10, backgroundColor: index === step ? color : c.line }]} />
            </Pressable>
          ))}
        </View>

        {showFocusPicker ? (
          <View style={styles.onboardingFocusGrid}>
            {focusOptions.map((item) => {
              const active = selectedFocusIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${item.label} focus`}
                  onPress={() => {
                    hapticSelection();
                    onToggleFocus(item.id);
                  }}
                  style={({ pressed }) => [
                    styles.onboardingFocusToken,
                    {
                      borderColor: active ? color : c.line,
                      backgroundColor: active ? `${color}18` : c.paper,
                      transform: [{ scale: pressed ? 0.96 : active ? 1.03 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.onboardingFocusIcon, { backgroundColor: active ? accent : `${color}16` }]}>
                    <LexText style={{ fontSize: 19, lineHeight: 25 }}>{item.icon}</LexText>
                  </View>
                  <LexText variant="label" numberOfLines={1} style={{ color: active ? color : c.muted, fontSize: 10 }}>
                    {item.label}
                  </LexText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.onboardingSwipeHint}>
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>↔</LexText>
            <LexText variant="muted" style={{ color: c.muted, flex: 1, fontSize: 12 }}>
              Swipe sideways or tap Next to preview the learning world.
            </LexText>
          </View>
        )}

        <View style={styles.onboardingDockActions}>
          <View style={styles.onboardingSecondaryActions}>
            <Pressable accessibilityRole="button" disabled={step === 0} onPress={onBackPress} style={[styles.onboardingSecondaryButton, step === 0 ? { opacity: 0.42 } : null]}>
              <LexText variant="label" style={{ color: c.ink }}>
                Back
              </LexText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onParentPress} style={styles.onboardingSecondaryButton}>
              <LexText variant="label" style={{ color }}>
                Parent
              </LexText>
            </Pressable>
          </View>
          <KidButton title={primaryLabel} onPress={onPrimaryPress} color={accent} style={styles.onboardingPrimaryButton} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function KidContentPulseCard({
  title,
  subtitle,
  icon,
  color,
  accent,
  meta,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  accent: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(360).springify().damping(18)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
        onPress={() => {
          hapticSelection();
          onPress();
        }}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        <LinearGradient colors={[color, accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pulseCard}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={styles.pulseCardGlow} />
            <KidOrbitToken icon="+" color="rgba(255,255,255,0.9)" delay={180} style={styles.pulseToken} />
          </View>
          <View style={styles.pulseIconPlate}>
            <LexText style={{ fontSize: 38, lineHeight: 48 }}>{icon}</LexText>
          </View>
          <View style={{ flex: 1 }}>
            <KidPill label={meta} active color="rgba(255,255,255,0.22)" />
            <LexText variant="h3" numberOfLines={2} style={styles.pulseTitle}>
              {title}
            </LexText>
            <LexText variant="muted" numberOfLines={2} style={styles.pulseSubtitle}>
              {subtitle}
            </LexText>
          </View>
          <View style={styles.pulseArrow}>
            <LexText variant="title" style={{ color: c.ink }}>
              →
            </LexText>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function MissionNode({ node, index, onPress }: { node: KidMissionNode; index: number; onPress: () => void }) {
  const position = nodePositions[index] ?? nodePositions[nodePositions.length - 1];
  const active = node.state === 'active';
  const complete = node.state === 'complete';

  return (
    <Animated.View entering={FadeInDown.delay(index * 90).duration(360).springify().damping(16)} style={[styles.nodeWrap, position]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${node.title}. ${node.subtitle}. ${node.rewardLabel}`}
        onPress={() => {
          hapticSelection();
          onPress();
        }}
        style={({ pressed }) => [styles.nodePressable, { transform: [{ scale: pressed ? 0.94 : active ? 1.07 : 1 }] }]}
      >
        <View style={[styles.nodeShadow, { backgroundColor: complete ? c.mint : node.accent }]} />
        <LinearGradient colors={[node.color, node.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nodeBubble}>
          <NodeProgress progress={node.progress} color={complete ? c.mint : '#FFFFFF'} />
          <LexText style={{ fontSize: 27, lineHeight: 34 }}>{complete ? '✓' : node.icon}</LexText>
        </LinearGradient>
        <View style={[styles.nodeLabelCard, active ? { borderColor: c.yellow, borderWidth: 2 } : null]}>
          <LexText variant="label" numberOfLines={1} style={{ color: c.ink, fontSize: 10 }}>
            {node.label}
          </LexText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function NodeProgress({ progress, color }: { progress: number; color: string }) {
  const clamped = Math.max(0.08, Math.min(1, progress));
  const circumference = 2 * Math.PI * 27;
  return (
    <Svg width={68} height={68} viewBox="0 0 68 68" style={StyleSheet.absoluteFill}>
      <Circle cx="34" cy="34" r="27" stroke="rgba(255,255,255,0.26)" strokeWidth="5" fill="none" />
      <Circle
        cx="34"
        cy="34"
        r="27"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - clamped)}
        rotation="-90"
        origin="34,34"
        fill="none"
      />
    </Svg>
  );
}

function KidOrbitToken({
  icon,
  color,
  delay = 0,
  style,
}: {
  icon: string;
  color: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const y = useSharedValue(0);
  const spin = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1050 + delay, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1050 + delay, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
    spin.value = withRepeat(withTiming(1, { duration: 5200 + delay, easing: Easing.linear }), -1);
  }, [delay, spin, y]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${spin.value * 8}deg` }],
  }));

  return (
    <Animated.View style={[styles.orbitToken, { backgroundColor: color }, style, animatedStyle]}>
      <LexText variant="title" style={{ color: c.ink, fontSize: 15 }}>
        {icon}
      </LexText>
    </Animated.View>
  );
}

const nodePositions: StyleProp<ViewStyle>[] = [
  { left: '5%', top: 80 },
  { left: '31%', top: 28 },
  { right: '27%', top: 102 },
  { right: '4%', top: 52 },
];

const styles = StyleSheet.create({
  constellationWrap: {
    marginTop: 12,
    borderRadius: 34,
    borderCurve: 'continuous',
    boxShadow: '0 22px 34px rgba(71,57,146,0.24)',
  },
  constellation: {
    minHeight: 388,
    borderRadius: 34,
    borderCurve: 'continuous',
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
  },
  glowMoon: {
    position: 'absolute',
    width: 162,
    height: 162,
    borderRadius: 81,
    right: -44,
    top: -34,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  glowMint: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    left: -46,
    bottom: 38,
    backgroundColor: 'rgba(81,217,168,0.18)',
  },
  stageFloor: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 214,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(34,35,74,0.16)',
    transform: [{ scaleX: 1.1 }],
  },
  constellationHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  constellationTitle: { color: 'white', fontSize: 27, lineHeight: 32, marginTop: 10 },
  constellationSubtitle: { color: 'rgba(255,255,255,0.84)', fontSize: 13, lineHeight: 19, marginTop: 5 },
  rewardCapsule: {
    width: 82,
    minHeight: 82,
    borderRadius: 29,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 9,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 13px 0 rgba(34,35,74,0.13)',
  },
  constellationStage: { minHeight: 190, marginTop: 8 },
  nodeWrap: { position: 'absolute', width: 84, alignItems: 'center' },
  nodePressable: { width: 84, minHeight: 94, alignItems: 'center', justifyContent: 'flex-start' },
  nodeShadow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 23,
    borderCurve: 'continuous',
    top: 13,
    transform: [{ translateY: 8 }, { rotate: '-8deg' }],
    opacity: 0.76,
  },
  nodeBubble: {
    width: 68,
    height: 68,
    borderRadius: 25,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 14px 18px rgba(34,35,74,0.22)',
  },
  nodeLabelCard: {
    minHeight: 28,
    borderRadius: 999,
    marginTop: -2,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.08)',
  },
  constellationFooter: {
    minHeight: 92,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  progressMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  activeNodeLine: { color: 'rgba(255,255,255,0.78)', marginTop: 7, fontSize: 12 },
  constellationCta: { minHeight: 50, paddingHorizontal: 16, alignSelf: 'center' },
  onboardingDockShadow: {
    borderRadius: 30,
    borderCurve: 'continuous',
    boxShadow: '0 18px 30px rgba(71,57,146,0.16)',
  },
  onboardingDock: {
    borderRadius: 30,
    borderCurve: 'continuous',
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.08)',
    gap: 10,
  },
  onboardingDockTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  onboardingDockTitle: { color: c.ink, fontSize: 17, lineHeight: 22, marginTop: 2 },
  onboardingDockOrb: {
    width: 56,
    height: 56,
    borderRadius: 21,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  onboardingDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  onboardingDotPressable: {
    minWidth: 32,
    minHeight: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingDot: { height: 10, borderRadius: 999 },
  onboardingFocusGrid: { flexDirection: 'row', gap: 8 },
  onboardingFocusToken: {
    flex: 1,
    minHeight: 70,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  onboardingFocusIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingSwipeHint: {
    minHeight: 44,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(129,116,242,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(129,116,242,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  onboardingDockActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  onboardingSecondaryActions: { gap: 6 },
  onboardingSecondaryButton: {
    minWidth: 70,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingPrimaryButton: { flex: 1, minHeight: 54 },
  orbitToken: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.62)',
    boxShadow: '0 10px 18px rgba(34,35,74,0.18)',
  },
  orbitOne: { left: 22, top: 42 },
  orbitTwo: { right: 94, top: 92 },
  orbitThree: { left: 78, bottom: 114 },
  pulseCard: {
    minHeight: 148,
    borderRadius: 30,
    borderCurve: 'continuous',
    padding: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    boxShadow: '0 18px 28px rgba(71,57,146,0.20)',
  },
  pulseCardGlow: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    right: -48,
    top: -34,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pulseToken: { right: 30, bottom: 18, width: 34, height: 34, borderRadius: 14 },
  pulseIconPlate: {
    width: 82,
    height: 94,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 13px 0 rgba(34,35,74,0.12)',
  },
  pulseTitle: { color: 'white', fontSize: 22, lineHeight: 27, marginTop: 9 },
  pulseSubtitle: { color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 17, marginTop: 5 },
  pulseArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
