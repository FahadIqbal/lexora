import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
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
  kidFeaturePowerUps,
  kidLearningTracks,
  kidOnboardingFocusOptions,
  kidOnboardingSlides,
  kidParentInsights,
  kidProfiles,
  kidPracticeActivities,
  kidReviewSchedule,
  kidTeacherPipelines,
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

      <QuestIslandHero
        childName={child.name}
        lessonTitle={continueLesson.title}
        lessonSubtitle={continueLesson.subtitle}
        lessonProgress={continueLesson.progress}
        lessonXp={continueLesson.xp}
        lessonId={continueLesson.id}
        path={dailyPath}
      />

      <SectionTitle title="Smart power-ups" action="Play" onPress={() => router.push(kidFeaturePowerUps[0].route)} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {kidFeaturePowerUps.map((feature, index) => (
          <FeaturePowerUpCard key={feature.id} feature={feature} index={index} />
        ))}
      </ScrollView>

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
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const slideWidth = Math.max(300, width - 36);
  const heroHeight = Math.min(500, Math.max(420, width * 1.04));
  const slides = kidOnboardingSlides;
  const slide = slides[step];
  const focusChips = kidOnboardingFocusOptions;
  const toggleFocus = (id: string) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((item) => item !== id)
      : [...selectedCategories, id];
    setSelectedCategories(next);
  };
  const goToStep = (nextStep: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, nextStep));
    scrollRef.current?.scrollTo({ x: clamped * slideWidth, animated: true });
    setStep(clamped);
  };

  return (
    <KidScreen scroll={false}>
      <View style={styles.onboardingRoot}>
        <ScrollView
          ref={scrollRef}
          style={styles.onboardingPager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const nextStep = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
            setStep(Math.max(0, Math.min(slides.length - 1, nextStep)));
          }}
        >
          {slides.map((item, index) => (
            <View key={item.title} style={{ width: slideWidth }}>
              <KidCard color={item.color} style={[styles.onboardingHeroV2, { height: heroHeight }]}>
                <View style={styles.onboardingTopRow}>
                  <KidPill label={item.eyebrow} active color="rgba(255,255,255,0.22)" />
                  <KidPill label={`${index + 1}/${slides.length}`} active color={item.accent} />
                </View>
                <LexText variant="h1" style={styles.onboardingTitleV2}>
                  {item.title}
                </LexText>
                <LexText variant="muted" style={styles.onboardingSubtitleV2}>
                  {item.subtitle}
                </LexText>
                <Onboarding3DStage item={item} heroHeight={heroHeight} />
                <View style={styles.onboardingFeatureRail}>
                  {item.features.map((feature, featureIndex) => (
                    <Animated.View
                      key={feature}
                      entering={FadeInDown.delay(80 * featureIndex).duration(360).springify().damping(17)}
                      style={[styles.onboardingFeatureChip, { backgroundColor: featureIndex === 1 ? item.accent : 'rgba(255,255,255,0.20)' }]}
                    >
                      <LexText variant="label" style={{ color: featureIndex === 1 ? c.ink : 'white', fontSize: 10 }}>
                        {feature}
                      </LexText>
                    </Animated.View>
                  ))}
                </View>
                <View style={styles.onboardingChipRow}>
                  {item.chips.map((chip) => (
                    <KidPill key={chip} label={chip} active color="rgba(255,255,255,0.20)" />
                  ))}
                </View>
              </KidCard>
            </View>
          ))}
        </ScrollView>

        <View>
          <View style={styles.dots}>
            {slides.map((_, index) => (
              <Pressable key={index} accessibilityRole="button" onPress={() => goToStep(index)}>
                <View style={[styles.dot, { width: index === step ? 28 : 12, backgroundColor: index === step ? slide.color : c.line }]} />
              </Pressable>
            ))}
          </View>
          {step === slides.length - 1 ? (
            <View style={styles.focusPicker}>
              {focusChips.map((item) => {
                const active = selectedCategories.includes(item.id);
                return (
                  <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => toggleFocus(item.id)}>
                    <View style={[styles.focusChip, { borderColor: active ? c.purple : c.line, backgroundColor: active ? c.lilac : c.paper }]}>
                      <LexText style={{ fontSize: 20, lineHeight: 26 }}>{item.icon}</LexText>
                      <LexText variant="label" style={{ color: active ? c.purple : c.muted }}>
                        {item.label}
                      </LexText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <KidButton
            title={step === slides.length - 1 ? 'Create profile' : 'Next'}
            onPress={() => {
              if (step === slides.length - 1) router.replace('/child-profiles');
              else goToStep(step + 1);
            }}
          />
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth')} style={styles.onboardingParentLink}>
            <LexText variant="label" style={{ color: c.purple }}>
              Parent sign in
            </LexText>
          </Pressable>
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
  const featuredTrack = kidLearningTracks[0];
  const filteredTitle = active === 'all' ? 'Recommended next lessons' : 'Lessons in this path';

  return (
    <KidScreen>
      <KidHeader eyebrow="Choose your course" title="Learning worlds" subtitle="Play through English skills, stories, and review loops." avatar="🌈" />
      <TrackSpotlight track={featuredTrack} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 16 }}>
        <KidPill label="All" active={active === 'all'} onPress={() => setActive('all')} />
        {courses.map((course) => (
          <KidPill key={course.id} label={course.title} active={active === course.id} color={course.color} onPress={() => setActive(course.id)} />
        ))}
      </ScrollView>

      <SectionTitle title="Skill tracks" action="Review" onPress={() => router.push('/(tabs)/review')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {kidLearningTracks.map((track) => (
          <TrackCard key={track.id} track={track} onPress={() => setActive(track.id === 'sentence-garden' ? 'grammar' : track.id === 'sound-lab' ? 'phonics' : 'all')} />
        ))}
      </ScrollView>

      <SectionTitle title="Course worlds" />
      {courses.map((course, index) => (
        <WorldCourseCard key={course.id} course={course} index={index} active={active === course.id} onPress={() => setActive(course.id)} />
      ))}

      <SectionTitle title={filteredTitle} />
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
  const lessonActivities = [
    { title: 'Vocabulary', subtitle: 'Match pictures to words', mode: 'vocabulary', icon: '🧩', color: c.mint },
    { title: 'Listening', subtitle: 'Tap what you hear', mode: 'listening', icon: '🎧', color: c.sky },
    { title: 'Speaking', subtitle: 'Say the answer out loud', mode: 'speaking', icon: '🎤', color: c.coral },
    { title: 'Reading', subtitle: 'Read and choose the meaning', mode: 'reading', icon: '📚', color: c.purple },
    { title: 'Grammar Quiz', subtitle: 'Build the best sentence', mode: 'grammar', icon: '🌱', color: c.mint },
    { title: 'Story Mode', subtitle: 'Play through a tiny story', mode: 'story', icon: '🏝️', color: c.yellow },
  ] as const;

  return (
    <KidScreen>
      <KidHeader eyebrow={course.title} title={lesson.title} subtitle={lesson.subtitle} avatar={lesson.icon} />
      <LessonMissionHero lesson={lesson} course={course} />

      <KidCard style={styles.lessonPlanCard}>
        <View style={styles.lessonPlanTop}>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color: c.purple }}>
              Today’s mission plan
            </LexText>
            <LexText variant="h3" style={{ color: c.ink, marginTop: 3 }}>
              Practice, explain, then celebrate
            </LexText>
          </View>
          <KidPill label={`${lesson.xp} XP`} active color={c.yellow} />
        </View>
        <View style={styles.lessonPlanSteps}>
          {[
            { icon: '👂', title: 'Hear it', body: 'Audio-first prompts help kids connect sound to meaning.' },
            { icon: '🧠', title: 'Explain it', body: 'Every mistake gets a kind “why” moment.' },
            { icon: '🏅', title: 'Win it', body: 'Stars, XP, and badges close the lesson loop.' },
          ].map((step, index) => (
            <View key={step.title} style={styles.lessonPlanStep}>
              <View style={[styles.lessonPlanIcon, { backgroundColor: index === 0 ? c.sky : index === 1 ? c.lilac : c.yellowSoft }]}>
                <LexText style={{ fontSize: 21, lineHeight: 29 }}>{step.icon}</LexText>
              </View>
              <View style={{ flex: 1 }}>
                <LexText variant="title" style={{ color: c.ink, fontSize: 15 }}>
                  {step.title}
                </LexText>
                <LexText variant="muted" style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>
                  {step.body}
                </LexText>
              </View>
            </View>
          ))}
        </View>
      </KidCard>

      <KidCard>
        <SectionMini title="Lesson activities" />
        <View style={styles.activityQuestGrid}>
          {lessonActivities.map(({ title, subtitle, mode, icon, color }) => (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`${title}. ${subtitle}`}
              onPress={() => router.push(`/practice/${mode}?lesson=${lesson.id}`)}
              style={styles.activityQuestCard}
            >
              <View style={[styles.activityIcon, { backgroundColor: `${color}33` }]}>
                <LexText style={{ fontSize: 22, lineHeight: 30 }}>{icon}</LexText>
              </View>
              <View style={{ flex: 1 }}>
                <LexText variant="title" style={{ color: c.ink, fontSize: 15 }}>
                  {title}
                </LexText>
                <LexText variant="muted" style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>
                  {subtitle}
                </LexText>
              </View>
              <View style={[styles.activityArrow, { backgroundColor: mode === lesson.type ? c.yellow : c.lilac }]}>
                <LexText variant="title" style={{ color: c.ink }}>
                  →
                </LexText>
              </View>
            </Pressable>
          ))}
        </View>
      </KidCard>

      <KidCard color={c.lilac} style={styles.buddyTipCard}>
        <KidAvatar label={kidCharacters.buddy} size={50} color="white" />
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            Buddy tip
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 3 }}>
            Start with the highlighted activity, then review the same idea in another mode before words fade.
          </LexText>
        </View>
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

function LessonMissionHero({
  lesson,
  course,
}: {
  lesson: ReturnType<typeof getKidLessons>[number];
  course: (typeof kidCourses)[number];
}) {
  return (
    <KidCard color={lesson.color} style={styles.detailHeroV2}>
      <View style={styles.detailHeroTop}>
        <View style={{ flex: 1 }}>
          <KidPill label={course.level} active color="rgba(255,255,255,0.24)" />
          <LexText variant="h2" style={styles.detailHeroTitle}>
            Ready for today’s quest?
          </LexText>
          <LexText variant="muted" style={styles.detailHeroSubtitle}>
            Finish a short round, get instant feedback, and keep your streak alive.
          </LexText>
        </View>
        <CharacterBubble mood={lesson.type === 'listening' ? 'listen' : lesson.type === 'reading' ? 'read' : 'star'} text={`${lesson.xp} XP`} />
      </View>
      <View style={styles.detailRewardRail}>
        {[
          { icon: '⭐', label: `${lesson.stars}/3 stars` },
          { icon: '🔥', label: 'Streak boost' },
          { icon: '🔁', label: 'Review ready' },
        ].map((item) => (
          <View key={item.label} style={styles.detailRewardPill}>
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>{item.icon}</LexText>
            <LexText variant="label" style={{ color: 'white', fontSize: 10 }}>
              {item.label}
            </LexText>
          </View>
        ))}
      </View>
      <KidProgressBar progress={lesson.progress} color={c.yellow} />
    </KidCard>
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
  const progress = (index + (done ? 1 : 0)) / activities.length;

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
        <KidCard color={c.purple} style={styles.completionHero}>
          <CelebrationBurst />
          <LexText variant="h2" style={{ color: 'white' }}>
            +{currentLesson.xp} XP
          </LexText>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{'⭐'.repeat(stars)}</LexText>
          <KidPill label="Badge unlocked" active color={c.yellow} />
        </KidCard>
        <View style={styles.statsRow}>
          <MiniStat icon="✅" value={`${correctCount}`} label="correct" color={c.mintSoft} />
          <MiniStat icon="🎯" value={`${Math.round((correctCount / activities.length) * 100)}%`} label="accuracy" color={c.yellowSoft} />
          <MiniStat icon="⚡" value={`${energy.current}`} label="energy" color={c.sky} />
        </View>
        <KidCard color={c.lilac} style={styles.buddyTipCard}>
          <KidAvatar label={kidCharacters.buddy} size={50} color="white" />
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              Review unlocked
            </LexText>
            <LexText variant="muted" style={{ color: c.muted, marginTop: 3 }}>
              This lesson now appears in warm-up review so the new words come back at the right time.
            </LexText>
          </View>
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
          <KidProgressBar progress={progress} color={currentLesson.color} />
        </View>
        <PracticeHud index={index} total={activities.length} correctCount={correctCount} color={currentLesson.color} />
        <PracticeCoachStrip activity={activity} done={done} ok={ok} />
        <KidCard color={currentLesson.color} style={styles.quizCard}>
          <KidPill label={formatPracticeMode(activity.kind)} active color="rgba(255,255,255,0.24)" />
          <LexText variant="h2" style={styles.practicePrompt}>
            {activity.prompt}
          </LexText>
          {activity.passage ? (
            <View style={styles.practicePassage}>
              <LexText variant="title" style={{ color: c.ink, textAlign: 'center', lineHeight: 25 }}>
                {activity.passage}
              </LexText>
            </View>
          ) : null}
          <LexText style={styles.practiceVisual}>{activity.visual}</LexText>
          <View style={{ marginTop: 8, alignSelf: 'center' }}>
            <KidButton
              title={activity.kind === 'speak' ? 'Hear model' : 'Play audio'}
              icon="speaker.wave.2.fill"
              onPress={() => Speech.speak(activity.audioText)}
            />
          </View>
        </KidCard>

        <PracticeInteraction activity={activity} selected={selected} done={done} ok={ok} onChoose={choose} />

        {done ? (
          <KidCard color={ok ? c.mintSoft : c.coralSoft} style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <FeedbackBurstIcon ok={ok} />
              <View style={{ flex: 1 }}>
                <LexText variant="title" style={{ color: c.ink }}>
                  {ok ? 'Great job!' : 'Good try'}
                </LexText>
                <LexText variant="muted" style={{ color: c.muted, marginTop: 2 }}>
                  {ok ? 'You chose the best answer.' : activity.hint}
                </LexText>
              </View>
              <KidPill label={ok ? '+10 XP' : 'Try again'} active color={ok ? c.yellow : c.coral} />
            </View>
            <View style={styles.explainBox}>
              <LexText variant="label" style={{ color: c.purple }}>
                Buddy explains
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

function PracticeHud({ index, total, correctCount, color }: { index: number; total: number; correctCount: number; color: string }) {
  return (
    <View style={styles.practiceHud}>
      <View style={[styles.practiceHudPill, { backgroundColor: `${color}22` }]}>
        <LexText variant="label" style={{ color: c.ink }}>
          {index + 1}/{total}
        </LexText>
        <LexText variant="muted" style={{ color: c.muted, fontSize: 11 }}>
          question
        </LexText>
      </View>
      <View style={[styles.practiceHudPill, { backgroundColor: c.yellowSoft }]}>
        <LexText variant="label" style={{ color: c.ink }}>
          {correctCount}
        </LexText>
        <LexText variant="muted" style={{ color: c.muted, fontSize: 11 }}>
          correct
        </LexText>
      </View>
      <View style={[styles.practiceHudPill, { backgroundColor: c.mintSoft }]}>
        <LexText variant="label" style={{ color: c.ink }}>
          +XP
        </LexText>
        <LexText variant="muted" style={{ color: c.muted, fontSize: 11 }}>
          reward
        </LexText>
      </View>
    </View>
  );
}

function PracticeCoachStrip({ activity, done, ok }: { activity: KidPracticeActivity; done: boolean; ok: boolean }) {
  const message = done
    ? ok
      ? 'Nice. Tap Next while the idea is fresh.'
      : 'No stress. Read the hint, then keep going.'
    : activity.kind === 'speak'
      ? 'Listen first, say it out loud, then self-check.'
      : activity.kind === 'match'
        ? 'Look at the picture clue before choosing.'
        : 'Take one careful tap. I will explain after.';

  return (
    <KidCard animated={false} color={c.lilac} style={styles.practiceCoachStrip}>
      <KidAvatar label={kidCharacters.buddy} size={42} color="white" />
      <View style={{ flex: 1 }}>
        <LexText variant="label" style={{ color: c.purple }}>
          Buddy coach
        </LexText>
        <LexText variant="muted" style={{ color: c.ink, marginTop: 2 }}>
          {message}
        </LexText>
      </View>
    </KidCard>
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
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <KidScreen>
      <KidHeader eyebrow="Rewards" title="Badges & stars" subtitle="Celebrate wins and unlock new adventures." avatar="🏆" />
      <KidCard color={c.yellow} style={styles.rewardHero}>
        <View style={{ flex: 1 }}>
          <KidPill label="Treasure room" active color="rgba(255,255,255,0.42)" />
          <LexText variant="h2" style={{ color: c.ink, marginTop: 10 }}>
            {Math.max(1, streakCurrent)} day streak is powering the next badge
          </LexText>
          <LexText variant="muted" style={{ color: c.ink, marginTop: 6 }}>
            {totalStars} stars collected across English worlds.
          </LexText>
        </View>
        <View style={styles.rewardChest}>
          <LexoraLottie source={missionPulse} size={112} speed={0.9} />
          <LexText style={styles.rewardChestIcon}>🏆</LexText>
        </View>
      </KidCard>
      <View style={styles.statsRow}>
        <MiniStat icon="⭐" value={`${totalStars}`} label="stars" color={c.yellowSoft} />
        <MiniStat icon="🏅" value={`${unlockedCount}/${badges.length}`} label="badges" color={c.mintSoft} />
        <MiniStat icon="🔥" value={`${Math.max(1, streakCurrent)}`} label="streak" color={c.coralSoft} />
      </View>
      <KidCard>
        <SectionMini title="Next unlock" />
        <KidProgressBar progress={Math.min(1, totalStars / 12)} color={c.purple} />
        <LexText variant="muted" style={{ color: c.muted, marginTop: 10 }}>
          Earn {Math.max(0, 12 - totalStars)} more stars to unlock a new character reward.
        </LexText>
      </KidCard>
      <SectionTitle title="Badge cabinet" />
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <BadgeTile key={badge.id} icon={badge.icon} title={badge.title} locked={!badge.unlocked} progress={badge.progress} />
        ))}
      </View>
      <SectionTitle title="Character rewards" />
      {kidLearningTracks.map((track) => (
        <KidCard key={track.id} style={styles.characterRewardRow}>
          <View style={[styles.rewardCharacter, { backgroundColor: `${track.color}22` }]}>
            <LexText style={{ fontSize: 28, lineHeight: 36 }}>{track.icon}</LexText>
          </View>
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {track.title} buddy
            </LexText>
            <LexText variant="muted" style={{ color: c.muted, marginTop: 3 }}>
              {track.promise}
            </LexText>
          </View>
          <KidPill label={track.mastery > 0.5 ? 'Unlocked' : 'Locked'} active color={track.mastery > 0.5 ? c.mint : c.lilac} />
        </KidCard>
      ))}
    </KidScreen>
  );
}

export function KidsSocialScreen() {
  const [tab, setTab] = useState<'world' | 'friends'>('world');
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const recordKidFriendChallenge = useAppStore((s) => s.recordKidFriendChallenge);
  const rows = tab === 'world' ? getKidLeaderboard(kid, xpTotal) : getKidFriends(kid).map((item, index) => ({ ...item, rank: index + 1 }));
  const podiumRows = getKidLeaderboard(kid, xpTotal).slice(0, 3);

  return (
    <KidScreen>
      <KidHeader eyebrow="Leaderboard" title="My ranking" subtitle="Friendly challenges only. No ads, no pressure." avatar="🏅" />
      <KidCard color={c.purple} style={styles.socialHero}>
        <View style={{ flex: 1 }}>
          <KidPill label="Weekly league" active color="rgba(255,255,255,0.24)" />
          <LexText variant="h2" style={{ color: 'white', marginTop: 10 }}>
            Friendly races, not pressure
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
            Kids can challenge friends with short practice rounds and no open chat.
          </LexText>
        </View>
        <View style={styles.podiumWrap}>
          {podiumRows.map((row, index) => (
            <View key={row.name} style={[styles.podiumStep, index === 0 ? styles.podiumStepWinner : null]}>
              <KidAvatar label={row.avatar} size={index === 0 ? 52 : 44} color="white" />
              <LexText variant="label" style={{ color: index === 0 ? c.yellow : 'rgba(255,255,255,0.78)', marginTop: 5 }}>
                #{row.rank}
              </LexText>
            </View>
          ))}
        </View>
      </KidCard>
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
  const nextLevelXp = Math.max(0, 900 - child.xp - xpTotal);

  return (
    <KidScreen>
      <KidHeader eyebrow="Profile" title={`${child.name}’s progress`} subtitle="Parent-friendly learning snapshot." avatar={child.avatar} right={<KidButton title="Parent" onPress={() => router.push('/parent')} />} />
      <KidCard color={c.purple} style={styles.profileHeroCard}>
        <KidAvatar label={child.avatar} size={86} color="white" />
        <View style={{ flex: 1 }}>
          <KidPill label={`Level ${child.level}`} active color={c.yellow} />
          <LexText variant="h2" style={{ color: 'white', marginTop: 10 }}>
            {nextLevelXp} XP to the next island
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
            Keep the daily quest short, playful, and consistent.
          </LexText>
        </View>
      </KidCard>
      <View style={styles.statsRow}>
        <MiniStat icon="⭐" value={`${child.xp + xpTotal}`} label="XP" color={c.yellowSoft} />
        <MiniStat icon="🔥" value={`${Math.max(child.streak, streakCurrent)}`} label="streak" color={c.coralSoft} />
        <MiniStat icon="📚" value={`${totalStars}`} label="stars" color={c.mintSoft} />
      </View>
      <KidCard>
        <SectionMini title="Level progress" />
        <KidProgressBar progress={Math.min(1, (child.xp + xpTotal) / 900)} color={c.purple} />
        <LexText variant="muted" style={{ color: c.muted, marginTop: 10 }}>
          {nextLevelXp} XP to Level {child.level + 1}
        </LexText>
      </KidCard>
      <SectionTitle title="Skill mastery" />
      <View style={{ gap: 10 }}>
        {kidLearningTracks.map((track) => (
          <TrackMasteryRow key={track.id} track={track} />
        ))}
      </View>
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
      <SectionTitle title="Parent insights" />
      <View style={{ gap: 10 }}>
        {kidParentInsights.map((insight) => (
          <KidCard key={insight.id} animated={false} style={styles.parentInsightRow}>
            <View style={[styles.parentInsightIcon, { backgroundColor: `${insight.color}22` }]}>
              <LexText style={{ fontSize: 24, lineHeight: 32 }}>{insight.icon}</LexText>
            </View>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: insight.color }}>
                {insight.title}
              </LexText>
              <LexText variant="title" style={{ color: c.ink, marginTop: 2 }}>
                {insight.value}
              </LexText>
              <LexText variant="muted" style={{ color: c.muted, marginTop: 2 }}>
                {insight.detail}
              </LexText>
            </View>
          </KidCard>
        ))}
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
      <SectionTitle title="Publishing pipeline" />
      <View style={styles.pipelineGrid}>
        {kidTeacherPipelines.map((item) => (
          <KidCard key={item.id} animated={false} style={styles.pipelineCard}>
            <View style={[styles.pipelineDot, { backgroundColor: item.color }]} />
            <LexText variant="h2" style={{ color: c.ink }}>
              {item.count}
            </LexText>
            <LexText variant="title" style={{ color: c.ink }}>
              {item.title}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
              {item.detail}
            </LexText>
          </KidCard>
        ))}
      </View>
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
      <SectionTitle title="Memory timing" />
      <View style={{ gap: 10 }}>
        {kidReviewSchedule.map((item) => (
          <KidCard key={item.id} animated={false} style={styles.reviewTimingRow}>
            <View style={[styles.reviewTimingIcon, { backgroundColor: `${item.color}22` }]}>
              <LexText style={{ fontSize: 24, lineHeight: 32 }}>{item.icon}</LexText>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.masteryHeader}>
                <LexText variant="title" style={{ color: c.ink }}>
                  {item.title}
                </LexText>
                <KidPill label={item.label} active color={item.color} />
              </View>
              <LexText variant="muted" style={{ color: c.muted, marginVertical: 6 }}>
                {item.subtitle}
              </LexText>
              <KidProgressBar progress={item.progress} color={item.color} />
            </View>
          </KidCard>
        ))}
      </View>
      <SectionTitle title="Due cards" />
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
      <SectionTitle title="Premium play systems" action="Review" onPress={() => router.push('/(tabs)/review')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {kidFeaturePowerUps.map((feature, index) => (
          <FeaturePowerUpCard key={feature.id} feature={feature} index={index} />
        ))}
      </ScrollView>
      <SectionTitle title="Game modes" />
      <View style={styles.gameModeGrid}>
        {gameModes.map(({ title, subtitle, icon, mode, lessonId, progress }) => (
          <GameModeCard
            key={mode}
            title={title}
            subtitle={subtitle}
            icon={icon}
            color={mode === 'grammar' ? c.mint : mode === 'speaking' ? c.coral : mode === 'listening' ? c.blue : c.purple}
            progress={progress}
            onPress={() => router.push(`/practice/${mode}?lesson=${lessonId}`)}
          />
        ))}
      </View>
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

function Floating3DToken({
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
  const float = useSharedValue(0);
  const spin = useSharedValue(0);
  React.useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 1450 + delay, easing: Easing.inOut(Easing.quad) }), -1, true);
    spin.value = withRepeat(withTiming(1, { duration: 2800 + delay, easing: Easing.linear }), -1, false);
  }, [delay, float, spin]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -9 * float.value }, { rotate: `${spin.value * 12 - 6}deg` }, { scale: 0.96 + float.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.floating3DToken, { backgroundColor: color }, style, animatedStyle]}>
      <LexText style={{ fontSize: 22, lineHeight: 30 }}>{icon}</LexText>
    </Animated.View>
  );
}

