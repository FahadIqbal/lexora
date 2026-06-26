import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import {
  BadgeTile,
  CharacterBubble,
  KidAvatar,
  KidButton,
  KidCard,
  kidColors as c,
  KidHeader,
  KidPill,
  KidProgressBar,
  KidScreen,
  LessonCard,
  QuizOption,
} from '../../components/kids/KidKit';
import { LexText } from '../../components/LexText';
import { IconSymbol } from '../../components/IconSymbol';
import { LexoraLottie } from '../../components/LexoraLottie';
import {
  kidBadges,
  kidCategories,
  kidCourses,
  kidProfiles,
  kidPracticeActivities,
  type KidPracticeActivity,
} from '../../data/kidContent';
import { hapticSelection } from '../../utils/haptics';
import { useAppStore } from '../../store/useAppStore';
import { kidCharacters, kidRouteArt } from '../../assets/kidAssets';
import { hasSupabase } from '../../services/env';
import { getSupabase } from '../../services/supabase';
import { upsertUserProfile } from '../../services/supabaseHelpers';
import {
  getActiveKidProfile,
  getContinueLesson,
  getKidDailyPath,
  getKidEnergy,
  getKidBadges,
  getKidCourses,
  getKidFriends,
  getKidLeaderboard,
  getKidLessons,
  getKidMissions,
  getKidPracticeActivities,
  getRecommendedLessons,
  getTotalStars,
} from '../../services/kidLearningService';
import missionPulse from '../../animations/mission-pulse.json';
import wordQuestOrbit from '../../animations/word-quest-orbit.json';

export function KidsHomeScreen() {
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const streakCurrent = useAppStore((s) => s.streakCurrent);
  const child = getActiveKidProfile(kid);
  const continueLesson = getContinueLesson(kid);
  const recommended = getRecommendedLessons(kid);
  const missions = getKidMissions(kid);
  const friends = getKidFriends(kid);
  const leaderboard = getKidLeaderboard(kid, xpTotal);
  const dailyPath = getKidDailyPath(kid);
  const energy = getKidEnergy(kid);
  const selfRank = leaderboard.find((row) => row.name === child.name)?.rank ?? 1;
  const totalXp = child.xp + xpTotal;

  return (
    <KidScreen>
      <KidHeader
        eyebrow={`Hi, ${child.name}`}
        title="Let’s learn English!"
        subtitle="Small wins, fun games, and happy words."
        avatar={child.avatar}
        right={
          <View style={styles.headerChips}>
            <EnergyChip current={energy.current} max={energy.max} />
            <XpChip xp={totalXp} />
          </View>
        }
      />

      <KidCard color={c.purple} style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: c.yellow }}>
            Continue learning
          </LexText>
          <LexText variant="h2" style={{ color: 'white', marginTop: 6, fontSize: 28 }}>
            {continueLesson.title}
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.78)', marginTop: 5 }}>
            {continueLesson.subtitle}
          </LexText>
          <View style={{ marginTop: 16 }}>
            <KidProgressBar progress={continueLesson.progress} color={c.yellow} />
          </View>
          <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
            <KidButton title="Let’s go!" onPress={() => router.push(`/lessons/${continueLesson.id}`)} />
          </View>
        </View>
        <View style={styles.homeRewardArt}>
          <LexoraLottie source={missionPulse} size={118} speed={0.82} />
          <KidPill label={`+${continueLesson.xp} XP`} active color={c.yellow} />
        </View>
      </KidCard>

      <View style={styles.statsRow}>
        <MiniStat icon="🔥" value={`${Math.max(child.streak, streakCurrent)}`} label="day streak" color={c.coralSoft} />
        <MiniStat icon="⭐" value={`Level ${child.level}`} label="word hero" color={c.yellowSoft} />
        <MiniStat icon="🏆" value={`#${selfRank}`} label="league" color={c.mintSoft} />
      </View>

      <SectionTitle title="Today’s adventure path" action="Start" onPress={() => router.push(`/practice/${dailyPath[0].mode}?lesson=${dailyPath[0].lessonId}`)} />
      <View style={{ gap: 10 }}>
        {dailyPath.map((step, index) => (
          <PathStep key={step.id} index={index + 1} {...step} />
        ))}
      </View>

      <SectionTitle title="Daily missions" action="Rewards" onPress={() => router.push('/rewards')} />
      <View style={{ gap: 10 }}>
        {missions.map((mission) => (
          <MissionRow key={mission.id} {...mission} />
        ))}
      </View>

      <SectionTitle title="Vocabulary worlds" action="All" onPress={() => router.push('/(tabs)/learn')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {kidCategories.map((cat) => (
          <Pressable key={cat.id} accessibilityRole="button" onPress={() => router.push('/(tabs)/learn')}>
            <KidCard animated={false} style={[styles.categoryTile, { backgroundColor: `${cat.color}22` }]}>
              <LexText style={{ fontSize: 32, lineHeight: 40 }}>{cat.icon}</LexText>
              <LexText variant="title" style={{ color: c.ink, fontSize: 13, marginTop: 8 }}>
                {cat.label}
              </LexText>
            </KidCard>
          </Pressable>
        ))}
      </ScrollView>

      <SectionTitle title="Recommended lessons" action="See all" onPress={() => router.push('/(tabs)/learn')} />
      {recommended.map((lesson) => (
        <LessonCard
          key={lesson.id}
          title={lesson.title}
          subtitle={lesson.subtitle}
          icon={lesson.icon}
          color={lesson.color}
          progress={lesson.progress}
          locked={lesson.locked}
          onPress={() => router.push(`/lessons/${lesson.id}`)}
        />
      ))}

      <SectionTitle title="Friends" action="Challenge" onPress={() => router.push('/(tabs)/social')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {friends.map((friend) => (
          <KidCard key={friend.id} animated={false} style={styles.friendBubble}>
            <KidAvatar label={friend.avatar} />
            <LexText variant="title" style={{ color: c.ink, fontSize: 13, marginTop: 8 }}>
              {friend.name}
            </LexText>
          </KidCard>
        ))}
      </ScrollView>
    </KidScreen>
  );
}

