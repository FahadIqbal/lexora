import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import Markdown from 'react-native-markdown-display';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { seed } from '../data/seed';

export function ChatScreen() {
  const t = useTheme();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content:
        "Hi — I’m your Lexora AI Tutor.\n\nTry:\n- **Use _ephemeral_ in a business email**\n- **Find synonyms for _nuance_**\n- **Quiz me on _meticulous_**",
    },
  ]);
  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  const chips = [
    'Use this in a sentence',
    'Find synonyms',
    'Etymology?',
    'Quiz me',
    'Simpler explanation',
  ];

  const typingDot = useSharedValue(0);
  useEffect(() => {
    if (!typing) return;
    typingDot.value = withRepeat(withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [typing]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * typingDot.value }],
    opacity: 0.45 + 0.55 * typingDot.value,
  }));

  const knownWords = useMemo(() => seed.words.map((w) => w.word.toLowerCase()), []);

  const extractMentionedWords = (content: string) => {
    const lc = content.toLowerCase();
    return knownWords.filter((w: string) => lc.includes(w)).slice(0, 5);
  };

  const send = async (input: string) => {
    const prompt = input.trim();
    if (!prompt) return;
    setText('');
    setMessages((m) => [...m, { role: 'user', content: prompt }]);

    // Mock streaming reply (later: wire to Claude streaming)
    setTyping(true);
    const full =
      `**Coach mode:**\n\n` +
      `Here’s a strong way to think about it:\n\n` +
      `- Meaning: keep it *simple and sharp*.\n` +
      `- Example: “The benefit is **ephemeral**, so we should act quickly.”\n` +
      `- Common mistake: using it like “rare” (it means *short-lived*).\n\n` +
      `Want a 3-question quiz on this word?`;

    let i = 0;
    const chunk = () => {
      i += 6;
      const partial = full.slice(0, i);
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last?.role === 'assistant' && last.content.startsWith('STREAM:')) {
          return [...m.slice(0, -1), { role: 'assistant', content: `STREAM:${partial}` }];
        }
        return [...m, { role: 'assistant', content: `STREAM:${partial}` }];
      });
      if (i < full.length) {
        setTimeout(chunk, 40);
      } else {
        setTyping(false);
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last?.role === 'assistant' && last.content.startsWith('STREAM:')) {
            return [...m.slice(0, -1), { role: 'assistant', content: full }];
          }
          return m;
        });
      }
    };
    setTimeout(chunk, 220);
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 18, flex: 1 }}>
          <LexText variant="h2">AI Tutor</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Beautiful chat UI now; Claude streaming will be wired once your key is ready.
          </LexText>

          <Card style={{ marginTop: 16, flex: 1, padding: 0, overflow: 'hidden' }}>
            <ScrollView
              ref={(r) => {
                scrollRef.current = r;
              }}
              contentContainerStyle={{ padding: 14, paddingBottom: 18, gap: 12 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                const streaming = m.role === 'assistant' && m.content.startsWith('STREAM:');
                const content = streaming ? m.content.replace(/^STREAM:/, '') : m.content;
                const mentioned = m.role === 'assistant' ? extractMentionedWords(content) : [];

                return (
                  <View key={idx} style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <View
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
                              onPress={() => setText(`Tell me more about ${w}`)}
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
                onPress={() => setText(c)}
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
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask anything…"
            placeholderTextColor={t.colors.muted}
            style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
            onSubmitEditing={() => send(text)}
          />
          <Button title="Send" onPress={() => send(text)} disabled={!text.trim().length} style={{ width: 92, height: 44 }} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
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