function Onboarding3DStage({ item, heroHeight }: { item: (typeof kidOnboardingSlides)[number]; heroHeight: number }) {
  const source = item.lottie === 'missionPulse' ? missionPulse : wordQuestOrbit;
  return (
    <View style={styles.onboardingArtV2}>
      <View style={styles.stageOrbitGlow} />
      <View style={[styles.stageBackPlate, { backgroundColor: item.accent }]} />
      <LinearGradient colors={['rgba(255,255,255,0.96)', 'rgba(255,248,224,0.78)']} style={styles.stage3DPortal}>
        <LexoraLottie source={source} size={Math.min(156, heroHeight * 0.32)} speed={0.86} style={{ opacity: 0.58 }} />
        <View style={[styles.stageMainIcon, { backgroundColor: item.accent }]}>
          <LexText style={{ fontSize: 50, lineHeight: 60 }}>{item.icon}</LexText>
        </View>
      </LinearGradient>
      <Floating3DToken icon="⭐" color={c.yellow} delay={120} style={styles.onboardingTokenOne} />
      <Floating3DToken icon="🎤" color={c.coral} delay={340} style={styles.onboardingTokenTwo} />
      <Floating3DToken icon="🔁" color={c.blue} delay={620} style={styles.onboardingTokenThree} />
    </View>
  );
}