export function KidsOnboardingScreen() {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: 'Let’s learn with lots of fun!',
      subtitle: 'English lessons with games, stories, songs, and stars.',
      icon: kidRouteArt.adventure,
      color: c.purple,
    },
    {
      title: 'Choose a learning buddy',
      subtitle: 'Kids tap, listen, speak, and read with a friendly guide.',
      icon: kidCharacters.buddy,
      color: c.coral,
    },
    {
      title: 'Parents stay in control',
      subtitle: 'Safe progress, no ads, and calm parent tools.',
      icon: kidRouteArt.parent,
      color: c.mint,
    },
  ];
  const slide = slides[step];

  return (
    <KidScreen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <KidCard color={slide.color} style={styles.onboardingHero}>
          <LexText variant="h1" style={{ color: 'white', fontSize: 42, lineHeight: 48 }}>
            {slide.title}
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 12, fontSize: 17, lineHeight: 25 }}>
            {slide.subtitle}
          </LexText>
          <View style={styles.onboardingArt}>
            <LexoraLottie source={wordQuestOrbit} size={188} speed={0.9} />
            <View style={styles.onboardingIconBadge}>
              <LexText style={{ fontSize: 38, lineHeight: 48 }}>{slide.icon}</LexText>
            </View>
          </View>
        </KidCard>
        <View>
          <View style={styles.dots}>
            {slides.map((_, index) => (
              <View key={index} style={[styles.dot, { backgroundColor: index === step ? c.purple : c.line }]} />
            ))}
          </View>
          <KidButton
            title={step === slides.length - 1 ? 'Create profile' : 'Next'}
            onPress={() => {
              if (step === slides.length - 1) router.replace('/child-profiles');
              else setStep((value) => value + 1);
            }}
          />
          <View style={{ height: 10 }} />
          <KidButton title="Parent sign in" color={c.sky} onPress={() => router.push('/auth')} />
        </View>
      </View>
    </KidScreen>
  );
}

export function KidsAuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInKidParent = useAppStore((s) => s.signInKidParent);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const isSignup = mode === 'signup';
  const syncEnabled = hasSupabase();
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6 && (!isSignup || name.trim().length >= 2);

  const submit = async () => {
    if (!valid || submitting) {
      setError(isSignup ? 'Add a parent name, valid email, and 6+ character password.' : 'Use a valid email and 6+ character password.');
      return;
    }

    const parentName = isSignup ? name.trim() : email.split('@')[0] || 'Parent';
    setSubmitting(true);
    setError(null);
    try {
      if (syncEnabled) {
        const supabase = getSupabase();
        const result =
          mode === 'signup'
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        const userId = result.data.user?.id ?? result.data.session?.user?.id;
        if (userId) {
          await upsertUserProfile({ id: userId, display_name: parentName, daily_goal_words: dailyGoalWords }).catch(() => null);
        }
        signInKidParent({ email, name: parentName, provider: 'supabase', userId });
      } else {
        signInKidParent({ email, name: parentName, provider: 'local' });
      }
      router.replace(isSignup ? '/child-profiles' : '/parent');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Account request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KidScreen>
      <KidHeader
        eyebrow="Parent account"
        title={isSignup ? 'Create a safe family space' : 'Welcome back, grown-up'}
        subtitle="Short setup, child-safe profiles, and parent controls before kids start learning."
        avatar={kidCharacters.guardian}
      />

      <KidCard color={c.purple} style={styles.authHero}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: c.yellow }}>
            No ads. No public chat. Parent-first controls.
          </LexText>
          <LexText variant="h2" style={{ color: 'white', marginTop: 8 }}>
            Unlock your child’s learning world
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 8 }}>
            Save streaks, badges, offline lessons, and progress reports.
          </LexText>
        </View>
        <CharacterBubble mood="star" text={kidRouteArt.rewards} />
      </KidCard>

      <View style={styles.authToggle}>
        <KidPill label="Sign in" active={mode === 'signin'} onPress={() => setMode('signin')} />
        <KidPill label="Create account" active={mode === 'signup'} color={c.mint} onPress={() => setMode('signup')} />
      </View>

      <KidCard>
        <SectionMini title={isSignup ? 'Family details' : 'Parent sign in'} />
        {isSignup ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Parent name"
            placeholderTextColor={c.muted}
            accessibilityLabel="Parent name"
            style={styles.parentInput}
          />
        ) : null}
        <View style={{ height: 10 }} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={c.muted}
          accessibilityLabel="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.parentInput}
        />
        <View style={{ height: 10 }} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={c.muted}
          accessibilityLabel="Password"
          secureTextEntry
          style={styles.parentInput}
        />
        <View style={{ marginTop: 16 }}>
          <KidButton
            title={isSignup ? 'Create child profiles' : 'Open parent dashboard'}
            disabled={!valid || submitting}
            onPress={submit}
          />
        </View>
        {error ? (
          <LexText variant="muted" style={{ color: c.danger, marginTop: 10 }}>
            {error}
          </LexText>
        ) : null}
      </KidCard>

      <KidCard animated={false} color={c.mintSoft}>
        {['Kids never need to type passwords', 'Purchases and settings stay behind the parent gate', 'Offline lesson cache keeps practice available'].map((item) => (
          <View key={item} style={styles.authHintRow}>
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>✓</LexText>
            <LexText variant="muted" style={{ color: c.ink, flex: 1 }}>
              {item}
            </LexText>
          </View>
        ))}
      </KidCard>

      <KidButton
        title="Use private local account"
        color={c.sky}
        onPress={() => {
          const localEmail = email.trim() || 'parent@local.lexora';
          const localName = name.trim() || localEmail.split('@')[0] || 'Parent';
          signInKidParent({ email: localEmail, name: localName, provider: 'local' });
          router.replace('/child-profiles');
        }}
      />
    </KidScreen>
  );
}

