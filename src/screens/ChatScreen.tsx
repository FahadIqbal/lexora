import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconSymbol } from '../components/IconSymbol';
import { useTheme } from '../theme/ThemeProvider';
import Markdown from 'react-native-markdown-display';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { sendTutorMessage, type TutorMessage } from '../services/aiTutor';
import { hasAnthropic } from '../services/env';
import { useAppStore } from '../store/useAppStore';
import { hapticSelection } from '../utils/haptics';

export function ChatScreen() {
  const t = useTheme();
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content:
        "Hi, I’m your Lexora coach.\n\nSend a word, sentence, or goal and I’ll turn it into examples, recall practice, and cleaner usage.",
    },
  ]);
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  const liveTutor = hasAnthropic();
  const topicHint = selectedCategories[0]?.replace(/[-_]/g, ' ') ?? 'daily vocabulary';
  const coachPrompts = useMemo(
    () => [
      {
        label: 'Explain',
        icon: 'text.magnifyingglass',
        fallback: 'E',
        title: 'Make it simple',
        prompt: `Explain a ${proficiency ?? 'B1'} vocabulary word from ${topicHint} in simple terms.`,
        color: t.colors.accentTeal,
      },
      {
        label: 'Apply',
        icon: 'briefcase.fill',
        fallback: 'A',
        title: 'Use at work',
        prompt: 'Use meticulous in a concise business update, then show a warmer alternative.',
        color: t.colors.accentPurple,
      },
      {
        label: 'Recall',
        icon: 'questionmark.circle.fill',
        fallback: 'Q',
        title: 'Quiz me',
        prompt: 'Quiz me on nuance with one multiple-choice question.',
        color: t.colors.accentAmber,
      },
    ],
    [proficiency, t.colors.accentAmber, t.colors.accentPurple, t.colors.accentTeal, topicHint]
  );

  const chips = ['Simpler explanation', 'Find synonyms for nuance', 'Quiz me on meticulous', 'Use ephemeral in a sentence'];

  const typingDot = useSharedValue(0);
  useEffect(() => {
    if (!typing) return;
    typingDot.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [typing]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * typingDot.value }],
    opacity: 0.45 + 0.55 * typingDot.value,
  }));

  const extractMentionedWords = (content: string) => {
    const lc = content.toLowerCase();
    const tokens = (lc.match(/[a-z]{4,}/g) ?? []).filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const tok of tokens) {
      if (seen.has(tok)) continue;
      seen.add(tok);
      out.push(tok);
      if (out.length >= 5) break;
    }
    return out;
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
        <View style={{ padding: 18, flex: 1 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Coach
              </LexText>
              <LexText variant="h2" style={{ marginTop: 2 }}>AI Tutor</LexText>
              <LexText variant="muted" style={{ marginTop: 6 }}>
                Guided coaching for meaning, usage, and recall.
              </LexText>
            </View>
            <View style={[styles.statusPill, { borderColor: liveTutor ? t.colors.accentTeal : t.colors.border }]}>
              <LexText variant="label" style={{ color: liveTutor ? t.colors.accentTeal : t.colors.muted, fontSize: 10 }}>
                {liveTutor ? 'Live' : 'Demo'}
              </LexText>
            </View>
          </View>

          <Animated.View entering={FadeInDown.duration(420)} style={styles.coachPanel}>
            <LinearGradient
              colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LexText variant="label" style={{ color: t.colors.accentTeal }}>
              Coach paths
            </LexText>
            <View style={styles.promptGrid}>
              {coachPrompts.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}: ${item.title}`}
                  onPress={() => {
                    hapticSelection();
                    setText(item.prompt);
                  }}
                  style={({ pressed }) => [
                    styles.promptCard,
                    {
                      borderColor: item.color,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      opacity: pressed ? 0.84 : 1,
                    },
                  ]}
                >
                  <View style={[styles.promptIcon, { borderColor: `${item.color}44`, backgroundColor: `${item.color}14` }]}>
                    <IconSymbol name={item.icon} fallback={item.fallback} color={item.color} size={16} />
                  </View>
                  <LexText variant="label" style={{ color: item.color, fontSize: 9, marginTop: 8 }}>
                    {item.label}
                  </LexText>
                  <LexText variant="title" style={{ marginTop: 4, fontSize: 13 }}>
                    {item.title}
                  </LexText>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Card style={{ marginTop: 16, flex: 1, padding: 0, overflow: 'hidden' }}>
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              ref={(r: ScrollView | null) => {
                scrollRef.current = r;
              }}
              contentContainerStyle={{ padding: 14, paddingBottom: 18, gap: 12 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m: TutorMessage, idx: number) => {
                const isUser = m.role === 'user';
                const streaming = m.role === 'assistant' && m.content.startsWith('STREAM:');
                const content = streaming ? m.content.replace(/^STREAM:/, '') : m.content;
                const mentioned = m.role === 'assistant' ? extractMentionedWords(content) : [];

                return (
                  <View key={idx} style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <View
                      accessibilityLabel={`${isUser ? 'You' : 'Lexora tutor'} message`}
                      style={[
                        styles.bubble,
                        isUser
                          ? { borderColor: 'rgba(108,99,255,0.45)', backgroundColor: 'rgba(108,99,255,0.22)' }
                          : { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' },
                      ]}
                    >
                      <Markdown
                        style={{
                          body: { color: t.colors.text, fontFamily: t.font.body.regular, lineHeight: 20 },
                          strong: { color: 'white' },
                          bullet_list: { marginVertical: 4 },
                        }}
                      >
                        {content}
                      </Markdown>
                      {mentioned.length ? (
                        <View style={styles.wordCards}>
                          {mentioned.map((w) => (
                            <Pressable
                              key={w}
                              accessibilityRole="button"
                              accessibilityLabel={`Ask about ${w}`}
                              onPress={() => {
                                hapticSelection();
                                setText(`Tell me more about ${w}`);
                              }}
                              style={[styles.wordCard, { borderColor: t.colors.border }]}
                            >
                              <LexText variant="body" style={{ fontSize: 12 }}>
                                {w}
                              </LexText>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}

              {typing ? (
                <View style={{ alignItems: 'flex-start' }}>
                  <View style={[styles.bubble, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <Animated.View style={[styles.dot, dotStyle]} />
                      <Animated.View style={[styles.dot, dotStyle, { opacity: 0.6 }]} />
                      <Animated.View style={[styles.dot, dotStyle, { opacity: 0.45 }]} />
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
            {chips.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                onPress={() => {
                  hapticSelection();
                  setText(c);
                }}
                style={[styles.chip, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
              >
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {c}
                </LexText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.inputBar, { borderTopColor: t.colors.border, backgroundColor: t.colors.surface }]}>
          <View style={[styles.inputIcon, { borderColor: t.colors.border }]}>
            <IconSymbol name="sparkles" fallback="AI" color={t.colors.accentTeal} size={16} />
          </View>
          <TextInput
            accessibilityLabel="Ask Lexora AI Tutor"
            value={text}
            onChangeText={setText}
            placeholder="Ask anything…"
            placeholderTextColor={t.colors.muted}
            style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
            onSubmitEditing={() => send(text)}
          />
          <Button title={typing ? 'Wait' : 'Send'} onPress={() => send(text)} disabled={!text.trim().length || typing} style={{ width: 92, height: 44 }} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statusPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  coachPanel: {
    marginTop: 14,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 14,
  },
  promptGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  promptCard: {
    flex: 1,
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 10,
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
  inputBar: {
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  inputIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '88%',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  wordCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  wordCard: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: 'rgba(240,238,255,0.75)' },
});