function QuestPortal3D({ xp }: { xp: number }) {
  return (
    <View style={styles.questPortal3D}>
      <View style={styles.questPortalBackPlate} />
      <View style={styles.questPortalFloor} />
      <LexoraLottie source={missionPulse} size={112} speed={0.82} />
      <Floating3DToken icon="⭐" color={c.yellow} delay={140} style={styles.questTokenStar} />
      <Floating3DToken icon="🔊" color={c.blue} delay={420} style={styles.questTokenAudio} />
      <View style={styles.questXpPlate}>
        <LexText variant="label" style={{ color: c.ink }}>
          +{xp} XP
        </LexText>
      </View>
    </View>
  );
}

function FeaturePowerUpCard({ feature, index }: { feature: (typeof kidFeaturePowerUps)[number]; index: number }) {
  const lift = useSharedValue(0);
  React.useEffect(() => {
    lift.value = withRepeat(withTiming(1, { duration: 1700 + index * 160, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [index, lift]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * lift.value }, { rotate: `${index % 2 === 0 ? -1.5 : 1.5}deg` }] }));

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${feature.title}. ${feature.subtitle}`} onPress={() => router.push(feature.route)}>
      <Animated.View entering={FadeInDown.delay(index * 70).duration(380).springify().damping(17)}>
        <Animated.View style={animatedStyle}>
          <KidCard animated={false} color={feature.color} style={styles.featurePowerUpCard}>
            <View style={styles.featurePowerTop}>
              <KidPill label={feature.tag} active color="rgba(255,255,255,0.22)" />
              <View style={[styles.featurePowerCta, { backgroundColor: feature.accent }]}>
                <LexText variant="label" style={{ color: c.ink, fontSize: 10 }}>
                  {feature.cta}
                </LexText>
              </View>
            </View>
            <View style={styles.featurePowerStage}>
              <View style={[styles.featurePowerDisk, { backgroundColor: feature.accent }]} />
              <LexText style={styles.featurePowerIcon}>{feature.icon}</LexText>
              <Floating3DToken icon="+" color="white" delay={index * 180} style={styles.featureMiniToken} />
            </View>
            <LexText variant="h3" style={styles.featurePowerTitle}>
              {feature.title}
            </LexText>
            <LexText variant="muted" numberOfLines={3} style={styles.featurePowerSubtitle}>
              {feature.subtitle}
            </LexText>
          </KidCard>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function FeedbackBurstIcon({ ok }: { ok: boolean }) {
  const scale = useSharedValue(0.82);
  const offset = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 180 });
    offset.value = ok ? 0 : withRepeat(withTiming(7, { duration: 70, easing: Easing.linear }), 4, true);
  }, [ok, offset, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }, { scale: scale.value }, { rotate: ok ? '0deg' : '-3deg' }] }));

  return (
    <Animated.View style={[styles.feedbackBurstIcon, { backgroundColor: ok ? c.yellow : c.coral }, style]}>
      <LexText style={{ fontSize: 25, lineHeight: 33 }}>{ok ? '🎉' : '💡'}</LexText>
    </Animated.View>
  );
}

function TrackSpotlight({ track }: { track: (typeof kidLearningTracks)[number] }) {
  return (
    <KidCard color={track.color} style={styles.trackSpotlight}>
      <View style={{ flex: 1 }}>
        <KidPill label="Featured path" active color="rgba(255,255,255,0.24)" />
        <LexText variant="h2" style={styles.trackSpotlightTitle}>
          {track.title}
        </LexText>
        <LexText variant="muted" style={styles.trackSpotlightText}>
          {track.promise}
        </LexText>
        <View style={styles.trackSpotlightMeta}>
          <KidPill label={`${Math.round(track.mastery * 100)}% mastery`} active color={c.yellow} />
          <KidPill label="Spaced review" active color="rgba(255,255,255,0.24)" />
        </View>
      </View>
      <View style={styles.trackSpotlightArt}>
        <LexoraLottie source={wordQuestOrbit} size={112} speed={0.78} />
        <LexText style={styles.trackSpotlightIcon}>{track.icon}</LexText>
      </View>
    </KidCard>
  );
}

function TrackCard({ track, onPress }: { track: (typeof kidLearningTracks)[number]; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${track.title}. ${track.subtitle}`} onPress={onPress} style={styles.trackCardPressable}>
      <KidCard animated={false} style={styles.trackCard}>
        <LinearGradient colors={[track.color, '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trackIcon}>
          <LexText style={{ fontSize: 32, lineHeight: 40 }}>{track.icon}</LexText>
        </LinearGradient>
        <LexText variant="title" style={{ color: c.ink, marginTop: 10 }}>
          {track.title}
        </LexText>
        <LexText variant="muted" numberOfLines={2} style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
          {track.next}
        </LexText>
        <View style={{ marginTop: 10 }}>
          <KidProgressBar progress={track.mastery} color={track.color} />
        </View>
      </KidCard>
    </Pressable>
  );
}