export function KidsLearnScreen() {
  const kid = useAppStore((s) => s.kid);
  const [active, setActive] = useState('all');
  const courses = getKidCourses(kid);
  const allLessons = getKidLessons(kid);
  const lessons = active === 'all' ? allLessons : allLessons.filter((lesson) => lesson.courseId === active || lesson.type === active);

  return (
    <KidScreen>
      <KidHeader eyebrow="Choose your course" title="Learning worlds" subtitle="Pick a colorful path and keep collecting stars." avatar="🌈" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 16 }}>
        <KidPill label="All" active={active === 'all'} onPress={() => setActive('all')} />
        {courses.map((course) => (
          <KidPill key={course.id} label={course.title} active={active === course.id} color={course.color} onPress={() => setActive(course.id)} />
        ))}
      </ScrollView>

      {courses.map((course) => (
        <Pressable key={course.id} accessibilityRole="button" onPress={() => setActive(course.id)}>
          <KidCard color={course.color} style={styles.courseCard}>
            <View style={{ flex: 1 }}>
              <LexText style={{ fontSize: 38, lineHeight: 48 }}>{course.icon}</LexText>
              <LexText variant="h3" style={{ color: 'white', marginTop: 8 }}>
                {course.title}
              </LexText>
              <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
                {course.subtitle}
              </LexText>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <KidPill label={`${course.minutes} min`} active color="rgba(255,255,255,0.24)" />
                <KidPill label={course.level} active color="rgba(255,255,255,0.24)" />
              </View>
            </View>
            <KidProgressBar progress={course.progress} color={c.yellow} />
          </KidCard>
        </Pressable>
      ))}

      <SectionTitle title="English lesson list" />
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          title={lesson.title}
          subtitle={lesson.subtitle}
          icon={lesson.icon}
          color={lesson.color}
          progress={lesson.progress}
          locked={lesson.locked}
          onPress={() => router.push(`/lessons/${lesson.id}`)}
        />
      ))}
    </KidScreen>
  );
}

export function KidsLessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const kid = useAppStore((s) => s.kid);
  const lesson = getKidLessons(kid).find((item) => item.id === id) ?? getKidLessons(kid)[0];
  const course = kidCourses.find((item) => item.id === lesson.courseId) ?? kidCourses[0];

  return (
    <KidScreen>
      <KidHeader eyebrow={course.title} title={lesson.title} subtitle={lesson.subtitle} avatar={lesson.icon} />
      <KidCard color={lesson.color} style={styles.detailHero}>
        <CharacterBubble mood={lesson.type === 'listening' ? 'listen' : lesson.type === 'reading' ? 'read' : 'star'} text={`${lesson.xp} XP`} />
        <View style={{ flex: 1 }}>
          <LexText variant="h2" style={{ color: 'white', fontSize: 30 }}>
            Ready for a fun lesson?
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 8 }}>
            Big cards, audio, speaking, reading, and friendly feedback.
          </LexText>
        </View>
      </KidCard>

      <KidCard>
        <SectionMini title="Lesson activities" />
        {[
          ['Vocabulary', 'Match pictures to words', 'vocabulary'],
          ['Listening', 'Tap what you hear', 'listening'],
          ['Speaking', 'Say the answer out loud', 'speaking'],
          ['Reading', 'Read and choose the meaning', 'reading'],
          ['Grammar Quiz', 'Build the best sentence', 'grammar'],
          ['Story Mode', 'Play through a tiny story', 'story'],
        ].map(([title, subtitle, mode]) => (
          <Pressable key={mode} accessibilityRole="button" onPress={() => router.push(`/practice/${mode}?lesson=${lesson.id}`)} style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: `${lesson.color}22` }]}>
              <LexText style={{ fontSize: 22, lineHeight: 30 }}>{mode === 'speaking' ? '🎤' : mode === 'listening' ? '🎧' : mode === 'story' ? '📖' : '⭐'}</LexText>
            </View>
            <View style={{ flex: 1 }}>
              <LexText variant="title" style={{ color: c.ink }}>
                {title}
              </LexText>
              <LexText variant="muted" style={{ color: c.muted, fontSize: 13 }}>
                {subtitle}
              </LexText>
            </View>
            <LexText variant="title" style={{ color: c.purple }}>→</LexText>
          </Pressable>
        ))}
      </KidCard>

      <KidButton
        title={lesson.locked ? 'Earn 3 stars to unlock' : 'Start lesson'}
        icon="play.fill"
        disabled={lesson.locked}
        onPress={() => router.push(`/practice/${lesson.type}?lesson=${lesson.id}`)}
      />
    </KidScreen>
  );
}

