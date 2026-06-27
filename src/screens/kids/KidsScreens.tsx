import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
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
import {
  KidContentPulseCard,
  KidMissionConstellation,
  KidOnboardingDock,
  type KidMissionNode,
} from '../../components/kids/KidVisualSystem';
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
  kidReviewSchedule,
  kidTeacherPipelines,
  type KidPracticeActivity,
  type KidPracticeMode,
} from '../../data/kidContent';
import { hapticSelection } from '../../utils/haptics';
import { useAppStore } from '../../store/useAppStore';
import { kidCharacters, kidRouteArt } from '../../assets/kidAssets';
import { hasSupabase } from '../../services/env';
import { getSupabase } from '../../services/supabase';
import { upsertUserProfile } from '../../services/supabaseHelpers';
import {
  getActiveKidProfile,
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
import {
  buildKidDictionaryActivity,
  formatKidDictionaryCategory,
  getDailyKidDictionarySet,
  getDictionaryEntriesForLesson,
  getKidDictionaryById,
  getFeaturedKidWords,
  getKidDictionaryCategories,
  searchKidDictionary,
  type KidDictionaryEntry,
} from '../../services/kidDictionaryService';
import {
  getKidPracticeCompletionPlan,
  getKidPracticeDictionaryInsight,
  getKidPracticeModeTheme,
  getKidPracticeRewardSteps,
  getKidPracticeStageSupport,
  type KidPracticeModeTheme,
} from '../../services/kidPracticeExperienceService';
import { getKidPlayStudio, type KidPlayStudioItem } from '../../services/kidPlayStudioService';
import { getKidAlphabetStudio, type KidAlphabetLetter } from '../../services/kidAlphabetStudioService';
import {
  getKidContentCreationEngine,
  type KidContentCreationEngine,
  type KidGeneratedContentItem,
} from '../../services/kidContentCreationEngine';
import {
  buildKidAdaptivePracticeActivities,
  getKidAdaptiveReviewQueue,
  getKidAdaptiveReviewSummary,
  type KidReviewResult,
} from '../../services/kidAdaptiveLearningService';
import { getKidDailyQuest, type KidDailyQuest, type KidDailyQuestStep } from '../../services/kidDailyQuestService';
import {
  getKidParentGateChallenge,
  isKidParentGateOpen,
  verifyKidParentGateAnswer,
} from '../../services/kidParentSafetyService';
import {
  getKidRoleplayScenario,
  getKidRoleplayScenarios,
  type KidRoleplayChoice,
  type KidRoleplayScenario,
} from '../../services/kidRoleplayService';
import missionPulse from '../../animations/mission-pulse.json';
import wordQuestOrbit from '../../animations/word-quest-orbit.json';

export function KidsHomeScreen() {
  const kid = useAppStore((s) => s.kid);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const streakCurrent = useAppStore((s) => s.streakCurrent);
  const child = getActiveKidProfile(kid);
  const recommended = getRecommendedLessons(kid);
  const leaderboard = getKidLeaderboard(kid, xpTotal);
  const energy = getKidEnergy(kid);
  const dailyQuest = getKidDailyQuest(kid);
  const contentEngine = getKidContentCreationEngine(kid);
  const alphabetStudio = getKidAlphabetStudio(kid);
  const selfRank = leaderboard.find((row) => row.name === child.name)?.rank ?? 1;
  const totalXp = child.xp + xpTotal;
  const questNodes = dailyQuest.steps.map(createMissionNode);
  const questComplete = dailyQuest.completion >= 0.98;

  return (
    <KidScreen>
      <HomeCompactHeader childName={child.name} avatar={child.avatar} energy={energy.current} energyMax={energy.max} xp={totalXp} />

      <KidMissionConstellation
        eyebrow={dailyQuest.streakLabel}
        title={dailyQuest.title}
        subtitle={dailyQuest.companionLine}
        nodes={questNodes}
        progress={dailyQuest.completion}
        rewardLabel={`+${dailyQuest.rewardXp} XP`}
        primaryLabel={questComplete ? 'Open chest' : `Start ${dailyQuest.nextStep.label}`}
        onPrimaryPress={() => router.push((questComplete ? '/kids-quest-reward' : dailyQuest.nextStep.route) as never)}
        onNodePress={(node) => router.push(node.route as never)}
      />

      <View style={styles.homeStatsCompactRow}>
        <HomeMetricChip icon="🔥" value={`${Math.max(child.streak, streakCurrent)}`} label="streak" color={c.coralSoft} />
        <HomeMetricChip icon="⭐" value={`Lv ${child.level}`} label="level" color={c.yellowSoft} />
        <HomeMetricChip icon="🏆" value={`#${selfRank}`} label="league" color={c.mintSoft} />
      </View>

      <SectionTitle title="Quick actions" action="Games" onPress={() => router.push('/(tabs)/games')} />
      <View style={styles.homeQuickGrid}>
        {kidFeaturePowerUps.slice(0, 1).map((feature) => (
          <HomeQuickAction
            key={feature.id}
            icon={feature.icon}
            title={formatHomePowerUpTitle(feature.title)}
            subtitle={feature.tag}
            color={feature.color}
            onPress={() => router.push(feature.route)}
          />
        ))}
        <HomeQuickAction
          icon="🎨"
          title="Alphabet"
          subtitle={`${alphabetStudio.dailyLetter.letter} art`}
          color={alphabetStudio.dailyLetter.color}
          onPress={() => router.push('/kids-alphabet-studio')}
        />
        <HomeQuickAction icon="✨" title="Creator" subtitle={`${contentEngine.coverage[1]?.value ?? '0'} packs`} color={c.blue} onPress={() => router.push('/kids-content-studio')} />
        <HomeQuickAction icon="📚" title="Dictionary" subtitle="Hear words" color={c.purple} onPress={() => router.push('/kids-dictionary')} />
      </View>

      <SectionTitle title="Next lessons" action="See all" onPress={() => router.push('/(tabs)/learn')} />
      <View style={{ gap: 10 }}>
        {recommended.slice(0, 2).map((lesson) => (
          <HomeLessonCompact
            key={lesson.id}
            title={lesson.title}
            subtitle={lesson.subtitle}
            icon={lesson.icon}
            color={lesson.color}
            progress={lesson.progress}
            onPress={() => router.push(`/lessons/${lesson.id}`)}
          />
        ))}
      </View>

      <SectionTitle title="Explore" action="Learn" onPress={() => router.push('/(tabs)/learn')} />
      <View style={styles.homeExploreGrid}>
        {kidCategories.slice(0, 6).map((cat) => (
          <HomeExplorePill
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            color={cat.color}
            onPress={() => router.push(cat.id === 'alphabet' ? '/kids-alphabet-studio' : '/(tabs)/learn')}
          />
        ))}
      </View>
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
  const heroHeight = Math.min(470, Math.max(350, width * 0.94));
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
          snapToInterval={slideWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
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

        <KidOnboardingDock
          step={step}
          total={slides.length}
          title={slide.eyebrow}
          color={slide.color}
          accent={slide.accent}
          primaryLabel={step === slides.length - 1 ? 'Create profile' : 'Next'}
          showFocusPicker={step === slides.length - 1}
          focusOptions={focusChips}
          selectedFocusIds={selectedCategories}
          onStepPress={goToStep}
          onBackPress={() => goToStep(step - 1)}
          onParentPress={() => router.push('/auth')}
          onToggleFocus={toggleFocus}
          onPrimaryPress={() => {
            if (step === slides.length - 1) router.replace('/child-profiles');
            else goToStep(step + 1);
          }}
        />
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
  const featuredWords = getFeaturedKidWords(kid, 5);
  const contentEngine = getKidContentCreationEngine(kid);
  const alphabetStudio = getKidAlphabetStudio(kid);
  const filteredTitle = active === 'all' ? 'Recommended next lessons' : 'Lessons in this path';

  return (
    <KidScreen>
      <KidHeader eyebrow="Choose your course" title="Learning worlds" subtitle="Play through English skills, stories, and review loops." avatar="🌈" />
      <TrackSpotlight track={featuredTrack} />
      <KidContentPulseCard
        title={`${alphabetStudio.dailyLetter.letter} Art Studio`}
        subtitle={alphabetStudio.dailyLetter.paintingPrompt}
        icon="🎨"
        color={alphabetStudio.dailyLetter.color}
        accent={alphabetStudio.dailyLetter.accent}
        meta="Trace + paint"
        onPress={() => router.push('/kids-alphabet-studio')}
      />
      <KidContentPulseCard
        title={contentEngine.hero.title}
        subtitle={contentEngine.creatorLine}
        icon={contentEngine.hero.icon}
        color={contentEngine.hero.color}
        accent={contentEngine.hero.accent}
        meta={`${contentEngine.coverage[1]?.value ?? '0'} live packs`}
        onPress={() => router.push('/kids-content-studio')}
      />
      <SectionTitle title="Generated for today" action="Open studio" onPress={() => router.push('/kids-content-studio')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {contentEngine.shelves[0].items.map((item, index) => (
          <GeneratedContentCard key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
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

      <SectionTitle title="Picture dictionary" action="Explore" onPress={() => router.push('/kids-dictionary')} />
      <KidCard color={c.lilac} style={styles.dictionarySpotlight}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: c.purple }}>
            Dynamic word bank
          </LexText>
          <LexText variant="h3" style={{ color: c.ink, marginTop: 5 }}>
            Learn words with audio, examples, rhymes, and mini activities
          </LexText>
        </View>
        <KidButton title="Open" color={c.yellow} onPress={() => router.push('/kids-dictionary')} />
      </KidCard>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {featuredWords.map((entry, index) => (
          <KidDictionaryMiniCard key={entry.id} entry={entry} index={index} />
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

export function KidsDictionaryScreen() {
  const { word } = useLocalSearchParams<{ word?: string }>();
  const kid = useAppStore((s) => s.kid);
  const child = getActiveKidProfile(kid);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const categories = getKidDictionaryCategories();
  const maxLevel = child.age <= 6 ? 1 : child.age <= 8 ? 2 : 3;
  const dailyWords = getDailyKidDictionarySet(kid, 4);
  const selectedWord = getKidDictionaryById(word) ?? dailyWords[0];
  const results = useMemo(
    () => searchKidDictionary(query, { category, maxLevel }),
    [category, maxLevel, query]
  );

  const speak = (entry: KidDictionaryEntry) => {
    hapticSelection();
    Speech.speak(entry.audioText, { rate: 0.86 });
  };

  return (
    <KidScreen>
      <KidHeader
        eyebrow="Picture dictionary"
        title="Words kids can touch, hear, and play"
        subtitle={`${results.length} child-safe words with examples, sounds, rhymes, and mini activities.`}
        avatar="📚"
      />

      <KidCard color={selectedWord.color} style={styles.kidDictionaryHero}>
        <View style={{ flex: 1 }}>
          <KidPill label={formatKidDictionaryCategory(selectedWord.category)} active color="rgba(255,255,255,0.22)" />
          <LexText style={styles.kidDictionaryHeroEmoji}>{selectedWord.emoji}</LexText>
          <LexText variant="h2" style={styles.kidDictionaryHeroWord}>
            {selectedWord.word}
          </LexText>
          <LexText variant="muted" style={styles.kidDictionaryHeroDefinition}>
            {selectedWord.kidDefinition}
          </LexText>
          <View style={styles.dictionaryMetaRail}>
            <KidPill label={selectedWord.phonetic} active color="rgba(255,255,255,0.22)" />
            <KidPill label={selectedWord.syllables.join('-')} active color={c.yellow} />
          </View>
        </View>
        <View style={styles.dictionaryHeroActions}>
          <KidButton title="Hear" color={c.yellow} icon="speaker.wave.2.fill" onPress={() => speak(selectedWord)} />
          <KidButton
            title="Practice"
            color={c.sky}
            onPress={() => {
              const lessonId = selectedWord.lessonIds[0] ?? 'animals-1';
              router.push(`/practice/vocabulary?lesson=${lessonId}`);
            }}
          />
        </View>
      </KidCard>

      <View style={styles.kidDictionarySearch}>
        <IconSymbol name="magnifyingglass" fallback="S" color={query ? c.purple : c.muted} size={17} />
        <TextInput
          accessibilityLabel="Search kids dictionary"
          value={query}
          onChangeText={setQuery}
          placeholder="Search apple, cat, hello..."
          placeholderTextColor={c.muted}
          style={styles.kidDictionaryInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <KidPill label="All words" active={!category} color={c.purple} onPress={() => setCategory(null)} />
        {categories.map((item) => (
          <KidPill
            key={item.id}
            label={`${item.icon} ${item.label}`}
            active={category === item.id}
            color={item.color}
            onPress={() => setCategory(item.id)}
          />
        ))}
      </ScrollView>

      <SectionTitle title="Today’s word set" action="Listen" onPress={() => dailyWords.forEach((entry) => Speech.speak(entry.audioText, { rate: 0.9 }))} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {dailyWords.map((entry, index) => (
          <KidDictionaryMiniCard key={entry.id} entry={entry} index={index} />
        ))}
      </ScrollView>

      <SectionTitle title={query || category ? 'Matching words' : 'All kid words'} />
      <View style={{ gap: 12 }}>
        {results.map((entry, index) => (
          <KidDictionaryWordCard key={entry.id} entry={entry} index={index} onSpeak={() => speak(entry)} />
        ))}
      </View>
    </KidScreen>
  );
}

type PaintStroke = {
  id: string;
  path: string;
  color: string;
  width: number;
  opacity: number;
};

export function KidsAlphabetStudioScreen() {
  const params = useLocalSearchParams<{ letter?: string }>();
  const kid = useAppStore((s) => s.kid);
  const addXp = useAppStore((s) => s.addXp);
  const { width } = useWindowDimensions();
  const studio = useMemo(() => getKidAlphabetStudio(kid), [kid]);
  const routeLetter = normalizeAlphabetId(params.letter);
  const [selectedId, setSelectedId] = useState(routeLetter ?? studio.dailyLetter.id);
  const selected = studio.letters.find((item) => item.id === selectedId) ?? studio.dailyLetter;
  const [selectedColor, setSelectedColor] = useState(selected.color);
  const [toolId, setToolId] = useState<(typeof studio.tools)[number]['id']>('brush');
  const tool = studio.tools.find((item) => item.id === toolId) ?? studio.tools[0];
  const [strokes, setStrokes] = useState<PaintStroke[]>([]);
  const [paintProgress, setPaintProgress] = useState<Record<string, number>>({});
  const [rewarded, setRewarded] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasWidth = Math.min(360, width - 36);
  const canvasHeight = 282;
  const progress = Math.min(1, Math.max(paintProgress[selected.id] ?? 0, strokes.length / 6));
  const complete = progress >= 0.92 || Boolean(rewarded[selected.id]);

  useEffect(() => {
    if (routeLetter) setSelectedId(routeLetter);
  }, [routeLetter]);

  useEffect(() => {
    setSelectedColor(selected.color);
    setStrokes([]);
    setShowCelebration(false);
  }, [selected.id, selected.color]);

  useEffect(() => {
    return () => {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const x = clampCanvas(locationX, canvasWidth);
          const y = clampCanvas(locationY, canvasHeight);
          const stroke: PaintStroke = {
            id: `${Date.now()}-${Math.round(x)}-${Math.round(y)}`,
            path: `M ${x.toFixed(1)} ${y.toFixed(1)}`,
            color: selectedColor,
            width: tool.width,
            opacity: tool.id === 'glow' ? 0.42 : 0.92,
          };
          setStrokes((prev) => [...prev, stroke]);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          if (locationX < 0 || locationY < 0 || locationX > canvasWidth || locationY > canvasHeight) return;
          const x = locationX.toFixed(1);
          const y = locationY.toFixed(1);
          setStrokes((prev) => {
            if (!prev.length) return prev;
            const next = prev.slice();
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, path: `${last.path} L ${x} ${y}` };
            return next;
          });
        },
        onPanResponderRelease: () => {
          setPaintProgress((prev) => ({ ...prev, [selected.id]: Math.min(0.95, (prev[selected.id] ?? 0) + 0.18) }));
        },
      }),
    [canvasHeight, canvasWidth, selected.id, selectedColor, tool.id, tool.width]
  );

  const speakLetter = () => {
    Speech.stop();
    Speech.speak(`${selected.letter}. ${selected.sound}. ${selected.letter} is for ${selected.heroWord.word}. ${selected.heroWord.definition}`, {
      rate: 0.82,
    });
  };

  const finishPainting = () => {
    const alreadyRewarded = rewarded[selected.id];
    setPaintProgress((prev) => ({ ...prev, [selected.id]: 1 }));
    setRewarded((prev) => ({ ...prev, [selected.id]: true }));
    if (!alreadyRewarded) addXp(selected.rewardXp);
    setShowCelebration(true);
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    celebrationTimer.current = setTimeout(() => setShowCelebration(false), 2400);
    Speech.stop();
    Speech.speak(`Beautiful ${selected.letter} painting. ${selected.letter} is for ${selected.heroWord.word}.`, { rate: 0.86 });
  };

  return (
    <KidScreen>
      <KidHeader
        eyebrow="Interactive Learning for Curious Kids"
        title={studio.title}
        subtitle={studio.subtitle}
        avatar="🎨"
        right={<KidPill label={`+${selected.rewardXp} XP`} active color={selected.accent} />}
      />

      <KidContentPulseCard
        title={`${selected.letter} is for ${capitalizeKidWord(selected.heroWord.word)}`}
        subtitle={selected.paintingPrompt}
        icon={selected.heroWord.emoji}
        color={selected.color}
        accent={selected.accent}
        meta={selected.phonics}
        onPress={speakLetter}
      />

      <SectionTitle title="Choose a letter" action={selected.sound} onPress={speakLetter} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9, paddingVertical: 2 }}>
        {studio.letters.map((letter) => (
          <AlphabetLetterTile
            key={letter.id}
            item={letter}
            active={letter.id === selected.id}
            progress={letter.id === selected.id ? progress : paintProgress[letter.id] ?? letter.mastery}
            onPress={() => setSelectedId(letter.id)}
          />
        ))}
      </ScrollView>

      <KidCard style={styles.alphabetBoardCard}>
        <View style={styles.alphabetBoardHeader}>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color: selected.color }}>
              Trace, paint, say
            </LexText>
            <LexText variant="h2" style={{ color: c.ink, marginTop: 2 }}>
              Paint letter {selected.letter}
            </LexText>
          </View>
          <View style={[styles.alphabetSoundBadge, { backgroundColor: `${selected.color}18` }]}>
            <LexText variant="title" style={{ color: selected.color }}>
              {selected.sound}
            </LexText>
          </View>
        </View>

        <View style={[styles.alphabetCanvas, { width: canvasWidth, height: canvasHeight }]} {...panResponder.panHandlers}>
          <View pointerEvents="none" style={styles.alphabetCanvasMotion}>
            <LexoraLottie source={wordQuestOrbit} size={Math.min(214, canvasWidth * 0.64)} speed={0.56} style={{ opacity: 0.22 }} />
          </View>
          <Svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
            <Rect x="0" y="0" width={canvasWidth} height={canvasHeight} rx="28" fill="#FFFFFF" />
            <Rect x="10" y="10" width={canvasWidth - 20} height={canvasHeight - 20} rx="24" fill={`${selected.color}10`} />
            <SvgText
              x={canvasWidth * 0.43}
              y={canvasHeight * 0.68}
              textAnchor="middle"
              fontSize={canvasHeight * 0.73}
              fontWeight="900"
              fill={`${selected.color}18`}
              stroke={`${selected.color}35`}
              strokeWidth="2"
            >
              {selected.letter}
            </SvgText>
            <SvgText
              x={canvasWidth * 0.76}
              y={canvasHeight * 0.72}
              textAnchor="middle"
              fontSize={canvasHeight * 0.45}
              fontWeight="900"
              fill={`${selected.accent}33`}
            >
              {selected.lower}
            </SvgText>
            {strokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeOpacity={stroke.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
          {showCelebration ? (
            <Animated.View pointerEvents="none" entering={FadeInDown.duration(280).springify().damping(14)} style={styles.alphabetCelebrationLayer}>
              <LexoraLottie source={missionPulse} size={168} speed={1.08} />
              <View style={[styles.alphabetCelebrationPill, { backgroundColor: selected.accent }]}>
                <LexText variant="title" style={{ color: c.ink }}>
                  Masterpiece +{selected.rewardXp} XP
                </LexText>
              </View>
            </Animated.View>
          ) : null}
          <View pointerEvents="none" style={styles.alphabetCanvasCoach}>
            <LexText style={{ fontSize: 26, lineHeight: 34 }}>{selected.heroWord.emoji}</LexText>
            <LexText variant="label" numberOfLines={2} style={{ color: c.ink, flex: 1 }}>
              {selected.guide}
            </LexText>
          </View>
        </View>

        <View style={styles.alphabetToolPanel}>
          <View style={styles.alphabetPalette}>
            {studio.palette.map((paint) => (
              <Pressable
                key={paint.id}
                accessibilityRole="button"
                accessibilityLabel={`${paint.label} paint`}
                accessibilityState={{ selected: selectedColor === paint.color }}
                onPress={() => setSelectedColor(paint.color)}
                style={[
                  styles.alphabetPaintSwatch,
                  {
                    backgroundColor: paint.color,
                    borderColor: selectedColor === paint.color ? c.ink : 'rgba(255,255,255,0.88)',
                    transform: [{ scale: selectedColor === paint.color ? 1.08 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.alphabetToolChips}>
            {studio.tools.map((item) => (
              <KidPill key={item.id} label={item.label} active={item.id === tool.id} color={selected.color} onPress={() => setToolId(item.id)} />
            ))}
          </View>
        </View>

        <View style={styles.alphabetProgressRow}>
          <View style={{ flex: 1 }}>
            <KidProgressBar progress={progress} color={complete ? c.mint : selected.color} />
          </View>
          <KidPill label={complete ? 'Masterpiece' : `${Math.round(progress * 100)}%`} active color={complete ? c.mint : selected.color} />
        </View>

        <View style={styles.alphabetActions}>
          <KidButton title="Hear" icon="speaker.wave.2.fill" color={c.sky} onPress={speakLetter} style={{ flex: 1 }} />
          <KidButton title="Clear" color={c.lilac} onPress={() => setStrokes([])} style={{ flex: 1 }} />
          <KidButton title="Done" color={selected.accent} onPress={finishPainting} style={{ flex: 1 }} />
        </View>
      </KidCard>

      <SectionTitle title="Word paintings" action="Speak" onPress={speakLetter} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {selected.words.map((word, index) => (
          <AlphabetWordCard key={word.id} word={word} color={selected.color} index={index} />
        ))}
      </ScrollView>

      <SectionTitle title="Mini mission" />
      <View style={{ gap: 10 }}>
        {selected.mission.map((step, index) => (
          <KidCard key={step.id} animated={false} style={styles.alphabetMissionRow}>
            <View style={[styles.alphabetMissionIcon, { backgroundColor: index === 1 ? selected.accent : `${selected.color}22` }]}>
              <LexText style={{ fontSize: 22, lineHeight: 30 }}>{step.icon}</LexText>
            </View>
            <View style={{ flex: 1 }}>
              <LexText variant="title" style={{ color: c.ink }}>
                {step.title}
              </LexText>
              <LexText variant="muted" style={{ color: c.muted, marginTop: 2 }}>
                {step.body}
              </LexText>
            </View>
          </KidCard>
        ))}
      </View>
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
  const lessonParam = String(lesson ?? '');
  const baseLesson = getKidLessons(kid).find((item) => item.id === lesson) ?? getKidLessons(kid)[0];
  const energy = getKidEnergy(kid);
  const selectedMode = String(mode ?? baseLesson.type);
  const selectedPracticeMode = isKidPracticeMode(selectedMode) ? selectedMode : 'vocabulary';
  const currentLesson =
    lessonParam === 'adaptive-review'
      ? {
          ...baseLesson,
          id: 'adaptive-review',
          title: 'Memory Boost Review',
          subtitle: 'Words before they fade',
          icon: '🔁',
          color: c.purple,
          type: selectedPracticeMode,
          progress: 0,
          xp: 35,
          stars: 0,
          locked: false,
        }
      : baseLesson;
  const modeTheme = getKidPracticeModeTheme(selectedPracticeMode);
  const activities = useMemo(() => {
    if (lessonParam === 'adaptive-review') {
      return buildKidAdaptivePracticeActivities(kid, selectedPracticeMode, 7);
    }
    const base = getKidPracticeActivities(selectedPracticeMode);
    const dictionaryActivities = getDictionaryEntriesForLesson(currentLesson.id).map((entry) => buildKidDictionaryActivity(entry, selectedPracticeMode));
    return dictionaryActivities.length ? [...base, ...dictionaryActivities] : base;
  }, [currentLesson.id, kid, lessonParam, selectedPracticeMode]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<KidReviewResult[]>([]);
  const [complete, setComplete] = useState(false);
  const activity = activities[index % activities.length];
  const done = Boolean(selected);
  const ok = selected === activity.answer;
  const progress = (index + (done ? 1 : 0)) / activities.length;
  const support = getKidPracticeStageSupport(activity);
  const rewardSteps = getKidPracticeRewardSteps(activity);
  const dictionaryInsight = getKidPracticeDictionaryInsight(activity);
  const stars = Math.max(1, Math.min(3, Math.ceil((correctCount / activities.length) * 3)));
  const choose = (answer: string) => {
    if (done) return;
    hapticSelection();
    setSelected(answer);
    const correct = answer === activity.answer;
    recordKidPracticeAnswer(correct);
    if (dictionaryInsight) {
      setSessionResults((items) => [...items, { entryId: dictionaryInsight.entry.id, correct, mode: activity.mode }]);
    }
    if (correct) setCorrectCount((value) => value + 1);
  };

  if (complete) {
    return (
      <PracticeCompletionScreen
        lessonTitle={currentLesson.title}
        lessonIcon={currentLesson.icon}
        lessonXp={currentLesson.xp}
        theme={modeTheme}
        stars={stars}
        correctCount={correctCount}
        total={activities.length}
        energy={energy.current}
      />
    );
  }

  return (
    <KidScreen>
      <View style={{ paddingTop: 10 }}>
        <PracticeQuestHeader
          lessonTitle={currentLesson.title}
          lessonIcon={currentLesson.icon}
          theme={modeTheme}
          index={index}
          total={activities.length}
          progress={progress}
          correctCount={correctCount}
          energyCurrent={energy.current}
          energyMax={energy.max}
        />
        <PracticeRewardTrail steps={rewardSteps} done={done} ok={ok} />
        <PracticeStageCard activity={activity} theme={modeTheme} support={support} insight={dictionaryInsight} />

        <PracticeInteraction activity={activity} selected={selected} done={done} ok={ok} onChoose={choose} />

        {done ? (
          <PracticeFeedbackPanel activity={activity} insight={dictionaryInsight} ok={ok} theme={modeTheme} />
        ) : (
          <PracticeReadyPanel theme={modeTheme} support={support} />
        )}

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
                  correctCount,
                  attemptCount: activities.length,
                  wordResults: sessionResults,
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

function PracticeQuestHeader({
  lessonTitle,
  lessonIcon,
  theme,
  index,
  total,
  progress,
  correctCount,
  energyCurrent,
  energyMax,
}: {
  lessonTitle: string;
  lessonIcon: string;
  theme: KidPracticeModeTheme;
  index: number;
  total: number;
  progress: number;
  correctCount: number;
  energyCurrent: number;
  energyMax: number;
}) {
  return (
    <KidCard color={c.paper} style={styles.practiceQuestHeader}>
      <View style={styles.practiceQuestTop}>
        <LinearGradient colors={[theme.color, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.practiceQuestIcon}>
          <LexText style={{ fontSize: 32, lineHeight: 40 }}>{lessonIcon}</LexText>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: theme.color }}>
            {theme.title}
          </LexText>
          <LexText variant="h3" numberOfLines={2} style={{ color: c.ink, marginTop: 2 }}>
            {lessonTitle}
          </LexText>
        </View>
        <View style={[styles.practiceCountBadge, { backgroundColor: theme.soft, borderColor: `${theme.color}35` }]}>
          <LexText variant="title" style={{ color: theme.color, fontVariant: ['tabular-nums'] }}>
            {index + 1}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, fontSize: 10 }}>
            of {total}
          </LexText>
        </View>
      </View>
      <KidProgressBar progress={progress} color={theme.color} />
      <View style={styles.practiceHeaderMeta}>
        <PracticeMiniChip icon={theme.icon} value={theme.shortTitle} label="mode" color={theme.soft} />
        <PracticeMiniChip icon="✅" value={`${correctCount}`} label="correct" color={c.mintSoft} />
        <EnergyChip current={energyCurrent} max={energyMax} />
        <TimerPill />
      </View>
    </KidCard>
  );
}

function PracticeMiniChip({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[styles.practiceMiniChip, { backgroundColor: color }]}>
      <LexText style={{ fontSize: 15, lineHeight: 20 }}>{icon}</LexText>
      <View>
        <LexText variant="label" style={{ color: c.ink }}>
          {value}
        </LexText>
        <LexText variant="muted" style={{ color: c.muted, fontSize: 11 }}>
          {label}
        </LexText>
      </View>
    </View>
  );
}

function PracticeRewardTrail({ steps, done, ok }: { steps: ReturnType<typeof getKidPracticeRewardSteps>; done: boolean; ok: boolean }) {
  const activeIndex = done ? (ok ? steps.length - 1 : 2) : 1;

  return (
    <View style={styles.practiceRewardTrail}>
      {steps.map((step, stepIndex) => {
        const complete = stepIndex < activeIndex || (done && ok && stepIndex === activeIndex);
        const active = stepIndex === activeIndex && !complete;
        return (
          <Animated.View
            key={step.id}
            entering={FadeInDown.duration(260).delay(stepIndex * 45)}
            style={[
              styles.practiceRewardStep,
              {
                backgroundColor: complete ? c.yellowSoft : active ? c.lilac : c.paper,
                borderColor: complete ? c.yellow : active ? c.purple : c.line,
              },
            ]}
          >
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>{complete ? '✓' : step.icon}</LexText>
            <LexText variant="label" numberOfLines={1} style={{ color: complete || active ? c.ink : c.muted, fontSize: 10 }}>
              {step.label}
            </LexText>
          </Animated.View>
        );
      })}
    </View>
  );
}

function PracticeStageCard({
  activity,
  theme,
  support,
  insight,
}: {
  activity: KidPracticeActivity;
  theme: KidPracticeModeTheme;
  support: ReturnType<typeof getKidPracticeStageSupport>;
  insight: ReturnType<typeof getKidPracticeDictionaryInsight>;
}) {
  return (
    <KidCard color={theme.color} style={styles.practiceStageCard}>
      <Floating3DToken icon={theme.icon} color={theme.accent} delay={120} style={styles.practiceFloatOne} />
      <Floating3DToken icon={insight?.entry.emoji ?? '⭐'} color="rgba(255,255,255,0.88)" delay={420} style={styles.practiceFloatTwo} />
      <View style={styles.practiceStageTop}>
        <KidPill label={support.focus} active color="rgba(255,255,255,0.23)" />
        <KidPill label={theme.skillChips.join(' · ')} active color="rgba(255,255,255,0.16)" />
      </View>
      <View style={styles.practiceStageVisualWrap}>
        <View style={styles.practiceStageGlow} />
        <View style={styles.practiceStageVisual}>
          <LexText style={{ fontSize: 64, lineHeight: 78, textAlign: 'center' }}>{activity.visual}</LexText>
        </View>
      </View>
      <LexText variant="h2" style={styles.practicePromptV2}>
        {activity.prompt}
      </LexText>
      {activity.passage ? (
        <View style={styles.practicePassageV2}>
          <LexText variant="title" style={{ color: c.ink, textAlign: 'center', lineHeight: 25 }}>
            {activity.passage}
          </LexText>
        </View>
      ) : null}
      <View style={styles.practiceAudioPanel}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: 'rgba(255,255,255,0.86)' }}>
            {support.title}
          </LexText>
          <LexText variant="muted" style={{ color: 'white', marginTop: 3, lineHeight: 19 }}>
            {support.body}
          </LexText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={support.actionLabel} onPress={() => Speech.speak(activity.audioText)} style={styles.practiceAudioButton}>
          <IconSymbol name="speaker.wave.2.fill" fallback="A" color={c.ink} size={19} />
        </Pressable>
      </View>
    </KidCard>
  );
}

function PracticeReadyPanel({ theme, support }: { theme: KidPracticeModeTheme; support: ReturnType<typeof getKidPracticeStageSupport> }) {
  return (
    <KidCard animated={false} color={theme.soft} style={styles.practiceReadyPanel}>
      <KidAvatar label={kidCharacters.buddy} size={46} color="white" />
      <View style={{ flex: 1 }}>
        <LexText variant="label" style={{ color: theme.color }}>
          {theme.coachTitle}
        </LexText>
        <LexText variant="muted" style={{ color: c.ink, marginTop: 3, lineHeight: 19 }}>
          {support.body || theme.coachIdle}
        </LexText>
      </View>
    </KidCard>
  );
}

function PracticeFeedbackPanel({
  activity,
  insight,
  ok,
  theme,
}: {
  activity: KidPracticeActivity;
  insight: ReturnType<typeof getKidPracticeDictionaryInsight>;
  ok: boolean;
  theme: KidPracticeModeTheme;
}) {
  return (
    <KidCard color={ok ? c.mintSoft : c.coralSoft} style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <FeedbackBurstIcon ok={ok} />
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            {ok ? 'Great job!' : 'Good try'}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 2 }}>
            {ok ? 'You earned the explanation.' : activity.hint}
          </LexText>
        </View>
        <KidPill label={ok ? '+10 XP' : 'Coach hint'} active color={ok ? c.yellow : c.coral} />
      </View>
      <View style={styles.explainBox}>
        <LexText variant="label" style={{ color: theme.color }}>
          Buddy explains
        </LexText>
        <LexText variant="muted" style={{ color: c.ink, marginTop: 4, lineHeight: 20 }}>
          {activity.explanation}
        </LexText>
      </View>
      {insight ? (
        <View style={styles.practiceInsightBox}>
          <View style={[styles.practiceInsightIcon, { backgroundColor: insight.entry.color }]}>
            <LexText style={{ fontSize: 23, lineHeight: 31 }}>{insight.entry.emoji}</LexText>
          </View>
          <View style={{ flex: 1 }}>
            <LexText variant="label" style={{ color: c.purple }}>
              {insight.title}
            </LexText>
            <LexText variant="muted" style={{ color: c.ink, marginTop: 3, lineHeight: 18 }}>
              {insight.body}
            </LexText>
            <View style={styles.practiceInsightChips}>
              {insight.chips.map((chip) => (
                <KidPill key={chip} label={chip} active color={theme.color} />
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </KidCard>
  );
}

function PracticeCompletionScreen({
  lessonTitle,
  lessonIcon,
  lessonXp,
  theme,
  stars,
  correctCount,
  total,
  energy,
}: {
  lessonTitle: string;
  lessonIcon: string;
  lessonXp: number;
  theme: KidPracticeModeTheme;
  stars: number;
  correctCount: number;
  total: number;
  energy: number;
}) {
  const plan = getKidPracticeCompletionPlan(theme.mode, correctCount, total, lessonXp);

  return (
    <KidScreen>
      <KidHeader eyebrow="Lesson complete" title={plan.masteryLabel} subtitle={theme.completionBody} avatar="🎉" />
      <KidCard color={theme.color} style={styles.completionHeroV2}>
        <Floating3DToken icon={theme.icon} color={theme.accent} style={styles.completionFloatOne} />
        <Floating3DToken icon={lessonIcon} color="rgba(255,255,255,0.88)" delay={360} style={styles.completionFloatTwo} />
        <CelebrationBurst />
        <LexText variant="h2" style={{ color: 'white', textAlign: 'center' }}>
          {theme.completionTitle}
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.86)', textAlign: 'center', lineHeight: 21 }}>
          {plan.celebration}
        </LexText>
        <View style={styles.completionStarRow}>
          {Array.from({ length: 3 }).map((_, starIndex) => (
            <View key={starIndex} style={[styles.completionStar, { opacity: starIndex < stars ? 1 : 0.36 }]}>
              <LexText style={{ fontSize: 24, lineHeight: 32 }}>⭐</LexText>
            </View>
          ))}
        </View>
        <KidPill label={`Review: ${plan.reviewWindow}`} active color={theme.accent} />
      </KidCard>
      <View style={styles.statsRow}>
        {plan.stats.map((item) => (
          <MiniStat key={item.label} icon={item.icon} value={item.value} label={item.label} color={item.color} />
        ))}
      </View>
      <KidCard color={theme.soft} style={styles.buddyTipCard}>
        <KidAvatar label={kidCharacters.buddy} size={50} color="white" />
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            Memory plan ready
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 3, lineHeight: 20 }}>
            {plan.nextFocus} Energy left: {energy}.
          </LexText>
        </View>
      </KidCard>
      <KidButton title="Next lesson" onPress={() => router.push('/(tabs)/learn')} />
      <KidButton title="Back home" color={c.mint} onPress={() => router.push('/(tabs)/home')} />
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
        <View style={styles.speakPanelTop}>
          <View style={styles.speakMicOrb}>
            <IconSymbol name="mic.fill" fallback="M" color={c.coral} size={30} />
          </View>
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              Say: {activity.audioText}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted, marginTop: 4 }}>
              Listen first, say it out loud, then choose how you did.
            </LexText>
          </View>
        </View>
        <View style={styles.speakWaveRow}>
          {[0.35, 0.65, 1, 0.55, 0.82, 0.42].map((height, waveIndex) => (
            <View key={waveIndex} style={[styles.speakWaveBar, { height: 18 + height * 28 }]} />
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

export function KidsRoleplayScreen() {
  const { scenario: scenarioParam } = useLocalSearchParams<{ scenario?: string }>();
  const kid = useAppStore((s) => s.kid);
  const recordKidLessonCompletion = useAppStore((s) => s.recordKidLessonCompletion);
  const scenarios = getKidRoleplayScenarios(kid);
  const scenario = getKidRoleplayScenario(kid, String(scenarioParam ?? scenarios[0]?.id));
  const [turnIndex, setTurnIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<KidRoleplayChoice | null>(null);
  const [answers, setAnswers] = useState<KidReviewResult[]>([]);
  const [complete, setComplete] = useState(false);
  const turn = scenario.turns[turnIndex];
  const progress = (turnIndex + (selectedChoice ? 1 : 0)) / scenario.turns.length;
  const correctCount = answers.filter((answer) => answer.correct).length + (selectedChoice?.correct ? 1 : 0);
  const stars = Math.max(1, Math.min(3, Math.ceil((correctCount / scenario.turns.length) * 3)));

  useEffect(() => {
    setTurnIndex(0);
    setSelectedChoice(null);
    setAnswers([]);
    setComplete(false);
  }, [scenario.id]);

  const choose = (choice: KidRoleplayChoice) => {
    if (selectedChoice) return;
    hapticSelection();
    setSelectedChoice(choice);
    if (choice.spokenText !== '...') Speech.speak(choice.spokenText);
  };

  const continueRoleplay = () => {
    if (!selectedChoice) return;
    const nextAnswers = selectedChoice.entryId
      ? [...answers, { entryId: selectedChoice.entryId, correct: selectedChoice.correct, mode: selectedChoice.skill }]
      : answers;

    if (turnIndex >= scenario.turns.length - 1) {
      setAnswers(nextAnswers);
      recordKidLessonCompletion({
        lessonId: `roleplay-${scenario.id}`,
        xp: scenario.rewardXp,
        stars,
        correctCount,
        attemptCount: scenario.turns.length,
        wordResults: nextAnswers,
      });
      setComplete(true);
      return;
    }

    setAnswers(nextAnswers);
    setTurnIndex((value) => value + 1);
    setSelectedChoice(null);
  };

  if (complete) {
    return (
      <KidScreen>
        <KidHeader eyebrow="Roleplay complete" title="Conversation unlocked" subtitle={scenario.objective} avatar="🎭" />
        <KidCard color={scenario.color} style={styles.roleplayCompleteHero}>
          <CelebrationBurst />
          <LexText variant="h2" style={{ color: 'white', textAlign: 'center' }}>
            +{scenario.rewardXp} XP
          </LexText>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{'⭐'.repeat(stars)}</LexText>
          <KidPill label="Words added to review" active color={scenario.accent} />
        </KidCard>
        <SectionTitle title="Conversation recap" />
        {scenario.turns.map((item, index) => (
          <KidCard key={item.id} animated={false} style={styles.roleplayRecapRow}>
            <View style={[styles.roleplayMiniIcon, { backgroundColor: `${scenario.color}22` }]}>
              <LexText style={{ fontSize: 21, lineHeight: 29 }}>{item.sceneIcon}</LexText>
            </View>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: scenario.color }}>
                Turn {index + 1}
              </LexText>
              <LexText variant="muted" style={{ color: c.ink, marginTop: 3 }}>
                {item.prompt}
              </LexText>
            </View>
          </KidCard>
        ))}
        <KidButton title="Try another roleplay" onPress={() => router.replace('/kids-roleplay')} />
        <KidButton title="Back home" color={c.mint} onPress={() => router.replace('/(tabs)/home')} />
      </KidScreen>
    );
  }

  return (
    <KidScreen>
      <KidHeader
        eyebrow="Buddy Roleplay"
        title={scenario.title}
        subtitle={scenario.subtitle}
        avatar={scenario.icon}
        right={<KidPill label={`${turnIndex + 1}/${scenario.turns.length}`} active color={scenario.accent} />}
      />

      <RoleplayScenarioRail scenarios={scenarios} activeId={scenario.id} />

      <KidCard color={scenario.color} style={styles.roleplayStage}>
        <Floating3DToken icon={scenario.icon} color={scenario.accent} style={styles.roleplayFloatOne} />
        <Floating3DToken icon={turn.sceneIcon} color="rgba(255,255,255,0.88)" delay={280} style={styles.roleplayFloatTwo} />
        <View style={styles.roleplayStageTop}>
          <KidPill label={scenario.location} active color="rgba(255,255,255,0.22)" />
          <KidPill label={`${scenario.rewardXp} XP`} active color={scenario.accent} />
        </View>
        <View style={styles.roleplayCharacterStage}>
          <KidAvatar label={kidCharacters.buddy} size={72} color="white" />
          <View style={styles.roleplaySpeechBubble}>
            <LexText variant="title" style={{ color: c.ink, lineHeight: 23 }}>
              {turn.buddyLine}
            </LexText>
          </View>
        </View>
        <KidProgressBar progress={progress} color={scenario.accent} />
        <LexText variant="h2" style={styles.roleplayPrompt}>
          {turn.prompt}
        </LexText>
        <Pressable accessibilityRole="button" onPress={() => Speech.speak(turn.buddyLine)} style={styles.roleplayAudioButton}>
          <IconSymbol name="speaker.wave.2.fill" fallback="A" color={c.ink} size={18} />
          <LexText variant="title" style={{ color: c.ink, fontSize: 13 }}>
            Hear Buddy
          </LexText>
        </Pressable>
      </KidCard>

      <View style={styles.roleplayChoices}>
        {turn.choices.map((choice) => (
          <RoleplayChoiceCard key={choice.id} choice={choice} selected={selectedChoice?.id === choice.id} done={Boolean(selectedChoice)} onPress={() => choose(choice)} />
        ))}
      </View>

      {selectedChoice ? <RoleplayFeedback choice={selectedChoice} scenario={scenario} /> : <RoleplayFocusWords scenario={scenario} />}

      <View style={{ marginTop: 16 }}>
        <KidButton title={turnIndex >= scenario.turns.length - 1 ? 'Finish roleplay' : 'Continue'} disabled={!selectedChoice} onPress={continueRoleplay} />
      </View>
    </KidScreen>
  );
}

function RoleplayScenarioRail({ scenarios, activeId }: { scenarios: KidRoleplayScenario[]; activeId: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleplayScenarioRail}>
      {scenarios.map((scenario) => {
        const active = scenario.id === activeId;
        return (
          <Pressable key={scenario.id} accessibilityRole="button" onPress={() => router.replace(`/kids-roleplay?scenario=${scenario.id}`)}>
            <View style={[styles.roleplayScenarioPill, { backgroundColor: active ? scenario.color : c.paper, borderColor: active ? scenario.color : c.line }]}>
              <LexText style={{ fontSize: 18, lineHeight: 24 }}>{scenario.icon}</LexText>
              <LexText variant="label" style={{ color: active ? 'white' : c.muted, fontSize: 10 }}>
                {scenario.title}
              </LexText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function RoleplayChoiceCard({
  choice,
  selected,
  done,
  onPress,
}: {
  choice: KidRoleplayChoice;
  selected: boolean;
  done: boolean;
  onPress: () => void;
}) {
  const bg = !done ? c.paper : choice.correct ? c.mintSoft : selected ? c.coralSoft : c.paper;
  const border = !done ? c.line : choice.correct ? c.success : selected ? c.danger : c.line;
  return (
    <Pressable accessibilityRole="button" disabled={done} onPress={onPress} style={[styles.roleplayChoice, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.roleplayChoiceIcon, { backgroundColor: choice.correct && done ? c.mint : c.lilac }]}>
        <LexText style={{ fontSize: 18, lineHeight: 24 }}>{choice.correct && done ? '✓' : '💬'}</LexText>
      </View>
      <View style={{ flex: 1 }}>
        <LexText variant="title" style={{ color: c.ink }}>
          {choice.label}
        </LexText>
        <LexText variant="muted" style={{ color: c.muted, marginTop: 3, fontSize: 12 }}>
          {choice.skill}
        </LexText>
      </View>
    </Pressable>
  );
}

function RoleplayFeedback({ choice, scenario }: { choice: KidRoleplayChoice; scenario: KidRoleplayScenario }) {
  return (
    <KidCard color={choice.correct ? c.mintSoft : c.coralSoft} style={styles.roleplayFeedback}>
      <View style={styles.feedbackHeader}>
        <FeedbackBurstIcon ok={choice.correct} />
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink }}>
            {choice.correct ? 'Great conversation move' : 'Good try'}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 2 }}>
            {choice.response}
          </LexText>
        </View>
        <KidPill label="Explain" active color={scenario.accent} />
      </View>
      <View style={styles.explainBox}>
        <LexText variant="label" style={{ color: scenario.color }}>
          Explain my answer
        </LexText>
        <LexText variant="muted" style={{ color: c.ink, marginTop: 4, lineHeight: 20 }}>
          {choice.explanation}
        </LexText>
      </View>
    </KidCard>
  );
}

function RoleplayFocusWords({ scenario }: { scenario: KidRoleplayScenario }) {
  return (
    <KidCard animated={false} color={c.lilac} style={styles.roleplayFocusCard}>
      <KidAvatar label={kidCharacters.buddy} size={46} color="white" />
      <View style={{ flex: 1 }}>
        <LexText variant="label" style={{ color: scenario.color }}>
          Today’s speaking words
        </LexText>
        <View style={styles.roleplayWordRow}>
          {scenario.focusWords.slice(0, 4).map((entry) => (
            <KidPill key={entry.id} label={`${entry.emoji} ${entry.word}`} active color={entry.color} />
          ))}
        </View>
      </View>
    </KidCard>
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
  const dailyQuest = getKidDailyQuest(kid);
  const dailyQuestClaimed = Boolean(kid.claimedDailyQuestIds?.includes(dailyQuest.claimId));

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
      <DailyRewardChestPreview quest={dailyQuest} claimed={dailyQuestClaimed} />
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

export function KidsQuestRewardScreen() {
  const kid = useAppStore((s) => s.kid);
  const claimKidDailyQuest = useAppStore((s) => s.claimKidDailyQuest);
  const quest = getKidDailyQuest(kid);
  const claimed = Boolean(kid.claimedDailyQuestIds?.includes(quest.claimId));
  const complete = quest.completion >= 0.98;
  const claimXp = Math.max(35, Math.round(quest.rewardXp * 0.34));
  const focusResults: KidReviewResult[] = quest.focusWords.slice(0, 3).map((entry) => ({ entryId: entry.id, correct: true, mode: 'vocabulary' }));

  const claim = () => {
    if (!complete || claimed) return;
    hapticSelection();
    claimKidDailyQuest({ questId: quest.claimId, xp: claimXp, wordResults: focusResults });
  };

  return (
    <KidScreen>
      <KidHeader
        eyebrow="Daily reward"
        title={complete ? 'Open your quest chest' : 'Finish today’s quest'}
        subtitle={complete ? 'Claim once, then keep your streak warm.' : quest.companionLine}
        avatar="🎁"
      />
      <KidCard color={quest.color} style={styles.questRewardHero}>
        <Floating3DToken icon={quest.themeIcon} color={quest.accent} style={styles.questRewardTokenOne} />
        <Floating3DToken icon="⭐" color="rgba(255,255,255,0.92)" delay={260} style={styles.questRewardTokenTwo} />
        <View style={styles.questRewardChestStage}>
          <LexoraLottie source={missionPulse} size={126} speed={claimed ? 0.65 : 1} />
          <LexText style={styles.questRewardChestIcon}>{claimed ? '🏆' : complete ? '🎁' : '🔒'}</LexText>
        </View>
        <LexText variant="h2" style={{ color: 'white', textAlign: 'center' }}>
          {claimed ? 'Reward collected' : complete ? `+${claimXp} bonus XP` : `${Math.round(quest.completion * 100)}% complete`}
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.84)', textAlign: 'center' }}>
          {claimed ? 'Your focus words were added to Memory Boost.' : complete ? 'Buddy saved your words and packed a streak bonus.' : quest.nextStep.reason}
        </LexText>
        <View style={{ width: '100%' }}>
          <KidProgressBar progress={quest.completion} color={quest.accent} />
        </View>
      </KidCard>

      <SectionTitle title="Quest steps" action={complete ? 'Home' : 'Continue'} onPress={() => router.push(complete ? '/(tabs)/home' : (quest.nextStep.route as never))} />
      <View style={{ gap: 10 }}>
        {quest.steps.map((step) => (
          <QuestRewardStepRow key={step.id} step={step} />
        ))}
      </View>

      <SectionTitle title="Focus words saved" action="Dictionary" onPress={() => router.push('/kids-dictionary')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {quest.focusWords.slice(0, 5).map((entry) => (
          <QuestRewardWord key={entry.id} entry={entry} />
        ))}
      </ScrollView>

      <View style={{ marginTop: 18, gap: 10 }}>
        <KidButton
          title={claimed ? 'Back to rewards' : complete ? 'Claim chest' : `Continue ${quest.nextStep.label}`}
          color={claimed ? c.mint : complete ? c.yellow : quest.accent}
          onPress={claimed ? () => router.replace('/rewards') : complete ? claim : () => router.push(quest.nextStep.route as never)}
        />
        <KidButton title="Back home" color={c.lilac} onPress={() => router.replace('/(tabs)/home')} />
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
  const dailyQuest = getKidDailyQuest(kid);

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
      <KidCard color={c.lilac} style={styles.questHealthCard}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: dailyQuest.color }}>
            Daily quest health
          </LexText>
          <LexText variant="h3" style={{ color: c.ink, marginTop: 5 }}>
            {Math.round(dailyQuest.completion * 100)}% through {dailyQuest.title}
          </LexText>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 5 }}>
            {dailyQuest.parentSummary}
          </LexText>
        </View>
        <QuestProgressRing progress={dailyQuest.completion} color={dailyQuest.color} icon={dailyQuest.themeIcon} />
      </KidCard>
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
  const gateChallenge = getKidParentGateChallenge(kid);
  const gatePassed = isKidParentGateOpen(kid);
  const gateReady = gatePassed || verifyKidParentGateAnswer(kid, gateAnswer);

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
            placeholder={`Type ${gateChallenge.prompt}`}
            placeholderTextColor={c.muted}
            keyboardType="number-pad"
            accessibilityLabel="Parent gate answer"
            style={styles.parentInput}
          />
          <View style={{ marginTop: 10 }}>
            <KidButton
              title={gatePassed ? 'Parent gate unlocked' : 'Unlock parent tools'}
              color={gatePassed ? c.mint : c.yellow}
              disabled={!gateReady}
              onPress={() => {
                passKidParentGate();
                setGateAnswer('');
              }}
            />
          </View>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 8, fontSize: 12 }}>
            Unlock stays active for {gateChallenge.expiresInMinutes} minutes.
          </LexText>
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
  const contentEngine = getKidContentCreationEngine(kid);
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
      <SectionTitle title="Generated drafts" action="Studio" onPress={() => router.push('/kids-content-studio')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {contentEngine.adminDrafts.map((item, index) => (
          <GeneratedContentCard key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
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
  const kid = useAppStore((s) => s.kid);
  const reviewSummary = getKidAdaptiveReviewSummary(kid);
  const reviewQueue = getKidAdaptiveReviewQueue(kid, 8);

  return (
    <KidScreen>
      <KidHeader eyebrow="Review" title="Memory Boost" subtitle="Words return right before they fade." avatar="🔁" />
      <KidCard color={c.mint}>
        <LexText variant="h2" style={{ color: 'white' }}>
          {reviewSummary.dueCount || reviewQueue.length} cards ready
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
          {reviewSummary.focusBody}
        </LexText>
        <View style={styles.reviewHeroMetrics}>
          <View style={styles.reviewHeroMetric}>
            <LexText variant="title" style={{ color: 'white' }}>
              {reviewSummary.newCount}
            </LexText>
            <LexText variant="label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9 }}>
              new
            </LexText>
          </View>
          <View style={styles.reviewHeroMetric}>
            <LexText variant="title" style={{ color: 'white' }}>
              {reviewSummary.strongCount}
            </LexText>
            <LexText variant="label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9 }}>
              strong
            </LexText>
          </View>
          <View style={styles.reviewHeroMetric}>
            <LexText variant="title" style={{ color: 'white' }}>
              {reviewSummary.masteredCount}
            </LexText>
            <LexText variant="label" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9 }}>
              mastered
            </LexText>
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <KidButton title="Start review" onPress={() => router.push(`/practice/${reviewSummary.recommendedMode}?lesson=adaptive-review`)} />
        </View>
      </KidCard>
      <SectionTitle title="Memory timing" />
      <View style={{ gap: 10 }}>
        {[
          { ...kidReviewSchedule[0], progress: reviewSummary.progress.fresh, label: `${reviewSummary.newCount} new` },
          { ...kidReviewSchedule[1], progress: reviewSummary.progress.recall, label: reviewSummary.nextReviewLabel },
          { ...kidReviewSchedule[2], progress: reviewSummary.progress.strong, label: `${reviewSummary.strongCount + reviewSummary.masteredCount} strong` },
        ].map((item) => (
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
      {reviewQueue.map((item) => (
        <KidCard key={item.entry.id} style={styles.reviewPreview}>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{item.entry.emoji}</LexText>
          <View style={{ flex: 1 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {item.entry.word}
            </LexText>
            <LexText variant="muted" style={{ color: c.muted }}>
              {item.reason}
            </LexText>
          </View>
          <KidPill label={item.dueLabel} active color={item.entry.color} />
        </KidCard>
      ))}
    </KidScreen>
  );
}

export function KidsGamesScreen() {
  const kid = useAppStore((s) => s.kid);
  const playStudio = getKidPlayStudio(kid);
  const dailyQuest = playStudio.quest;

  return (
    <KidScreen>
      <KidHeader eyebrow="Play Studio" title="Shows, songs & games" subtitle="Every playful card starts a real English activity." avatar="🎮" />
      <KidCard color={playStudio.hero.color} style={styles.playStudioHero}>
        <Floating3DToken icon="🎵" color={playStudio.hero.accent} style={styles.playStudioTokenOne} />
        <Floating3DToken icon={playStudio.hero.icon} color="rgba(255,255,255,0.9)" delay={300} style={styles.playStudioTokenTwo} />
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: 'rgba(255,255,255,0.86)' }}>
            Today’s featured play
          </LexText>
          <LexText variant="h2" style={{ color: 'white', marginTop: 6 }}>
            {playStudio.hero.title}
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
            {playStudio.hero.coachLine}
          </LexText>
          <View style={styles.playStudioHeroMeta}>
            <KidPill label={playStudio.hero.tag} active color="rgba(255,255,255,0.24)" />
            <KidPill label={`${playStudio.hero.minutes} min`} active color="rgba(255,255,255,0.24)" />
            <KidPill label={`+${playStudio.hero.rewardXp} XP`} active color={playStudio.hero.accent} />
          </View>
          <KidButton title={playStudio.hero.kind === 'roleplay' ? 'Talk now' : 'Play now'} onPress={() => router.push(playStudio.hero.route as never)} style={{ marginTop: 16, alignSelf: 'flex-start' }} />
        </View>
        <CharacterBubble mood="star" />
      </KidCard>
      <DailyQuestMiniPanel quest={dailyQuest} />
      {playStudio.shelves.map((shelf) => (
        <View key={shelf.id}>
          <SectionTitle title={shelf.title} action={shelf.id === 'daily-challenges' ? 'Reward' : undefined} onPress={() => router.push('/kids-quest-reward')} />
          <LexText variant="muted" style={{ color: c.muted, marginTop: -7, marginBottom: 12 }}>
            {shelf.subtitle}
          </LexText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {shelf.items.map((item, index) => (
              <PlayStudioCard key={item.id} item={item} index={index} />
            ))}
          </ScrollView>
        </View>
      ))}
    </KidScreen>
  );
}

export function KidsContentStudioScreen() {
  const kid = useAppStore((s) => s.kid);
  const engine = getKidContentCreationEngine(kid);

  return (
    <KidScreen>
      <KidHeader eyebrow="Creator engine" title="Fresh learning, every day" subtitle={engine.subtitle} avatar="✨" />
      <ContentEngineSpotlight engine={engine} />
      <View style={styles.contentEngineCoverageRow}>
        {engine.coverage.map((item) => (
          <MiniStat key={item.label} icon={item.label === 'Words' ? '📚' : item.label === 'Packs' ? '🧩' : '📝'} value={item.value} label={item.label} color={`${item.color}22`} />
        ))}
      </View>
      {engine.shelves.map((shelf) => (
        <View key={shelf.id}>
          <SectionTitle title={shelf.title} action={shelf.id === 'studio-drafts' ? 'Admin' : 'Play'} onPress={() => router.push(shelf.id === 'studio-drafts' ? '/admin' : '/(tabs)/games')} />
          <LexText variant="muted" style={{ color: c.muted, marginTop: -6, marginBottom: 12 }}>
            {shelf.subtitle}
          </LexText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {shelf.items.map((item, index) => (
              <GeneratedContentCard key={item.id} item={item} index={index} />
            ))}
          </ScrollView>
        </View>
      ))}
      <SectionTitle title="Parent-safe generation" />
      <View style={{ gap: 10 }}>
        {engine.parentHighlights.map((line, index) => (
          <KidCard key={line} animated={false} style={styles.contentEngineHighlight}>
            <View style={[styles.contentEngineHighlightIcon, { backgroundColor: index === 0 ? c.lilac : index === 1 ? c.coralSoft : c.mintSoft }]}>
              <LexText style={{ fontSize: 20, lineHeight: 28 }}>{index === 0 ? '🔁' : index === 1 ? '🎭' : '🌈'}</LexText>
            </View>
            <LexText variant="title" style={{ color: c.ink, flex: 1 }}>
              {line}
            </LexText>
          </KidCard>
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

function HomeCompactHeader({
  childName,
  avatar,
  energy,
  energyMax,
  xp,
}: {
  childName: string;
  avatar: string;
  energy: number;
  energyMax: number;
  xp: number;
}) {
  return (
    <View style={styles.homeHeaderCompact}>
      <KidAvatar label={avatar} size={50} />
      <View style={{ flex: 1 }}>
        <LexText variant="label" style={{ color: c.purple }}>
          Hi, {childName}
        </LexText>
        <LexText variant="h2" style={styles.homeHeaderTitle}>
          Today’s quest
        </LexText>
      </View>
      <View style={styles.homeHeaderChips}>
        <EnergyChip current={energy} max={energyMax} />
        <XpChip xp={xp} />
      </View>
    </View>
  );
}

function HomeMetricChip({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <KidCard animated={false} color={color} style={styles.homeMetricChip}>
      <LexText style={{ fontSize: 20, lineHeight: 26 }}>{icon}</LexText>
      <View>
        <LexText variant="title" style={{ color: c.ink, fontSize: 15, lineHeight: 19 }}>
          {value}
        </LexText>
        <LexText variant="label" style={{ color: c.muted, fontSize: 9 }}>
          {label}
        </LexText>
      </View>
    </KidCard>
  );
}

function HomeQuickAction({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} onPress={onPress} style={styles.homeQuickPressable}>
      <KidCard animated={false} style={styles.homeQuickCard}>
        <View style={[styles.homeQuickIcon, { backgroundColor: `${color}24` }]}>
          <LexText style={{ fontSize: 23, lineHeight: 31 }}>{icon}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="title" numberOfLines={1} style={{ color: c.ink, fontSize: 14, lineHeight: 18 }}>
            {title}
          </LexText>
          <LexText variant="label" numberOfLines={1} style={{ color, fontSize: 9, marginTop: 2 }}>
            {subtitle}
          </LexText>
        </View>
      </KidCard>
    </Pressable>
  );
}

function HomeLessonCompact({
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
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} onPress={onPress}>
      <KidCard animated={false} style={styles.homeLessonCompact}>
        <View style={[styles.homeLessonIcon, { backgroundColor: `${color}28` }]}>
          <LexText style={{ fontSize: 24, lineHeight: 32 }}>{icon}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="title" style={{ color: c.ink, fontSize: 15 }}>
            {title}
          </LexText>
          <LexText variant="muted" numberOfLines={1} style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>
            {subtitle}
          </LexText>
          <View style={{ marginTop: 8 }}>
            <KidProgressBar progress={progress} color={color} />
          </View>
        </View>
        <LexText variant="title" style={{ color: c.purple }}>
          →
        </LexText>
      </KidCard>
    </Pressable>
  );
}

function HomeExplorePill({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.homeExplorePillPressable}>
      <View style={[styles.homeExplorePill, { backgroundColor: `${color}20`, borderColor: `${color}55` }]}>
        <LexText style={{ fontSize: 19, lineHeight: 25 }}>{icon}</LexText>
        <LexText variant="label" numberOfLines={1} style={{ color: c.ink, fontSize: 10 }}>
          {label}
        </LexText>
      </View>
    </Pressable>
  );
}

function AlphabetLetterTile({
  item,
  active,
  progress,
  onPress,
}: {
  item: KidAlphabetLetter;
  active: boolean;
  progress: number;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Letter ${item.letter}, ${item.heroWord.word}`} accessibilityState={{ selected: active }} onPress={onPress}>
      <View style={[styles.alphabetLetterTile, { borderColor: active ? item.color : c.line, backgroundColor: active ? `${item.color}18` : c.paper }]}>
        <LexText variant="h2" style={{ color: item.color, fontSize: 28, lineHeight: 32 }}>
          {item.letter}
        </LexText>
        <LexText variant="label" numberOfLines={1} style={{ color: c.muted, fontSize: 9 }}>
          {item.heroWord.word}
        </LexText>
        <KidProgressBar progress={Math.min(1, progress)} color={item.color} />
      </View>
    </Pressable>
  );
}

function AlphabetWordCard({
  word,
  color,
  index,
}: {
  word: KidAlphabetLetter['words'][number];
  color: string;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(320).springify().damping(17)} style={styles.alphabetWordCardWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${word.word}. ${word.definition}`}
        onPress={() => {
          Speech.stop();
          Speech.speak(word.audioText, { rate: 0.84 });
        }}
      >
        <KidCard animated={false} color={`${word.color || color}20`} style={styles.alphabetWordCard}>
          <View style={[styles.alphabetWordIcon, { backgroundColor: `${word.color || color}24` }]}>
            <LexText style={{ fontSize: 34, lineHeight: 44 }}>{word.emoji}</LexText>
          </View>
          <LexText variant="h3" numberOfLines={1} style={{ color: c.ink, marginTop: 10 }}>
            {capitalizeKidWord(word.word)}
          </LexText>
          <LexText variant="muted" numberOfLines={3} style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 5 }}>
            {word.definition}
          </LexText>
          <View style={styles.alphabetWordSpeak}>
            <LexText variant="label" style={{ color }}>
              Tap to hear
            </LexText>
            <LexText style={{ fontSize: 17, lineHeight: 22 }}>🔊</LexText>
          </View>
        </KidCard>
      </Pressable>
    </Animated.View>
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

function KidDictionaryMiniCard({ entry, index }: { entry: KidDictionaryEntry; index: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.word}. ${entry.kidDefinition}`}
      onPress={() => router.push(`/kids-dictionary?word=${entry.id}`)}
    >
      <Animated.View entering={FadeInDown.delay(index * 60).duration(320).springify().damping(17)}>
        <KidCard animated={false} color={`${entry.color}22`} style={styles.kidDictionaryMiniCard}>
          <View style={[styles.kidDictionaryMiniIcon, { backgroundColor: entry.color }]}>
            <LexText style={{ fontSize: 32, lineHeight: 40 }}>{entry.emoji}</LexText>
          </View>
          <LexText variant="title" style={{ color: c.ink, marginTop: 10 }}>
            {entry.word}
          </LexText>
          <LexText variant="muted" numberOfLines={2} style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }}>
            {entry.kidDefinition}
          </LexText>
          <View style={{ marginTop: 10 }}>
            <KidPill label={entry.phonetic} active color={entry.color} />
          </View>
        </KidCard>
      </Animated.View>
    </Pressable>
  );
}

function KidDictionaryWordCard({
  entry,
  index,
  onSpeak,
}: {
  entry: KidDictionaryEntry;
  index: number;
  onSpeak: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320).springify().damping(17)}>
      <KidCard animated={false} style={styles.kidDictionaryWordCard}>
        <View style={[styles.kidDictionaryWordIcon, { backgroundColor: `${entry.color}33` }]}>
          <LexText style={{ fontSize: 34, lineHeight: 42 }}>{entry.emoji}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.kidDictionaryWordTop}>
            <View style={{ flex: 1 }}>
              <LexText variant="h3" style={{ color: c.ink }}>
                {entry.word}
              </LexText>
              <LexText variant="label" style={{ color: entry.color, marginTop: 2 }}>
                {entry.partOfSpeech} · {entry.phonetic}
              </LexText>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Hear ${entry.word}`} onPress={onSpeak} style={[styles.dictionaryAudioButton, { backgroundColor: entry.color }]}>
              <IconSymbol name="speaker.wave.2.fill" fallback="A" color="white" size={16} />
            </Pressable>
          </View>
          <LexText variant="muted" style={{ color: c.ink, marginTop: 6 }}>
            {entry.kidDefinition}
          </LexText>
          <View style={styles.dictionaryExampleBox}>
            <LexText variant="label" style={{ color: c.purple }}>
              Example
            </LexText>
            <LexText variant="muted" style={{ color: c.ink, marginTop: 3 }}>
              {entry.examples[0]}
            </LexText>
          </View>
          <View style={styles.dictionaryWordExtras}>
            {entry.rhymes.slice(0, 2).map((item) => (
              <KidPill key={item} label={`Rhyme: ${item}`} active color={c.sky} />
            ))}
            {entry.synonyms.slice(0, 1).map((item) => (
              <KidPill key={item} label={`Like: ${item}`} active color={c.mint} />
            ))}
          </View>
          <LexText variant="muted" style={{ color: c.muted, marginTop: 8, fontSize: 12, lineHeight: 17 }}>
            {entry.funFact}
          </LexText>
        </View>
      </KidCard>
    </Animated.View>
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

function ContentEngineSpotlight({ engine, compact }: { engine: KidContentCreationEngine; compact?: boolean }) {
  return (
    <KidCard color={engine.hero.color} style={[styles.contentEngineHero, compact ? styles.contentEngineHeroCompact : null]}>
      <Floating3DToken icon="✨" color={engine.hero.accent} style={styles.contentEngineTokenOne} />
      <Floating3DToken icon={engine.hero.icon} color="rgba(255,255,255,0.92)" delay={260} style={styles.contentEngineTokenTwo} />
      <View style={{ flex: 1 }}>
        <KidPill label={engine.dayKey} active color="rgba(255,255,255,0.22)" />
        <LexText variant="h2" numberOfLines={2} style={styles.contentEngineTitle}>
          {engine.hero.title}
        </LexText>
        <LexText variant="muted" numberOfLines={compact ? 2 : 3} style={styles.contentEngineSubtitle}>
          {engine.creatorLine}
        </LexText>
        <View style={styles.contentEngineWordRow}>
          {engine.hero.focusWords.slice(0, 3).map((entry) => (
            <KidPill key={entry.id} label={`${entry.emoji} ${entry.word}`} active color="rgba(255,255,255,0.22)" />
          ))}
        </View>
      </View>
      <View style={styles.contentEngineOrb}>
        <LexText style={{ fontSize: compact ? 44 : 54, lineHeight: compact ? 54 : 64 }}>{engine.hero.icon}</LexText>
        <View style={styles.contentEngineXp}>
          <LexText variant="label" style={{ color: c.ink }}>
            +{engine.hero.rewardXp} XP
          </LexText>
        </View>
      </View>
    </KidCard>
  );
}

function GeneratedContentCard({ item, index }: { item: KidGeneratedContentItem; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(360).springify().damping(17)} style={styles.generatedCardWrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={item.accessibilityLabel} onPress={() => router.push(item.route as never)}>
        <KidCard animated={false} color={item.color} style={styles.generatedContentCard}>
          <Floating3DToken icon={item.kind === 'song' ? '♪' : item.kind === 'teacher-draft' ? '✓' : '+'} color={item.accent} style={styles.generatedMiniToken} />
          <View style={styles.generatedCardTop}>
            <View style={styles.generatedIconPlate}>
              <LexText style={{ fontSize: 34, lineHeight: 44 }}>{item.icon}</LexText>
            </View>
            <KidPill label={item.level} active color="rgba(255,255,255,0.24)" />
          </View>
          <LexText variant="h3" numberOfLines={2} style={styles.generatedTitle}>
            {item.title}
          </LexText>
          <LexText variant="muted" numberOfLines={2} style={styles.generatedSubtitle}>
            {item.learningGoal}
          </LexText>
          <View style={styles.generatedWordRow}>
            {item.focusWords.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.generatedWordChip}>
                <LexText variant="label" numberOfLines={1} style={{ color: c.ink, fontSize: 9 }}>
                  {entry.emoji} {entry.word}
                </LexText>
              </View>
            ))}
          </View>
          <View style={styles.generatedSteps}>
            {item.steps.slice(0, 2).map((step, stepIndex) => (
              <View key={step} style={styles.generatedStepRow}>
                <LexText variant="label" style={{ color: item.accent, width: 18 }}>
                  {stepIndex + 1}
                </LexText>
                <LexText variant="muted" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.86)', flex: 1, fontSize: 11 }}>
                  {step}
                </LexText>
              </View>
            ))}
          </View>
          <View style={styles.generatedActionRow}>
            <LexText variant="label" style={{ color: c.ink }}>
              {item.minutes}m · +{item.rewardXp} XP
            </LexText>
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>→</LexText>
          </View>
        </KidCard>
      </Pressable>
    </Animated.View>
  );
}

function PlayStudioCard({ item, index }: { item: KidPlayStudioItem; index: number }) {
  const chips = item.focusWords.length
    ? item.focusWords.slice(0, 3).map((entry) => `${entry.emoji} ${entry.word}`)
    : [item.tag, `${item.minutes} min`, `+${item.rewardXp} XP`];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(360).springify().damping(17)} style={styles.playStudioCardWrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.subtitle}`} onPress={() => router.push(item.route as never)}>
        <KidCard animated={false} color={item.color} style={styles.playStudioCard}>
          <Floating3DToken icon={item.kind === 'song' ? '♪' : item.kind === 'read-aloud' ? '▶' : item.kind === 'art' ? '✎' : '★'} color={item.accent} style={styles.playStudioMiniToken} />
          <View style={styles.playStudioCardTop}>
            <View style={styles.playStudioIconPlate}>
              <LexText style={{ fontSize: 36, lineHeight: 46 }}>{item.icon}</LexText>
            </View>
            <KidPill label={item.tag} active color="rgba(255,255,255,0.22)" />
          </View>
          <LexText variant="h3" numberOfLines={2} style={styles.playStudioCardTitle}>
            {item.title}
          </LexText>
          <LexText variant="muted" numberOfLines={2} style={styles.playStudioCardSubtitle}>
            {item.subtitle}
          </LexText>
          <View style={styles.playStudioChips}>
            {chips.map((chip) => (
              <View key={chip} style={styles.playStudioChip}>
                <LexText variant="label" numberOfLines={1} style={{ color: c.ink, fontSize: 9 }}>
                  {chip}
                </LexText>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 12 }}>
            <KidProgressBar progress={item.progress} color={item.accent} />
          </View>
          <View style={styles.playStudioCardAction}>
            <LexText variant="title" style={{ color: c.ink, fontSize: 13 }}>
              Start
            </LexText>
            <LexText style={{ fontSize: 18, lineHeight: 24 }}>→</LexText>
          </View>
        </KidCard>
      </Pressable>
    </Animated.View>
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

function DailyRewardChestPreview({ quest, claimed }: { quest: KidDailyQuest; claimed: boolean }) {
  const complete = quest.completion >= 0.98;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/kids-quest-reward')}>
      <KidCard color={complete ? quest.color : c.lilac} style={styles.dailyRewardPreview}>
        <View style={[styles.dailyRewardPreviewIcon, { backgroundColor: complete ? quest.accent : 'white' }]}>
          <LexText style={{ fontSize: 28, lineHeight: 36 }}>{claimed ? '🏆' : complete ? '🎁' : '🔒'}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: complete ? 'rgba(255,255,255,0.84)' : quest.color }}>
            Today’s quest chest
          </LexText>
          <LexText variant="title" style={{ color: complete ? 'white' : c.ink, marginTop: 3 }}>
            {claimed ? 'Collected for today' : complete ? `Ready to claim ${quest.rewardXp} XP` : `${Math.round(quest.completion * 100)}% ready`}
          </LexText>
          <View style={{ marginTop: 8 }}>
            <KidProgressBar progress={quest.completion} color={complete ? quest.accent : quest.color} />
          </View>
        </View>
        <LexText variant="title" style={{ color: complete ? 'white' : c.purple }}>→</LexText>
      </KidCard>
    </Pressable>
  );
}

function DailyQuestMiniPanel({ quest }: { quest: KidDailyQuest }) {
  return (
    <KidCard color={c.lilac} style={styles.dailyQuestMiniPanel}>
      <View style={styles.dailyQuestMiniTop}>
        <View style={[styles.dailyQuestMiniIcon, { backgroundColor: quest.color }]}>
          <LexText style={{ fontSize: 24, lineHeight: 32 }}>{quest.themeIcon}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: quest.color }}>
            {quest.streakLabel}
          </LexText>
          <LexText variant="title" style={{ color: c.ink, marginTop: 2 }}>
            {quest.nextStep.title}
          </LexText>
        </View>
        <KidPill label={`${Math.round(quest.completion * 100)}%`} active color={quest.color} />
      </View>
      <KidProgressBar progress={quest.completion} color={quest.color} />
      <View style={styles.dailyQuestStepRail}>
        {quest.steps.map((step) => (
          <QuestMiniStep key={step.id} step={step} />
        ))}
      </View>
    </KidCard>
  );
}

function QuestMiniStep({ step }: { step: KidDailyQuestStep }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(step.route as never)} style={styles.questMiniStep}>
      <View style={[styles.questMiniStepIcon, { backgroundColor: step.state === 'complete' ? c.mint : `${step.color}22` }]}>
        <LexText style={{ fontSize: 17, lineHeight: 23 }}>{step.state === 'complete' ? '✓' : step.icon}</LexText>
      </View>
      <LexText variant="label" numberOfLines={1} style={{ color: step.state === 'active' ? step.color : c.muted, fontSize: 9 }}>
        {step.label}
      </LexText>
    </Pressable>
  );
}

function QuestRewardStepRow({ step }: { step: KidDailyQuestStep }) {
  const done = step.state === 'complete';
  const active = step.state === 'active';
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(step.route as never)}>
      <KidCard animated={false} style={[styles.questRewardStepRow, active ? { borderColor: step.color, borderWidth: 2 } : null]}>
        <View style={[styles.questRewardStepIcon, { backgroundColor: done ? c.mint : `${step.color}22` }]}>
          <LexText style={{ fontSize: 22, lineHeight: 30 }}>{done ? '✓' : step.icon}</LexText>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.questRewardStepTop}>
            <LexText variant="label" style={{ color: step.color }}>
              {step.label}
            </LexText>
            <KidPill label={done ? 'Done' : `+${step.rewardXp} XP`} active color={done ? c.mint : step.accent} />
          </View>
          <LexText variant="title" style={{ color: c.ink, marginTop: 2 }}>
            {step.title}
          </LexText>
          <LexText variant="muted" numberOfLines={2} style={{ color: c.muted, marginTop: 3 }}>
            {step.reason}
          </LexText>
          <View style={{ marginTop: 9 }}>
            <KidProgressBar progress={step.progress} color={step.color} />
          </View>
        </View>
      </KidCard>
    </Pressable>
  );
}

function QuestRewardWord({ entry }: { entry: KidDictionaryEntry }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/kids-dictionary?word=${entry.id}`)}>
      <KidCard animated={false} style={styles.questRewardWordCard}>
        <View style={[styles.questRewardWordIcon, { backgroundColor: `${entry.color}24` }]}>
          <LexText style={{ fontSize: 28, lineHeight: 36 }}>{entry.emoji}</LexText>
        </View>
        <LexText variant="title" numberOfLines={1} style={{ color: c.ink, marginTop: 9 }}>
          {entry.word}
        </LexText>
        <LexText variant="muted" numberOfLines={2} style={{ color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
          {entry.kidDefinition}
        </LexText>
      </KidCard>
    </Pressable>
  );
}

function QuestProgressRing({ progress, color, icon }: { progress: number; color: string; icon: string }) {
  return (
    <View style={[styles.questProgressRing, { borderColor: `${color}33` }]}>
      <View style={[styles.questProgressRingFill, { height: `${Math.max(10, Math.round(progress * 100))}%`, backgroundColor: color }]} />
      <LexText style={{ fontSize: 28, lineHeight: 36 }}>{icon}</LexText>
    </View>
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

function formatHomePowerUpTitle(title: string) {
  if (title === 'Buddy Roleplay') return 'Roleplay';
  if (title === 'Explain My Answer') return 'Explain';
  return title;
}

function createMissionNode(step: KidDailyQuestStep): KidMissionNode {
  return {
    id: step.id,
    label: step.label,
    title: step.title,
    subtitle: step.subtitle,
    icon: step.icon,
    color: step.color,
    accent: step.accent,
    progress: step.progress,
    state: step.state,
    rewardLabel: step.state === 'complete' ? 'Done' : `+${step.rewardXp} XP`,
    route: step.route,
  };
}

function normalizeAlphabetId(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  const letter = raw?.trim().slice(0, 1).toLowerCase();
  if (!letter || !/^[a-z]$/.test(letter)) return null;
  return letter;
}

function clampCanvas(value: number, max: number) {
  return Math.max(0, Math.min(max, value));
}

function capitalizeKidWord(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function isKidPracticeMode(mode: string): mode is KidPracticeMode {
  return ['vocabulary', 'listening', 'speaking', 'reading', 'grammar', 'story'].includes(mode);
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
  contentEngineHero: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  contentEngineHeroCompact: { minHeight: 154 },
  contentEngineTitle: { color: 'white', marginTop: 10, fontSize: 28, lineHeight: 34 },
  contentEngineSubtitle: { color: 'rgba(255,255,255,0.84)', marginTop: 6, fontSize: 13, lineHeight: 19 },
  contentEngineWordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  contentEngineOrb: {
    width: 102,
    minHeight: 118,
    borderRadius: 34,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.74)',
    boxShadow: '0 18px 0 rgba(34,35,74,0.12)',
  },
  contentEngineXp: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: c.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentEngineTokenOne: { position: 'absolute', right: 124, top: 24 },
  contentEngineTokenTwo: { position: 'absolute', right: 28, bottom: 18 },
  contentEngineCoverageRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contentEngineHighlight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contentEngineHighlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedCardWrap: { width: 226 },
  generatedContentCard: {
    minHeight: 286,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    boxShadow: '0 18px 28px rgba(71,57,146,0.20)',
  },
  generatedCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  generatedIconPlate: {
    width: 68,
    height: 68,
    borderRadius: 26,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.74)',
    boxShadow: '0 12px 0 rgba(34,35,74,0.12)',
  },
  generatedMiniToken: { right: 42, top: 58, width: 34, height: 34, borderRadius: 14 },
  generatedTitle: { color: 'white', marginTop: 15, fontSize: 21, lineHeight: 26 },
  generatedSubtitle: { color: 'rgba(255,255,255,0.84)', marginTop: 6, fontSize: 12, lineHeight: 17 },
  generatedWordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  generatedWordChip: {
    maxWidth: '100%',
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedSteps: { gap: 5, marginTop: 12 },
  generatedStepRow: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generatedActionRow: {
    minHeight: 38,
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playStudioHero: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  playStudioHeroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  playStudioTokenOne: { position: 'absolute', right: 128, top: 18 },
  playStudioTokenTwo: { position: 'absolute', right: 28, bottom: 22 },
  playStudioCardWrap: { width: 218 },
  playStudioCard: {
    minHeight: 258,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    boxShadow: '0 18px 28px rgba(71,57,146,0.20)',
  },
  playStudioCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  playStudioIconPlate: {
    width: 70,
    height: 70,
    borderRadius: 27,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.74)',
    boxShadow: '0 12px 0 rgba(34,35,74,0.12)',
  },
  playStudioMiniToken: { right: 44, top: 58, width: 34, height: 34, borderRadius: 14 },
  playStudioCardTitle: { color: 'white', marginTop: 16, fontSize: 22, lineHeight: 27 },
  playStudioCardSubtitle: { color: 'rgba(255,255,255,0.84)', marginTop: 6, fontSize: 12, lineHeight: 17 },
  playStudioChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  playStudioChip: {
    maxWidth: '100%',
    minHeight: 27,
    borderRadius: 999,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playStudioCardAction: {
    minHeight: 38,
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyRewardPreview: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyRewardPreviewIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 10px 0 rgba(34,35,74,0.10)',
  },
  dailyQuestMiniPanel: { marginTop: 14, gap: 12 },
  dailyQuestMiniTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dailyQuestMiniIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 10px 0 rgba(34,35,74,0.10)',
  },
  dailyQuestStepRail: { flexDirection: 'row', gap: 8 },
  questMiniStep: {
    flex: 1,
    minHeight: 72,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.08)',
  },
  questMiniStepIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questRewardHero: { marginTop: 16, alignItems: 'center', gap: 12, overflow: 'hidden' },
  questRewardChestStage: {
    width: 154,
    height: 146,
    borderRadius: 44,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.68)',
    boxShadow: '0 20px 0 rgba(34,35,74,0.13)',
  },
  questRewardChestIcon: { position: 'absolute', fontSize: 54, lineHeight: 64, textAlign: 'center' },
  questRewardTokenOne: { position: 'absolute', left: 22, top: 52 },
  questRewardTokenTwo: { position: 'absolute', right: 26, top: 36 },
  questRewardStepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  questRewardStepTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  questRewardStepIcon: {
    width: 56,
    height: 56,
    borderRadius: 21,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questRewardWordCard: { width: 148, minHeight: 168 },
  questRewardWordIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  authHero: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  authToggle: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 12 },
  authHintRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  headerChips: { alignItems: 'flex-end', gap: 8 },
  homeHeaderCompact: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 2 },
  homeHeaderTitle: { color: c.ink, fontSize: 24, lineHeight: 29 },
  homeHeaderChips: { alignItems: 'flex-end', gap: 6 },
  homeStatsCompactRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  homeMetricChip: {
    flex: 1,
    minHeight: 56,
    borderRadius: 22,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 9,
  },
  homeQuickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  homeQuickPressable: { width: '48.5%' },
  homeQuickCard: {
    minHeight: 76,
    borderRadius: 24,
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
  },
  homeQuickIcon: { width: 42, height: 42, borderRadius: 17, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  homeLessonCompact: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  homeLessonIcon: { width: 48, height: 48, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  homeExploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 },
  homeExplorePillPressable: { width: '31.8%' },
  homeExplorePill: {
    minHeight: 54,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  alphabetLetterTile: {
    width: 76,
    minHeight: 92,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alphabetBoardCard: { marginTop: 14, gap: 14 },
  alphabetBoardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alphabetSoundBadge: {
    minWidth: 66,
    minHeight: 58,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.line,
  },
  alphabetCanvas: {
    alignSelf: 'center',
    borderRadius: 28,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34,35,74,0.08)',
    backgroundColor: c.paper,
    boxShadow: '0 18px 28px rgba(71,57,146,0.14)',
  },
  alphabetCanvasMotion: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  alphabetCelebrationLayer: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 34,
    bottom: 62,
    borderRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  alphabetCelebrationPill: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,35,74,0.08)',
    marginTop: -16,
  },
  alphabetCanvasCoach: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 52,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 10,
    zIndex: 6,
  },
  alphabetToolPanel: {
    gap: 10,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(129,116,242,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(129,116,242,0.10)',
    padding: 10,
  },
  alphabetPalette: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  alphabetPaintSwatch: {
    width: 42,
    height: 42,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 3,
    boxShadow: '0 8px 14px rgba(71,57,146,0.16)',
  },
  alphabetToolChips: { flexDirection: 'row', gap: 8 },
  alphabetProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alphabetActions: { flexDirection: 'row', gap: 8 },
  alphabetWordCardWrap: { width: 168 },
  alphabetWordCard: { minHeight: 208 },
  alphabetWordIcon: {
    width: 66,
    height: 66,
    borderRadius: 25,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetWordSpeak: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  alphabetMissionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alphabetMissionIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniStat: { flex: 1, minHeight: 112, alignItems: 'center', justifyContent: 'center' },
  questHealthCard: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  questProgressRing: {
    width: 76,
    height: 76,
    borderRadius: 27,
    borderCurve: 'continuous',
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  questProgressRingFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.24,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  dictionarySpotlight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kidDictionaryHero: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  kidDictionaryHeroEmoji: { fontSize: 70, lineHeight: 82, marginTop: 14 },
  kidDictionaryHeroWord: { color: 'white', fontSize: 34, lineHeight: 40, marginTop: 2 },
  kidDictionaryHeroDefinition: { color: 'rgba(255,255,255,0.86)', marginTop: 6, fontSize: 15, lineHeight: 22 },
  dictionaryMetaRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  dictionaryHeroActions: { width: 104, gap: 10 },
  kidDictionarySearch: {
    minHeight: 54,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  kidDictionaryInput: { flex: 1, minHeight: 52, padding: 0, color: c.ink, fontFamily: 'DMSans_600SemiBold', fontSize: 15 },
  kidDictionaryMiniCard: { width: 150, minHeight: 188 },
  kidDictionaryMiniIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 10px 0 rgba(34,35,74,0.10)',
  },
  kidDictionaryWordCard: { flexDirection: 'row', gap: 12 },
  kidDictionaryWordIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kidDictionaryWordTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dictionaryAudioButton: {
    width: 42,
    height: 42,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.78)',
    boxShadow: '0 8px 0 rgba(34,35,74,0.10)',
  },
  dictionaryExampleBox: {
    marginTop: 10,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: c.appBg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 10,
  },
  dictionaryWordExtras: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
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
  practiceQuestHeader: { gap: 14, overflow: 'hidden' },
  practiceQuestTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  practiceQuestIcon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.86)',
  },
  practiceCountBadge: {
    width: 58,
    minHeight: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceHeaderMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  practiceMiniChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(34,35,74,0.07)',
  },
  practiceRewardTrail: { flexDirection: 'row', gap: 8, marginTop: 12 },
  practiceRewardStep: {
    flex: 1,
    minHeight: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  practiceStageCard: { marginTop: 12, alignItems: 'center', overflow: 'hidden', paddingTop: 14 },
  practiceStageTop: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  practiceStageVisualWrap: {
    width: 160,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  practiceStageGlow: {
    position: 'absolute',
    width: 150,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ rotate: '-8deg' }],
  },
  practiceStageVisual: {
    width: 118,
    height: 118,
    borderRadius: 42,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 16px 0 rgba(34,35,74,0.12)',
  },
  practiceFloatOne: { position: 'absolute', top: 74, left: 18 },
  practiceFloatTwo: { position: 'absolute', top: 86, right: 18 },
  practicePromptV2: { color: 'white', marginTop: 12, textAlign: 'center', fontSize: 28, lineHeight: 34 },
  practicePassageV2: {
    width: '100%',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 14,
    marginTop: 12,
  },
  practiceAudioPanel: {
    width: '100%',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 14,
  },
  practiceAudioButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    boxShadow: '0 8px 0 rgba(34,35,74,0.14)',
  },
  practiceReadyPanel: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  practiceInsightBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(34,35,74,0.08)',
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  practiceInsightIcon: { width: 46, height: 46, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  practiceInsightChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  completionHeroV2: { alignItems: 'center', gap: 12, overflow: 'hidden' },
  completionFloatOne: { position: 'absolute', top: 20, left: 20 },
  completionFloatTwo: { position: 'absolute', top: 42, right: 22 },
  completionStarRow: { flexDirection: 'row', gap: 8 },
  completionStar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleplayScenarioRail: { gap: 8, paddingVertical: 12 },
  roleplayScenarioPill: {
    minHeight: 44,
    borderRadius: 999,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  roleplayStage: { gap: 14, overflow: 'hidden' },
  roleplayStageTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  roleplayFloatOne: { position: 'absolute', top: 78, right: 22 },
  roleplayFloatTwo: { position: 'absolute', bottom: 108, left: 22 },
  roleplayCharacterStage: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  roleplaySpeechBubble: {
    flex: 1,
    borderRadius: 26,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    boxShadow: '0 10px 0 rgba(34,35,74,0.12)',
  },
  roleplayPrompt: { color: 'white', textAlign: 'center', fontSize: 27, lineHeight: 34 },
  roleplayAudioButton: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignSelf: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.74)',
  },
  roleplayChoices: { gap: 10, marginTop: 14 },
  roleplayChoice: {
    minHeight: 72,
    borderRadius: 25,
    borderCurve: 'continuous',
    borderWidth: 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleplayChoiceIcon: { width: 44, height: 44, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  roleplayFeedback: { marginTop: 12 },
  roleplayFocusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  roleplayWordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  roleplayCompleteHero: { alignItems: 'center', gap: 12, overflow: 'hidden' },
  roleplayRecapRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  roleplayMiniIcon: { width: 46, height: 46, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
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
  speakPanel: { gap: 12, marginTop: 16 },
  speakPanelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  speakMicOrb: {
    width: 58,
    height: 58,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: c.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,122,122,0.18)',
  },
  speakWaveRow: {
    minHeight: 58,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: c.lilac,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  speakWaveBar: { width: 10, borderRadius: 999, backgroundColor: c.purple },
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
  reviewHeroMetrics: { flexDirection: 'row', gap: 8, marginTop: 14 },
  reviewHeroMetric: {
    flex: 1,
    minHeight: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