function WorldCourseCard({
  course,
  index,
  active,
  onPress,
}: {
  course: ReturnType<typeof getKidCourses>[number];
  index: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress}>
      <KidCard color={course.color} style={styles.worldCourseCard}>
        <View style={styles.worldCourseTop}>
          <View style={styles.worldCourseBadge}>
            <LexText variant="label" style={{ color: c.ink }}>
              World {index + 1}
            </LexText>
          </View>
          <KidPill label={`${course.minutes} min`} active color="rgba(255,255,255,0.24)" />
        </View>
        <View style={styles.worldCourseBody}>
          <View style={{ flex: 1 }}>
            <LexText style={styles.worldCourseIcon}>{course.icon}</LexText>
            <LexText variant="h3" style={{ color: 'white', marginTop: 8 }}>
              {course.title}
            </LexText>
            <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
              {course.subtitle}
            </LexText>
          </View>
          <View style={styles.worldCourseProgress}>
            <LexText variant="h3" style={{ color: c.ink }}>
              {Math.round(course.progress * 100)}%
            </LexText>
            <LexText variant="label" style={{ color: c.muted, fontSize: 9 }}>
              complete
            </LexText>
          </View>
        </View>
        <KidProgressBar progress={course.progress} color={c.yellow} />
      </KidCard>
    </Pressable>
  );
}