export function KidsPracticeScreen() {
  const { mode, lesson } = useLocalSearchParams<{ mode?: string; lesson?: string }>();
  const kid = useAppStore((s) => s.kid);
  const recordKidLessonCompletion = useAppStore((s) => s.recordKidLessonCompletion);
  const recordKidPracticeAnswer = useAppStore((s) => s.recordKidPracticeAnswer);
  const currentLesson = getKidLessons(kid).find((item) => item.id === lesson) ?? getKidLessons(kid)[0];
  const energy = getKidEnergy(kid);
  const selectedMode = String(mode ?? currentLesson.type);
  const activities = getKidPracticeActivities(selectedMode);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const activity = activities[index % activities.length];
  const done = Boolean(selected);
  const ok = selected === activity.answer;

  const stars = Math.max(1, Math.min(3, correctCount + (ok ? 1 : 0)));
  const choose = (answer: string) => {
    if (done) return;
    hapticSelection();
    setSelected(answer);
    const correct = answer === activity.answer;
    recordKidPracticeAnswer(correct);
    if (correct) setCorrectCount((value) => value + 1);
  };

  if (complete) {
    return (
      <KidScreen>
        <KidHeader eyebrow="Lesson complete" title="Amazing work!" subtitle="You earned stars, XP, and a new badge." avatar="🎉" />
        <KidCard color={c.purple} style={{ alignItems: 'center', gap: 14 }}>
          <CelebrationBurst />
          <LexText variant="h2" style={{ color: 'white' }}>
            +{currentLesson.xp} XP
          </LexText>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{'⭐'.repeat(stars)}</LexText>
          <KidPill label="Badge unlocked" active color={c.yellow} />
        </KidCard>
        <KidButton title="Next lesson" onPress={() => router.push('/(tabs)/learn')} />
        <KidButton title="Back home" color={c.mint} onPress={() => router.push('/(tabs)/home')} />
      </KidScreen>
    );
  }

  return (
    <KidScreen>
      <View style={{ paddingTop: 10 }}>
        <KidHeader
          eyebrow={formatPracticeMode(selectedMode)}
          title={currentLesson.title}
          avatar={currentLesson.icon}
          right={
            <View style={styles.headerChips}>
              <EnergyChip current={energy.current} max={energy.max} />
              <TimerPill />
            </View>
          }
        />
        <View style={{ marginTop: 18 }}>
          <KidProgressBar progress={(index + 1) / activities.length} color={currentLesson.color} />
        </View>
        <KidCard color={currentLesson.color} style={styles.quizCard}>
          <KidPill label={formatPracticeMode(activity.kind)} active color="rgba(255,255,255,0.24)" />
          <LexText variant="h2" style={{ color: 'white', marginTop: 18, textAlign: 'center' }}>
            {activity.prompt}
          </LexText>
          {activity.passage ? (
            <View style={styles.practicePassage}>
              <LexText variant="title" style={{ color: c.ink, textAlign: 'center', lineHeight: 25 }}>
                {activity.passage}
              </LexText>
            </View>
          ) : null}
          <LexText style={{ fontSize: 68, lineHeight: 82, textAlign: 'center', marginTop: 12 }}>{activity.visual}</LexText>
          <View style={{ marginTop: 12, alignSelf: 'center' }}>
            <KidButton
              title={activity.kind === 'speak' ? 'Hear model' : 'Play audio'}
              icon="speaker.wave.2.fill"
              onPress={() => Speech.speak(activity.audioText)}
            />
          </View>
        </KidCard>

        <PracticeInteraction activity={activity} selected={selected} done={done} ok={ok} onChoose={choose} />

        {done ? (
          <KidCard color={ok ? c.mintSoft : c.coralSoft} style={{ marginTop: 12 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {ok ? 'Great job! 🎉' : `Good try. ${activity.hint}`}
            </LexText>
            <View style={styles.explainBox}>
              <LexText variant="label" style={{ color: c.purple }}>
                Why?
              </LexText>
              <LexText variant="muted" style={{ color: c.ink, marginTop: 4 }}>
                {activity.explanation}
              </LexText>
            </View>
          </KidCard>
        ) : null}

        <View style={{ marginTop: 16, paddingBottom: 10 }}>
          <KidButton
            title={index >= activities.length - 1 ? 'Finish lesson' : 'Next'}
            disabled={!done}
            onPress={() => {
              if (index >= activities.length - 1) {
                recordKidLessonCompletion({
                  lessonId: currentLesson.id,
                  xp: currentLesson.xp,
                  stars,
                  correctCount: correctCount + (ok ? 1 : 0),
                  attemptCount: activities.length,
                });
                setComplete(true);
              }
              else {
                setIndex((value) => value + 1);
                setSelected(null);
              }
            }}
          />
        </View>
      </View>
    </KidScreen>
  );
}

function PracticeInteraction({
  activity,
  selected,
  done,
  ok,
  onChoose,
}: {
  activity: KidPracticeActivity;
  selected: string | null;
  done: boolean;
  ok: boolean;
  onChoose: (answer: string) => void;
}) {
  if (activity.kind === 'match' && activity.pairs?.length) {
    return (
      <View style={styles.matchPanel}>
        <View style={styles.matchGrid}>
          {activity.pairs.map((pair) => (
            <View key={pair.word} style={styles.matchTile}>
              <LexText style={{ fontSize: 32, lineHeight: 40 }}>{pair.visual}</LexText>
              <LexText variant="label" style={{ color: c.muted }}>
                picture
              </LexText>
            </View>
          ))}
        </View>
        <View style={styles.optionsGrid}>
          {activity.options.map((option) => (
            <QuizOption
              key={option}
              label={option}
              selected={selected === option}
              correct={done && option === activity.answer}
              wrong={done && selected === option && !ok}
              onPress={() => onChoose(option)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (activity.kind === 'speak') {
    return (
      <KidCard animated={false} style={styles.speakPanel}>
        <IconSymbol name="mic.fill" fallback="M" color={c.coral} size={28} />
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            Say: {activity.audioText}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 4 }}>
            Listen first, say it out loud, then choose how you did.
          </LexText>
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          {activity.options.map((option) => (
            <QuizOption
              key={option}
              label={option}
              selected={selected === option}
              correct={done && option === activity.answer}
              wrong={done && selected === option && !ok}
              onPress={() => onChoose(option)}
            />
          ))}
        </View>
      </KidCard>
    );
  }

  return (
    <View style={styles.optionsGrid}>
      {activity.options.map((option) => (
        <QuizOption
          key={option}
          label={option}
          selected={selected === option}
          correct={done && option === activity.answer}
          wrong={done && selected === option && !ok}
          onPress={() => onChoose(option)}
        />
      ))}
    </View>
  );
}

export function KidsProfilesScreen() {
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const selectKidProfile = useAppStore((s) => s.selectKidProfile);

  return (
    <KidScreen>
      <KidHeader eyebrow="Family account" title="Who is learning?" subtitle="Choose a child profile or add a new learner." avatar="👨‍👩‍👧" />
      {kidProfiles.map((profile) => (
        <Pressable
          key={profile.id}
          accessibilityRole="button"
          accessibilityState={{ selected: kid.activeProfileId === profile.id }}
          onPress={() => {
            selectKidProfile(profile.id);
            router.replace('/(tabs)/home');
          }}
        >
          <KidCard style={styles.profileRow}>
            <KidAvatar label={profile.avatar} size={64} />
            <View style={{ flex: 1 }}>
              <LexText variant="h3" style={{ color: c.ink }}>
                {profile.name}
              </LexText>
              <LexText variant="muted" style={{ color: c.muted }}>
                Age {profile.age} · {profile.streak} day streak
              </LexText>
              <KidProgressBar progress={(profile.xp + (kid.activeProfileId === profile.id ? xpTotal : 0)) / 900} color={c.purple} />
            </View>
            <XpChip xp={profile.xp + (kid.activeProfileId === profile.id ? xpTotal : 0)} />
          </KidCard>
        </Pressable>
      ))}
      <KidButton title="Manage child profiles" icon="plus" onPress={() => router.push('/parent')} />
    </KidScreen>
  );
}

export function KidsRewardsScreen() {
  const kid = useAppStore((s) => s.kid);
  const streakCurrent = useAppStore((s) => s.streakCurrent);
  const badges = getKidBadges(kid);
  const totalStars = getTotalStars(kid);

  return (
    <KidScreen>
      <KidHeader eyebrow="Rewards" title="Badges & stars" subtitle="Celebrate wins and unlock new adventures." avatar="🏆" />
      <KidCard color={c.yellow}>
        <LexText variant="h2" style={{ color: c.ink }}>
          You have {Math.max(1, streakCurrent)} streak day{Math.max(1, streakCurrent) === 1 ? '' : 's'}!
        </LexText>
        <LexText variant="muted" style={{ color: c.ink, marginTop: 6 }}>
          {totalStars} stars collected across English worlds.
        </LexText>
        <KidProgressBar progress={Math.min(1, totalStars / 12)} color={c.purple} />
      </KidCard>
      <SectionTitle title="My badges" />
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <BadgeTile key={badge.id} icon={badge.icon} title={badge.title} locked={!badge.unlocked} progress={badge.progress} />
        ))}
      </View>
    </KidScreen>
  );
}

export function KidsSocialScreen() {
  const [tab, setTab] = useState<'world' | 'friends'>('world');
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const recordKidFriendChallenge = useAppStore((s) => s.recordKidFriendChallenge);
  const rows = tab === 'world' ? getKidLeaderboard(kid, xpTotal) : getKidFriends(kid).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <KidScreen>
      <KidHeader eyebrow="Leaderboard" title="My ranking" subtitle="Friendly challenges only. No ads, no pressure." avatar="🏅" />
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 16 }}>
        <KidPill label="World" active={tab === 'world'} onPress={() => setTab('world')} />
        <KidPill label="Friends" active={tab === 'friends'} color={c.mint} onPress={() => setTab('friends')} />
      </View>
      {rows.map((row) => (
        <KidCard key={row.name} style={styles.rankRow}>
          <LexText variant="h3" style={{ color: c.purple, width: 34 }}>
            {row.rank}
          </LexText>
          <KidAvatar label={row.avatar} />
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {row.name}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted }}>
              {row.streak} streak
            </LexText>
          </View>
          {'challenged' in row ? (
            <FriendChallengePill challenged={Boolean(row.challenged)} onChallenge={recordKidFriendChallenge} />
          ) : (
            <XpChip xp={row.xp} />
          )}
        </KidCard>
      ))}
    </KidScreen>
  );
}

