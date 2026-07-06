import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/IconSymbol';
import { useTheme } from '../theme/ThemeProvider';
import { sendTutorMessage, type TutorMessage } from '../services/aiTutor';
import { hasLiveAiTutor } from '../services/env';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { Haptics, hapticNotify, hapticSelection } from '../utils/haptics';
import { getDisplayProficiency } from '../utils/proficiency';

type UiMessage = { role: 'user' | 'assistant'; content: string };

export function ChatScreen() {
  const t = useTheme();
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const dueCount = useAppStore((s) => s.getDueWordIds().length);
  const addToStudyList = useAppStore((s) => s.addToStudyList);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: 'assistant',
      content:
        "I am your Lexora coach. Send a word, sentence, or goal and I will turn it into examples, recall practice, and better usage.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const liveTutor = hasLiveAiTutor();
  const topicHint = selectedCategories[0]?.replace(/[-_]/g, ' ') ?? 'daily vocabulary';
  const displayProficiency = getDisplayProficiency(proficiency);
  const coachPrompts = useMemo(
    () => [
      {
        label: 'Explain',
        icon: 'text.magnifyingglass',
        fallback: 'E',
        title: 'Make it simple',
        prompt: `Explain a ${displayProficiency} vocabulary word from ${topicHint} in simple terms, then give one memory hook.`,
        color: t.colors.accentTeal,
      },
      {
        label: 'Apply',
        icon: 'briefcase.fill',
        fallback: 'A',
        title: 'Use it in life',
        prompt: 'Use meticulous in a concise business update, then show a warmer alternative.',
        color: t.colors.accentPurple,
      },
      {
        label: 'Recall',
        icon: 'questionmark.circle.fill',
        fallback: 'Q',
        title: 'Quiz me fast',
        prompt: 'Quiz me on nuance with one multiple-choice question and explain the answer.',
        color: t.colors.accentAmber,
      },
    ],
    [displayProficiency, t.colors.accentAmber, t.colors.accentPurple, t.colors.accentTeal, topicHint]
  );
  const chips = ['Simpler explanation', 'Find synonyms for nuance', 'Quiz me on meticulous', 'Use ephemeral in a sentence'];

  const typingDot = useSharedValue(0);
  useEffect(() => {
    if (!typing) return;
    typingDot.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [typing, typingDot]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * typingDot.value }],
    opacity: 0.45 + 0.55 * typingDot.value,
  }));

  const extractMentionedWords = (content: string) => {
    const lc = content.toLowerCase();
    const tokens = (lc.match(/[a-z]{4,}/g) ?? []).filter(Boolean);
    const blocked = new Set(['your', 'into', 'with', 'then', 'this', 'that', 'from', 'will', 'word', 'words']);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const tok of tokens) {
      if (blocked.has(tok) || seen.has(tok)) continue;
      seen.add(tok);
      out.push(tok);
      if (out.length >= 5) break;
    }
    return out;
  };

  const addMentionedToStudyList = async (words: string[]) => {
    const matches = await Promise.all(words.map((word) => repos.words.search(word, {})));
    const ids = matches.map((match) => match[0]?.id).filter(Boolean) as string[];
    ids.forEach(addToStudyList);

    if (!ids.length) {
      hapticNotify(Haptics.NotificationFeedbackType.Warning);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'I could not find exact dictionary matches yet. Try searching the word directly in Dictionary.',
        },
      ]);
      return;
    }

    hapticNotify(Haptics.NotificationFeedbackType.Success);
    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: `Added ${ids.length} ${ids.length === 1 ? 'word' : 'words'} to your memory queue. Review will include them when ready.`,
      },
    ]);
  };

  const send = async (input: string) => {
    const prompt = input.trim();
    if (!prompt || typing) return;
    setText('');
    setTyping(true);
    const nextMessages: TutorMessage[] = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);

    const full = await sendTutorMessage(nextMessages).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return `AI Tutor error: ${msg}`;
    });

    let i = 0;
    const tick = () => {
      i += Math.max(4, Math.ceil(full.length / 90));
      const partial = full.slice(0, i);
      setMessages((m: TutorMessage[]) => {
        const last = m[m.length - 1];
        if (last?.role === 'assistant' && last.content.startsWith('STREAM:')) {
          return [...m.slice(0, -1), { role: 'assistant', content: `STREAM:${partial}` }];
        }
        return [...m, { role: 'assistant', content: `STREAM:${partial}` }];
      });
      if (i < full.length) {
        setTimeout(tick, 25);
      } else {
        setTyping(false);
        setMessages((m: TutorMessage[]) => {
          const last = m[m.length - 1];
          if (last?.role === 'assistant' && last.content.startsWith('STREAM:')) {
            return [...m.slice(0, -1), { role: 'assistant', content: full }];
          }
          return m;
        });
      }
    };
    setTimeout(tick, 80);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.wrap} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.coachIdentity}>
              <CoachAvatar />
              <View style={{ flex: 1 }}>
                <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                  Lexora Coach
                </LexText>
                <LexText variant="h2" style={{ marginTop: 2 }}>Practice Studio</LexText>
              </View>
            </View>
            <View style={[styles.statusPill, { borderColor: liveTutor ? t.colors.accentTeal : t.colors.border }]}>
              <View style={[styles.statusDot, { backgroundColor: liveTutor ? t.colors.accentTeal : t.colors.accentAmber }]} />
              <LexText variant="label" style={{ color: liveTutor ? t.colors.accentTeal : t.colors.mutedStrong, fontSize: 10 }}>
                {liveTutor ? 'Live' : 'Demo'}
              </LexText>
            </View>
          </View>

          <Animated.View entering={FadeInDown.duration(420)} style={styles.coachPanel}>
            <LinearGradient
              colors={['rgba(0,229,184,0.18)', 'rgba(123,111,255,0.16)', 'rgba(255,179,71,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.panelTop}>
              <View style={{ flex: 1 }}>
                <LexText variant="label" style={{ color: t.colors.accentAmber }}>
                  Pick a coaching move
                </LexText>
                <LexText variant="title" style={{ marginTop: 5, fontSize: 17 }}>
                  Turn any word into recall, nuance, and real usage.
                </LexText>
              </View>
              <View style={[styles.memoryBadge, { borderColor: dueCount ? t.colors.accentPink : t.colors.accentTeal }]}>
                <LexText variant="h3" style={{ color: dueCount ? t.colors.accentPink : t.colors.accentTeal, fontSize: 20, textAlign: 'center' }}>
                  {dueCount}
                </LexText>
                <LexText variant="label" style={{ fontSize: 8, textAlign: 'center' }}>due</LexText>
              </View>
            </View>
            <View style={styles.promptGrid}>
              {coachPrompts.map((item, index) => (
                <AnimatedPressable
                  key={item.label}
                  entering={FadeInDown.delay(80 + index * 45).duration(360).springify().damping(17)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}: ${item.title}`}
                  onPress={() => {
                    hapticSelection();
                    setText(item.prompt);
                  }}
                  style={({ pressed }) => [
                    styles.promptCard,
                    {
                      borderColor: `${item.color}4D`,
                      backgroundColor: pressed ? `${item.color}22` : 'rgba(255,255,255,0.07)',
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.promptIcon, { borderColor: `${item.color}55`, backgroundColor: `${item.color}18` }]}>
                    <IconSymbol name={item.icon} fallback={item.fallback} color={item.color} size={17} />
                  </View>
                  <LexText variant="label" style={{ color: item.color, fontSize: 9, marginTop: 8 }}>
                    {item.label}
                  </LexText>
                  <LexText variant="title" numberOfLines={2} style={{ marginTop: 4, fontSize: 13, lineHeight: 17 }}>
                    {item.title}
                  </LexText>
                </AnimatedPressable>
              ))}
            </View>
            <View style={styles.coachActions}>
              <CoachAction icon="book.fill" fallback="L" label="Learn" color={t.colors.accentPurple} onPress={() => router.push('/(tabs)/learn')} />
              <CoachAction
                icon="arrow.clockwise"
                fallback="R"
                label={dueCount ? `Review ${dueCount}` : 'Refresher'}
                color={dueCount ? t.colors.accentPink : t.colors.accentTeal}
                onPress={() => router.push('/(tabs)/review')}
              />
              <CoachAction icon="text.book.closed.fill" fallback="D" label="Dictionary" color={t.colors.accentBlue} onPress={() => router.push('/dictionary')} />
            </View>
          </Animated.View>

          <View style={[styles.thread, { borderColor: t.colors.border }]}>
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              ref={(r: ScrollView | null) => {
                scrollRef.current = r;
              }}
              contentContainerStyle={styles.threadContent}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                const streaming = m.role === 'assistant' && m.content.startsWith('STREAM:');
                const content = streaming ? m.content.replace(/^STREAM:/, '') : m.content;
                const mentioned = m.role === 'assistant' ? extractMentionedWords(content) : [];

                return (
                  <Animated.View
                    key={idx}
                    entering={FadeInDown.delay(Math.min(idx, 4) * 25).duration(260)}
                    style={[styles.messageRow, { alignItems: isUser ? 'flex-end' : 'flex-start' }]}
                  >
                    {!isUser ? (
                      <View style={styles.messageMeta}>
                        <CoachAvatar size={28} />
                        <LexText variant="label" style={{ color: t.colors.mutedStrong, fontSize: 9 }}>
                          Coach
                        </LexText>
                      </View>
                    ) : null}
                    <MessageBubble
                      isUser={isUser}
                      content={content}
                      mentioned={mentioned}
                      onAskWord={(word) => setText(`Tell me more about ${word}`)}
                      onAddWords={() => addMentionedToStudyList(mentioned)}
                    />
                  </Animated.View>
                );
              })}

              {typing ? (
                <View style={{ alignItems: 'flex-start' }}>
                  <View style={styles.messageMeta}>
                    <CoachAvatar size={28} />
                    <LexText variant="label" style={{ color: t.colors.mutedStrong, fontSize: 9 }}>
                      Thinking
                    </LexText>
                  </View>
                  <View style={[styles.bubble, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <Animated.View style={[styles.dot, dotStyle]} />
                      <Animated.View style={[styles.dot, dotStyle, { opacity: 0.6 }]} />
                      <Animated.View style={[styles.dot, dotStyle, { opacity: 0.45 }]} />
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
            {chips.map((c, index) => (
              <AnimatedPressable
                key={c}
                entering={FadeInDown.delay(120 + index * 30).duration(300)}
                accessibilityRole="button"
                onPress={() => {
                  hapticSelection();
                  setText(c);
                }}
                style={[styles.chip, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.045)' }]}
              >
                <LexText variant="body" numberOfLines={1} style={{ fontSize: 12 }}>
                  {c}
                </LexText>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.inputBar, { borderTopColor: t.colors.border, backgroundColor: t.colors.bgElevated }]}>
          <View style={[styles.inputShell, { borderColor: text.trim() ? t.colors.accentTeal : t.colors.border }]}>
            <IconSymbol name="sparkles" fallback="AI" color={text.trim() ? t.colors.accentTeal : t.colors.mutedStrong} size={16} />
            <TextInput
              accessibilityLabel="Ask Lexora AI Tutor"
              value={text}
              onChangeText={setText}
              placeholder="Ask for examples, quizzes, grammar..."
              placeholderTextColor={t.colors.muted}
              style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
              onSubmitEditing={() => send(text)}
            />
          </View>
          <Button title={typing ? 'Wait' : 'Send'} onPress={() => send(text)} disabled={!text.trim().length || typing} style={{ width: 82, height: 46 }} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CoachAvatar({ size = 48 }: { size?: number }) {
  const t = useTheme();
  return (
    <LinearGradient
      colors={[t.colors.accentTeal, t.colors.accentPurple]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.36),
        },
      ]}
    >
      <LexText variant="title" style={{ color: 'white', fontSize: Math.max(13, size * 0.34), fontFamily: t.font.heading.bold }}>
        L
      </LexText>
    </LinearGradient>
  );
}

function MessageBubble({
  isUser,
  content,
  mentioned,
  onAskWord,
  onAddWords,
}: {
  isUser: boolean;
  content: string;
  mentioned: string[];
  onAskWord: (word: string) => void;
  onAddWords: () => void;
}) {
  const t = useTheme();
  return (
    <View
      accessibilityLabel={`${isUser ? 'You' : 'Lexora tutor'} message`}
      style={[
        styles.bubble,
        isUser
          ? { borderColor: 'rgba(0,229,184,0.42)', backgroundColor: 'rgba(0,229,184,0.14)' }
          : { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.055)' },
      ]}
    >
      <Markdown
        style={{
          body: { color: t.colors.text, fontFamily: t.font.body.regular, lineHeight: 21, fontSize: 14 },
          strong: { color: 'white', fontFamily: t.font.body.bold },
          bullet_list: { marginVertical: 4 },
          paragraph: { marginTop: 0, marginBottom: 5 },
        }}
      >
        {content}
      </Markdown>
      {mentioned.length ? (
        <>
          <View style={styles.wordCards}>
            {mentioned.map((w) => (
              <Pressable
                key={w}
                accessibilityRole="button"
                accessibilityLabel={`Ask about ${w}`}
                onPress={() => {
                  hapticSelection();
                  onAskWord(w);
                }}
                style={[styles.wordCard, { borderColor: t.colors.border }]}
              >
                <LexText variant="label" style={{ fontSize: 9, color: t.colors.accentTeal }}>
                  {w}
                </LexText>
              </Pressable>
            ))}
          </View>
          <View style={styles.messageActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onAddWords}
              style={[styles.messageAction, { borderColor: 'rgba(0,229,184,0.28)', backgroundColor: 'rgba(0,229,184,0.08)' }]}
            >
              <IconSymbol name="plus.circle.fill" fallback="+" color={t.colors.accentTeal} size={13} />
              <LexText variant="label" style={{ color: t.colors.accentTeal, fontSize: 9 }}>
                Add words
              </LexText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/review')}
              style={[styles.messageAction, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.035)' }]}
            >
              <IconSymbol name="arrow.clockwise" fallback="R" color={t.colors.mutedStrong} size={13} />
              <LexText variant="label" style={{ color: t.colors.mutedStrong, fontSize: 9 }}>
                Practice
              </LexText>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

function CoachAction({
  icon,
  fallback,
  label,
  color,
  onPress,
}: {
  icon: string;
  fallback: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.coachAction, { borderColor: `${color}44`, backgroundColor: `${color}12` }]}>
      <IconSymbol name={icon} fallback={fallback} color={color} size={14} />
      <LexText variant="label" numberOfLines={1} style={{ color, fontSize: 9 }}>
        {label}
      </LexText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  container: { padding: 16, paddingBottom: 0, flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  coachIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    boxShadow: '0 10px 28px rgba(0,229,184,0.22)',
  },
  statusPill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  coachPanel: {
    marginTop: 12,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 14,
  },
  panelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  memoryBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  promptGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  promptCard: {
    flex: 1,
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  coachAction: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  thread: {
    flex: 1,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  threadContent: {
    padding: 14,
    paddingBottom: 18,
    gap: 14,
  },
  messageRow: { gap: 6 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bubble: {
    maxWidth: '90%',
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: 'continuous',
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  chip: {
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  inputBar: {
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  inputShell: {
    flex: 1,
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.055)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    padding: 0,
    fontSize: 14,
  },
  wordCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  wordCard: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  messageActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  messageAction: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: 'rgba(240,238,255,0.75)' },
});