function TrackMasteryRow({ track }: { track: (typeof kidLearningTracks)[number] }) {
  return (
    <KidCard animated={false} style={styles.trackMasteryRow}>
      <View style={[styles.masteryIcon, { backgroundColor: `${track.color}22` }]}>
        <LexText style={{ fontSize: 24, lineHeight: 32 }}>{track.icon}</LexText>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.masteryHeader}>
          <LexText variant="title" style={{ color: c.ink }}>
            {track.title}
          </LexText>
          <LexText variant="label" style={{ color: track.color }}>
            {Math.round(track.mastery * 100)}%
          </LexText>
        </View>
        <LexText variant="muted" numberOfLines={1} style={{ color: c.muted, marginBottom: 8 }}>
          {track.next}
        </LexText>
        <KidProgressBar progress={track.mastery} color={track.color} />
      </View>
    </KidCard>
  );
}

function GameModeCard({
  title,
  subtitle,
  icon,
  color,
  progress,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  progress: number;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} onPress={onPress} style={styles.gameModePressable}>
      <KidCard animated={false} style={styles.gameModeCard}>
        <LinearGradient colors={[`${color}DD`, '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gameModeArt}>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{icon}</LexText>
        </LinearGradient>
        <LexText variant="title" style={{ color: c.ink, marginTop: 10 }}>
          {title}
        </LexText>
        <LexText variant="muted" numberOfLines={2} style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
          {subtitle}
        </LexText>
        <View style={{ marginTop: 10 }}>
          <KidProgressBar progress={progress} color={color} />
        </View>
      </KidCard>
    </Pressable>
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

function QuestIslandHero({
  childName,
  lessonTitle,
  lessonSubtitle,
  lessonProgress,
  lessonXp,
  lessonId,
  path,
}: {
  childName: string;
  lessonTitle: string;
  lessonSubtitle: string;
  lessonProgress: number;
  lessonXp: number;
  lessonId: string;
  path: ReturnType<typeof getKidDailyPath>;
}) {
  return (
    <KidCard color={c.purple} style={styles.questHero}>
      <View style={styles.questHeroTop}>
        <View style={{ flex: 1 }}>
          <KidPill label="Today’s quest" active color="rgba(255,255,255,0.22)" />
          <LexText variant="h2" style={styles.questTitle}>
            Help {childName} unlock the next island
          </LexText>
          <LexText variant="muted" style={styles.questSubtitle}>
            {lessonTitle} · {lessonSubtitle}
          </LexText>
        </View>
        <QuestPortal3D xp={lessonXp} />
      </View>

      <View style={styles.questMap}>
        <View pointerEvents="none" style={styles.questPathBeam} />
        {path.map((step, index) => {
          const active = index === 1;
          return (
            <Animated.View
              key={step.id}
              entering={FadeInDown.delay(index * 90).duration(360).springify().damping(16)}
              style={styles.questNode}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${step.title}, ${step.subtitle}`}
                onPress={() => router.push(`/practice/${step.mode}?lesson=${step.lessonId}`)}
                style={[styles.questNodePressable, active ? styles.questNodeActive : null]}
              >
                <View style={[styles.questNodeIcon, { backgroundColor: step.color, borderColor: active ? c.yellow : 'rgba(255,255,255,0.58)' }]}>
                  <LexText style={{ fontSize: 25, lineHeight: 33 }}>{step.icon}</LexText>
                </View>
                <LexText variant="label" style={[styles.questNodeLabel, { color: active ? c.yellow : 'rgba(255,255,255,0.78)' }]}>
                  {index === 0 ? 'Review' : index === 1 ? 'Now' : 'Story'}
                </LexText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.questProgressRow}>
        <View style={{ flex: 1 }}>
          <KidProgressBar progress={lessonProgress} color={c.yellow} />
        </View>
        <LexText variant="label" style={{ color: 'rgba(255,255,255,0.82)' }}>
          {Math.round(lessonProgress * 100)}%
        </LexText>
      </View>

      <View style={styles.questActions}>
        <KidButton title="Start quest" onPress={() => router.push(`/lessons/${lessonId}`)} style={{ flex: 1 }} />
        <KidButton
          title="Practice path"
          color={c.sky}
          onPress={() => router.push(`/practice/${path[0].mode}?lesson=${path[0].lessonId}`)}
          style={{ flex: 1 }}
        />
      </View>
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
  questHero: { marginTop: 18, gap: 16, overflow: 'hidden' },
  questHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  questTitle: { color: 'white', marginTop: 10, fontSize: 27, lineHeight: 32 },
  questSubtitle: { color: 'rgba(255,255,255,0.78)', marginTop: 6 },
  questLottie: {
    width: 124,
    minHeight: 144,
    borderRadius: 34,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  questMap: {
    minHeight: 112,
    borderRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    overflow: 'hidden',
  },
  questPathBeam: {
    position: 'absolute',
    left: 34,
    right: 34,
    top: 55,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  questNode: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 7 },
  questNodePressable: { minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 7 },
  questNodeActive: { transform: [{ scale: 1.08 }] },
  questNodeIcon: {
    width: 58,
    height: 58,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    boxShadow: `0 13px 0 rgba(34,35,74,0.14)`,
  },
  questNodeLabel: { textAlign: 'center', fontSize: 10 },
  questProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  questActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  onboardingRoot: { flex: 1, gap: 12 },
  onboardingPager: { flexGrow: 0 },
  onboardingHeroV2: { marginTop: 16, marginBottom: 14, gap: 12, overflow: 'hidden' },
  onboardingTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  onboardingTitleV2: { color: 'white', fontSize: 34, lineHeight: 40, marginTop: 6 },
  onboardingSubtitleV2: { color: 'rgba(255,255,255,0.84)', fontSize: 15, lineHeight: 22 },
  onboardingArtV2: { flex: 1, minHeight: 178, alignItems: 'center', justifyContent: 'center' },
  onboardingFeatureRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  onboardingFeatureChip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  onboardingIconBadgeV2: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 36,
    borderCurve: 'continuous',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingOrbitOne: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.24)',
    left: 28,
    top: 34,
  },
  onboardingOrbitTwo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    right: 34,
    bottom: 36,
  },
  onboardingChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stageOrbitGlow: {
    position: 'absolute',
    width: 218,
    height: 218,
    borderRadius: 109,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ scaleX: 1.14 }],
  },
  stageBackPlate: {
    position: 'absolute',
    width: 154,
    height: 132,
    borderRadius: 42,
    borderCurve: 'continuous',
    opacity: 0.9,
    transform: [{ translateY: 26 }, { rotate: '-7deg' }],
    boxShadow: '0 20px 0 rgba(34,35,74,0.14)',
  },
  stage3DPortal: {
    width: 166,
    minHeight: 156,
    borderRadius: 48,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.82)',
    boxShadow: '0 28px 34px rgba(34,35,74,0.20)',
    overflow: 'hidden',
  },
  stageMainIcon: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 30,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 14px 0 rgba(34,35,74,0.12)',
  },
  floating3DToken: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: `0 12px 18px ${c.shadow}`,
  },
  onboardingTokenOne: { left: 42, top: 22 },
  onboardingTokenTwo: { right: 38, top: 56 },
  onboardingTokenThree: { right: 82, bottom: 12 },
  questPortal3D: {
    width: 132,
    minHeight: 154,
    borderRadius: 36,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    boxShadow: '0 20px 26px rgba(34,35,74,0.18)',
  },
  questPortalBackPlate: {
    position: 'absolute',
    width: 96,
    height: 118,
    borderRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: c.yellow,
    opacity: 0.7,
    transform: [{ translateY: 16 }, { rotate: '-8deg' }],
  },
  questPortalFloor: {
    position: 'absolute',
    width: 106,
    height: 26,
    borderRadius: 999,
    bottom: 16,
    backgroundColor: 'rgba(34,35,74,0.12)',
  },
  questTokenStar: { right: -8, top: 10 },
  questTokenAudio: { left: -10, bottom: 30 },
  questXpPlate: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 11,
    backgroundColor: c.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.10)',
  },
  focusPicker: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  focusChip: {
    width: 104,
    minHeight: 62,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  onboardingParentLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  authHero: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  authToggle: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 12 },
  authHintRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  headerChips: { alignItems: 'flex-end', gap: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniStat: { flex: 1, minHeight: 112, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  featurePowerUpCard: {
    width: 222,
    minHeight: 250,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    boxShadow: '0 18px 28px rgba(71,57,146,0.22)',
  },
  featurePowerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  featurePowerCta: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  featurePowerStage: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  featurePowerDisk: {
    position: 'absolute',
    width: 108,
    height: 74,
    borderRadius: 38,
    borderCurve: 'continuous',
    opacity: 0.95,
    transform: [{ rotate: '-8deg' }, { translateY: 10 }],
    boxShadow: '0 13px 0 rgba(34,35,74,0.13)',
  },
  featurePowerIcon: { fontSize: 58, lineHeight: 68, textAlign: 'center' },
  featureMiniToken: { right: 36, top: 4, width: 34, height: 34, borderRadius: 14 },
  featurePowerTitle: { color: 'white', fontSize: 21, lineHeight: 26, marginTop: 2 },
  featurePowerSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 12, lineHeight: 17, marginTop: 6 },
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
  trackSpotlight: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trackSpotlightTitle: { color: 'white', marginTop: 10, fontSize: 30, lineHeight: 35 },
  trackSpotlightText: { color: 'rgba(255,255,255,0.82)', marginTop: 6 },
  trackSpotlightMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  trackSpotlightArt: {
    width: 120,
    minHeight: 136,
    borderRadius: 34,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackSpotlightIcon: { position: 'absolute', fontSize: 44, lineHeight: 54 },
  trackCardPressable: { width: 166 },
  trackCard: { minHeight: 188 },
  trackIcon: { width: 62, height: 62, borderRadius: 23, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  worldCourseCard: { marginBottom: 14, gap: 16, overflow: 'hidden' },
  worldCourseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  worldCourseBadge: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldCourseBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  worldCourseIcon: { fontSize: 42, lineHeight: 50 },
  worldCourseProgress: {
    width: 82,
    height: 82,
    borderRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 18 },
  detailHeroV2: { marginTop: 18, gap: 16 },
  detailHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailHeroTitle: { color: 'white', fontSize: 30, lineHeight: 35, marginTop: 8 },
  detailHeroSubtitle: { color: 'rgba(255,255,255,0.82)', marginTop: 8 },
  detailRewardRail: { flexDirection: 'row', gap: 8 },
  detailRewardPill: {
    flex: 1,
    minHeight: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 6,
  },
  lessonPlanCard: { gap: 14 },
  lessonPlanTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonPlanSteps: { gap: 10 },
  lessonPlanStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lessonPlanIcon: { width: 42, height: 42, borderRadius: 17, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  activityQuestGrid: { gap: 10 },
  activityQuestCard: {
    minHeight: 76,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: c.appBg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityArrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  buddyTipCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardHero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardChest: {
    width: 112,
    minHeight: 126,
    borderRadius: 34,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardChestIcon: { position: 'absolute', fontSize: 42, lineHeight: 52 },
  characterRewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  rewardCharacter: { width: 54, height: 54, borderRadius: 21, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  socialHero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  podiumWrap: { width: 126, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  podiumStep: {
    width: 36,
    minHeight: 98,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  podiumStepWinner: { width: 44, minHeight: 124, backgroundColor: 'rgba(255,217,61,0.28)' },
  profileHeroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  trackMasteryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  masteryIcon: { width: 52, height: 52, borderRadius: 20, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  masteryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  parentInsightRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  parentInsightIcon: { width: 54, height: 54, borderRadius: 21, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  pipelineGrid: { flexDirection: 'row', gap: 10 },
  pipelineCard: { flex: 1, minHeight: 154 },
  pipelineDot: { width: 28, height: 8, borderRadius: 999, marginBottom: 10 },
  reviewTimingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewTimingIcon: { width: 54, height: 54, borderRadius: 21, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  gameModeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gameModePressable: { width: '47%' },
  gameModeCard: { minHeight: 190 },
  gameModeArt: { width: 68, height: 68, borderRadius: 25, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
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
  quizCard: { marginTop: 12, alignItems: 'center', paddingVertical: 14 },
  practicePrompt: { color: 'white', marginTop: 14, textAlign: 'center', fontSize: 32, lineHeight: 38 },
  practiceVisual: { fontSize: 58, lineHeight: 68, textAlign: 'center', marginTop: 8 },
  practiceHud: { flexDirection: 'row', gap: 8, marginTop: 12 },
  practiceHudPill: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceCoachStrip: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
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
  feedbackCard: { marginTop: 12 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackBurstIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.82)',
    boxShadow: '0 9px 0 rgba(34,35,74,0.10)',
  },
  completionHero: { alignItems: 'center', gap: 14 },
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