function FriendChallengePill({ challenged, onChallenge }: { challenged: boolean; onChallenge: () => void }) {
  return (
    <KidPill
      label={challenged ? 'Challenged' : 'Challenge'}
      active={challenged}
      color={challenged ? c.mint : c.yellow}
      onPress={challenged ? undefined : onChallenge}
    />
  );
}

export function KidsProgressScreen() {
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const streakCurrent = useAppStore((s) => s.streakCurrent);
  const getWeeklyWordsLearned = useAppStore((s) => s.getWeeklyWordsLearned);
  const child = getActiveKidProfile(kid);
  const totalStars = getTotalStars(kid);
  const badges = getKidBadges(kid);
  const weeklyWords = getWeeklyWordsLearned();

  return (
    <KidScreen>
      <KidHeader eyebrow="Profile" title={`${child.name}’s progress`} subtitle="Parent-friendly learning snapshot." avatar={child.avatar} right={<KidButton title="Parent" onPress={() => router.push('/parent')} />} />
      <View style={styles.statsRow}>
        <MiniStat icon="⭐" value={`${child.xp + xpTotal}`} label="XP" color={c.yellowSoft} />
        <MiniStat icon="🔥" value={`${Math.max(child.streak, streakCurrent)}`} label="streak" color={c.coralSoft} />
        <MiniStat icon="📚" value={`${totalStars}`} label="stars" color={c.mintSoft} />
      </View>
      <KidCard>
        <SectionMini title="Level progress" />
        <KidProgressBar progress={Math.min(1, (child.xp + xpTotal) / 900)} color={c.purple} />
        <LexText variant="muted" style={{ color: c.muted, marginTop: 10 }}>
          {Math.max(0, 900 - child.xp - xpTotal)} XP to Level {child.level + 1}
        </LexText>
      </KidCard>
      <SectionTitle title="Weekly learning" />
      <View style={styles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View key={`${day}-${index}`} style={[styles.dayDot, { backgroundColor: weeklyWords[index] > 0 ? c.mint : c.lilac }]}>
            <LexText variant="label" style={{ color: weeklyWords[index] > 0 ? 'white' : c.muted }}>
              {day}
            </LexText>
          </View>
        ))}
      </View>
      <SectionTitle title="Achievements" action="See all" onPress={() => router.push('/rewards')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {badges.slice(0, 4).map((badge) => (
          <BadgeTile key={badge.id} icon={badge.icon} title={badge.title} locked={!badge.unlocked} progress={badge.progress} />
        ))}
      </ScrollView>
    </KidScreen>
  );
}

export function KidsParentDashboardScreen() {
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const passKidParentGate = useAppStore((s) => s.passKidParentGate);
  const [gateAnswer, setGateAnswer] = useState('');
  const child = getActiveKidProfile(kid);
  const lessons = getKidLessons(kid);
  const completedLessons = lessons.filter((lesson) => lesson.progress >= 1).length;
  const attempts = Object.values(kid.lessonProgress).reduce((sum, item) => sum + item.attemptCount, 0);
  const correct = Object.values(kid.lessonProgress).reduce((sum, item) => sum + item.correctCount, 0);
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
  const gatePassed = Boolean(kid.parentGatePassedAt);

  return (
    <KidScreen>
      <KidHeader eyebrow="Parent area" title="Learning dashboard" subtitle="A calm place for grown-ups to review progress and safety." avatar="🔐" />
      <KidCard>
        <SectionMini title="Parent gate" />
        <LexText variant="muted" style={{ color: c.muted }}>
          Solve the quick grown-up check before changing purchases, settings, or content controls.
        </LexText>
        <View style={{ marginTop: 14 }}>
          <TextInput
            value={gateAnswer}
            onChangeText={setGateAnswer}
            placeholder="Type 12 + 3"
            placeholderTextColor={c.muted}
            keyboardType="number-pad"
            accessibilityLabel="Parent gate answer"
            style={styles.parentInput}
          />
          <View style={{ marginTop: 10 }}>
            <KidButton
              title={gatePassed ? 'Parent gate unlocked' : 'Unlock parent tools'}
              color={gatePassed ? c.mint : c.yellow}
              disabled={!gatePassed && gateAnswer.trim() !== '15'}
              onPress={passKidParentGate}
            />
          </View>
        </View>
      </KidCard>
      <View style={styles.statsRow}>
        <MiniStat icon="⭐" value={`${child.xp + xpTotal}`} label="total XP" color={c.sky} />
        <MiniStat icon="✅" value={`${accuracy}%`} label="accuracy" color={c.mintSoft} />
        <MiniStat icon="📥" value={`${lessons.length}`} label="offline" color={c.yellowSoft} />
      </View>
      <KidCard>
        <SectionMini title={`${child.name}'s learning controls`} />
        {[
          [`${completedLessons}/${lessons.length} lessons complete`, '/(tabs)/learn'],
          ['Create or edit lesson content', '/admin'],
          ['Review vocabulary practice', '/(tabs)/review'],
        ].map(([item, href]) => (
          <Pressable key={item} style={styles.activityRow} onPress={() => router.push(href as never)} disabled={!gatePassed && href === '/admin'}>
            <LexText variant="title" style={{ color: c.ink, flex: 1 }}>
              {item}
            </LexText>
            <LexText variant="title" style={{ color: c.purple }}>→</LexText>
          </Pressable>
        ))}
      </KidCard>
    </KidScreen>
  );
}

export function KidsAdminTeacherScreen() {
  const [search, setSearch] = useState('');
  const kid = useAppStore((s) => s.kid);
  const lessons = getKidLessons(kid);
  const drafts = useMemo(
    () => lessons.filter((lesson) => lesson.title.toLowerCase().includes(search.trim().toLowerCase())),
    [lessons, search]
  );
  const readyCount = lessons.filter((lesson) => !lesson.locked).length;

  return (
    <KidScreen>
      <KidHeader eyebrow="Teacher studio" title="Content manager" subtitle="Create, review, and publish kid-safe English lessons." avatar="👩‍🏫" />
      <KidCard color={c.purple}>
        <LexText variant="h2" style={{ color: 'white' }}>
          {readyCount} lessons ready
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
          Vocabulary, listening, speaking, reading, grammar, and stories.
        </LexText>
        <View style={styles.adminActions}>
          <KidButton title="New lesson" onPress={() => router.push('/admin/words')} />
          <KidButton title="Categories" color={c.sky} onPress={() => router.push('/admin/categories')} />
        </View>
      </KidCard>
      <KidCard>
        <SectionMini title="Search content" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Find lesson, word, or category..."
          placeholderTextColor={c.muted}
          style={styles.parentInput}
        />
      </KidCard>
      <SectionTitle title="Lesson drafts" />
      {drafts.map((lesson) => (
        <KidCard key={lesson.id} style={styles.adminLessonRow}>
          <View style={[styles.activityIcon, { backgroundColor: `${lesson.color}22` }]}>
            <LexText style={{ fontSize: 22, lineHeight: 30 }}>{lesson.icon}</LexText>
          </View>
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {lesson.title}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted }}>
              {lesson.type} · {lesson.xp} XP · kid-safe
            </LexText>
          </View>
          <KidPill label={lesson.locked ? 'Locked' : 'Live'} active color={lesson.locked ? c.coral : c.mint} />
        </KidCard>
      ))}
    </KidScreen>
  );
}

export function KidsReviewScreen() {
  const reviewActivities = kidPracticeActivities.filter((activity) => activity.mode === 'vocabulary' || activity.mode === 'grammar').slice(0, 5);

  return (
    <KidScreen>
      <KidHeader eyebrow="Review" title="Warm up your words" subtitle="Quick, gentle recall before learning more." avatar="🔁" />
      <KidCard color={c.mint}>
        <LexText variant="h2" style={{ color: 'white' }}>
          {reviewActivities.length} activities ready
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
          Review cards adapt to what your child remembers.
        </LexText>
        <View style={{ marginTop: 16 }}>
          <KidButton title="Start review" onPress={() => router.push('/practice/vocabulary?lesson=animals-1')} />
        </View>
      </KidCard>
      {reviewActivities.map((q) => (
        <KidCard key={q.id} style={styles.reviewPreview}>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{q.visual}</LexText>
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {q.answer}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted }}>
              {q.hint}
            </LexText>
          </View>
        </KidCard>
      ))}
    </KidScreen>
  );
}

export function KidsGamesScreen() {
  const kid = useAppStore((s) => s.kid);
  const lessons = getKidLessons(kid);
  const gameModes = [
    { title: 'Listening Pop', subtitle: 'Hear a word and tap the picture', icon: '🎧', mode: 'listening' },
    { title: 'Speaking Star', subtitle: 'Say the answer out loud', icon: '🎤', mode: 'speaking' },
    { title: 'Grammar Garden', subtitle: 'Choose the best sentence', icon: '🌱', mode: 'grammar' },
    { title: 'Story Island', subtitle: 'Read and unlock the ending', icon: '🏝️', mode: 'story' },
  ].map((item) => {
    const lessonForMode = lessons.find((lessonItem) => lessonItem.type === item.mode) ?? lessons.find((lessonItem) => !lessonItem.locked) ?? lessons[0];
    return { ...item, lessonId: lessonForMode.id, progress: lessonForMode.progress };
  });
  const dailyGame = gameModes[0];

  return (
    <KidScreen>
      <KidHeader eyebrow="Play" title="Daily challenge" subtitle="Games that make English practice feel alive." avatar="🎮" />
      <KidCard color={c.coral} style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: c.yellow }}>
            Today’s game
          </LexText>
          <LexText variant="h2" style={{ color: 'white', marginTop: 6 }}>
            {dailyGame.title}
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
            {dailyGame.subtitle}
          </LexText>
          <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
            <KidButton title="Play now" onPress={() => router.push(`/practice/${dailyGame.mode}?lesson=${dailyGame.lessonId}`)} />
          </View>
        </View>
        <CharacterBubble mood="star" />
      </KidCard>
      <SectionTitle title="Game modes" />
      {gameModes.map(({ title, subtitle, icon, mode, lessonId, progress }) => (
        <LessonCard
          key={mode}
          title={title}
          subtitle={subtitle}
          icon={icon}
          color={mode === 'grammar' ? c.mint : mode === 'speaking' ? c.coral : c.purple}
          progress={progress}
          onPress={() => router.push(`/practice/${mode}?lesson=${lessonId}`)}
        />
      ))}
    </KidScreen>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <LexText variant="h3" style={{ color: c.ink }}>
        {title}
      </LexText>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <LexText variant="label" style={{ color: c.purple }}>
            {action}
          </LexText>
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionMini({ title }: { title: string }) {
  return (
    <LexText variant="title" style={{ color: c.ink, fontSize: 18, marginBottom: 12 }}>
      {title}
    </LexText>
  );
}

function MiniStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <KidCard animated={false} color={color} style={styles.miniStat}>
      <LexText style={{ fontSize: 24, lineHeight: 32 }}>{icon}</LexText>
      <LexText variant="h3" style={{ color: c.ink, marginTop: 4 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ color: c.muted, fontSize: 9 }}>
        {label}
      </LexText>
    </KidCard>
  );
}

function PathStep({
  index,
  title,
  subtitle,
  icon,
  color,
  mode,
  lessonId,
  progress,
}: {
  index: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  mode: string;
  lessonId: string;
  progress: number;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/practice/${mode}?lesson=${lessonId}`)}>
      <KidCard animated={false} style={styles.pathStep}>
        <View style={[styles.pathNumber, { backgroundColor: color }]}>
          <LexText variant="label" style={{ color: 'white' }}>
            {index}
          </LexText>
        </View>
        <LexText style={{ fontSize: 28, lineHeight: 36 }}>{icon}</LexText>
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            {title}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>
            {subtitle}
          </LexText>
          <View style={{ marginTop: 8 }}>
            <KidProgressBar progress={progress} color={color} />
          </View>
        </View>
        <LexText variant="title" style={{ color: c.purple }}>→</LexText>
      </KidCard>
    </Pressable>
  );
}

function XpChip({ xp }: { xp: number }) {
  return (
    <View style={styles.xpChip}>
      <LexText style={{ fontSize: 16 }}>⭐</LexText>
      <LexText variant="title" style={{ color: c.ink, fontSize: 14 }}>
        {xp}
      </LexText>
    </View>
  );
}

function EnergyChip({ current, max }: { current: number; max: number }) {
  const low = current <= Math.ceil(max * 0.24);
  return (
    <View style={[styles.energyChip, { backgroundColor: low ? c.coralSoft : c.mintSoft }]}>
      <LexText style={{ fontSize: 15, lineHeight: 20 }}>{low ? '💛' : '⚡'}</LexText>
      <LexText variant="title" style={{ color: c.ink, fontSize: 13 }}>
        {current}
      </LexText>
    </View>
  );
}

function MissionRow({ title, reward, progress, icon }: { title: string; reward: string; progress: number; icon: string }) {
  return (
    <KidCard animated={false} style={styles.missionRow}>
      <LexText style={{ fontSize: 28, lineHeight: 36 }}>{icon}</LexText>
      <View style={{ flex: 1 }}>
        <LexText variant="title" style={{ color: c.ink }}>
          {title}
        </LexText>
        <KidProgressBar progress={progress} color={c.purple} />
      </View>
      <KidPill label={reward} active color={c.yellow} />
    </KidCard>
  );
}

function TimerPill() {
  return (
    <View style={styles.timerPill}>
      <IconSymbol name="timer" fallback="T" color={c.ink} size={15} />
      <LexText variant="title" style={{ color: c.ink, fontSize: 13 }}>
        03:31
      </LexText>
    </View>
  );
}

function formatPracticeMode(mode: string) {
  return mode
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function CelebrationBurst() {
  const scale = useSharedValue(0.6);
  const spin = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 160 });
    spin.value = withTiming(1, { duration: 900 });
  }, [scale, spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { rotate: `${spin.value * 12}deg` }] }));
  return (
    <Animated.View style={style}>
      <LexText style={{ fontSize: 86 }}>🎊</LexText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroCard: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  homeRewardArt: {
    width: 126,
    minHeight: 138,
    borderRadius: 34,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  onboardingHero: { flex: 1, marginTop: 16, marginBottom: 18 },
  onboardingArt: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  onboardingIconBadge: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  authHero: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  authToggle: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 12 },
  authHintRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  headerChips: { alignItems: 'flex-end', gap: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniStat: { flex: 1, minHeight: 112, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  categoryTile: { width: 112, minHeight: 116, alignItems: 'center', justifyContent: 'center' },
  friendBubble: { width: 88, alignItems: 'center', padding: 12 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pathStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pathNumber: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  xpChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: c.yellowSoft,
    borderWidth: 1,
    borderColor: c.line,
  },
  energyChip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: c.line,
  },
  courseCard: { marginBottom: 14, minHeight: 176, gap: 16 },
  detailHero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 18 },
  activityRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingVertical: 12,
  },
  activityIcon: { width: 46, height: 46, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quizCard: { marginTop: 18, alignItems: 'center' },
  practicePassage: {
    width: '100%',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 14,
    marginTop: 14,
  },
  optionsGrid: { gap: 10, marginTop: 16 },
  matchPanel: { gap: 14, marginTop: 16 },
  matchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  matchTile: {
    width: '47%',
    minHeight: 92,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakPanel: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  explainBox: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    marginTop: 12,
    paddingTop: 10,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  parentInput: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 14,
    color: c.ink,
    backgroundColor: c.appBg,
  },
  adminActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  adminLessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  reviewPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  timerPill: {
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: c.yellow,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
