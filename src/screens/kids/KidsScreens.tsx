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
import {
  kidBadges,
  kidCategories,
  kidCourses,
  kidFriends,
  kidLeaderboard,
  kidLessons,
  kidMissions,
  kidProfiles,
  kidQuizQuestions,
} from '../../data/kidsMock';
import { hapticSelection } from '../../utils/haptics';
import { useAppStore } from '../../store/useAppStore';

export function KidsHomeScreen() {
  const child = kidProfiles[0];
  const continueLesson = kidLessons[0];
  const recommended = kidLessons.slice(1, 4);

  return (
    <KidScreen>
      <KidHeader
        eyebrow={`Hi, ${child.name}`}
        title="Let’s learn English!"
        subtitle="Small wins, fun games, and happy words."
        avatar={child.avatar}
        right={<XpChip xp={child.xp} />}
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
        <CharacterBubble mood="star" text="+50 XP" />
      </KidCard>

      <View style={styles.statsRow}>
        <MiniStat icon="🔥" value={`${child.streak}`} label="day streak" color={c.coralSoft} />
        <MiniStat icon="⭐" value={`Level ${child.level}`} label="word hero" color={c.yellowSoft} />
        <MiniStat icon="🏆" value="#2" label="league" color={c.mintSoft} />
      </View>

      <SectionTitle title="Daily missions" action="Rewards" onPress={() => router.push('/rewards')} />
      <View style={{ gap: 10 }}>
        {kidMissions.map((mission) => (
          <MissionRow key={mission.id} {...mission} />
        ))}
      </View>

      <SectionTitle title="Vocabulary worlds" action="All" onPress={() => router.push('/(tabs)/learn')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {kidCategories.map((cat) => (
          <Pressable key={cat.id} accessibilityRole="button" onPress={() => router.push('/(tabs)/learn')}>
            <KidCard animated={false} style={[styles.categoryTile, { backgroundColor: `${cat.color}22` }]}>
              <LexText style={{ fontSize: 32 }}>{cat.icon}</LexText>
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
        {kidFriends.map((friend) => (
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
      icon: '🚀',
      color: c.purple,
    },
    {
      title: 'Choose a learning buddy',
      subtitle: 'Kids tap, listen, speak, and read with a friendly guide.',
      icon: '🦊',
      color: c.coral,
    },
    {
      title: 'Parents stay in control',
      subtitle: 'Safe progress, no ads, and calm parent tools.',
      icon: '🔐',
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
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <CharacterBubble mood="star" text={slide.icon} />
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
          <KidButton title="Parent sign in" color={c.sky} onPress={() => router.push('/parent')} />
        </View>
      </View>
    </KidScreen>
  );
}

export function KidsLearnScreen() {
  const [active, setActive] = useState('all');
  const lessons = active === 'all' ? kidLessons : kidLessons.filter((lesson) => lesson.courseId === active || lesson.type === active);

  return (
    <KidScreen>
      <KidHeader eyebrow="Choose your course" title="Learning worlds" subtitle="Pick a colorful path and keep collecting stars." avatar="🌈" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 16 }}>
        <KidPill label="All" active={active === 'all'} onPress={() => setActive('all')} />
        {kidCourses.map((course) => (
          <KidPill key={course.id} label={course.title} active={active === course.id} color={course.color} onPress={() => setActive(course.id)} />
        ))}
      </ScrollView>

      {kidCourses.map((course) => (
        <Pressable key={course.id} accessibilityRole="button" onPress={() => setActive(course.id)}>
          <KidCard color={course.color} style={styles.courseCard}>
            <View style={{ flex: 1 }}>
              <LexText style={{ fontSize: 38 }}>{course.icon}</LexText>
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
  const lesson = kidLessons.find((item) => item.id === id) ?? kidLessons[0];
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
              <LexText style={{ fontSize: 22 }}>{mode === 'speaking' ? '🎤' : mode === 'listening' ? '🎧' : mode === 'story' ? '📖' : '⭐'}</LexText>
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

      <KidButton title="Start lesson" icon="play.fill" onPress={() => router.push(`/practice/${lesson.type}?lesson=${lesson.id}`)} />
    </KidScreen>
  );
}

export function KidsPracticeScreen() {
  const { mode, lesson } = useLocalSearchParams<{ mode?: string; lesson?: string }>();
  const currentLesson = kidLessons.find((item) => item.id === lesson) ?? kidLessons[0];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const question = kidQuizQuestions[index % kidQuizQuestions.length];
  const done = Boolean(selected);
  const ok = selected === question.answer;

  const stars = Math.max(1, Math.min(3, correctCount + (ok ? 1 : 0)));

  if (complete) {
    return (
      <KidScreen>
        <KidHeader eyebrow="Lesson complete" title="Amazing work!" subtitle="You earned stars, XP, and a new badge." avatar="🎉" />
        <KidCard color={c.purple} style={{ alignItems: 'center', gap: 14 }}>
          <CelebrationBurst />
          <LexText variant="h2" style={{ color: 'white' }}>
            +{currentLesson.xp} XP
          </LexText>
          <LexText style={{ fontSize: 34 }}>{'⭐'.repeat(stars)}</LexText>
          <KidPill label="Badge unlocked" active color={c.yellow} />
        </KidCard>
        <KidButton title="Next lesson" onPress={() => router.push('/(tabs)/learn')} />
        <KidButton title="Back home" color={c.mint} onPress={() => router.push('/(tabs)/home')} />
      </KidScreen>
    );
  }

  return (
    <KidScreen scroll={false}>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <KidHeader eyebrow={String(mode ?? currentLesson.type)} title={currentLesson.title} avatar={currentLesson.icon} right={<TimerPill />} />
        <View style={{ marginTop: 18 }}>
          <KidProgressBar progress={(index + 1) / kidQuizQuestions.length} color={currentLesson.color} />
        </View>
        <KidCard color={currentLesson.color} style={styles.quizCard}>
          <CharacterBubble mood={mode === 'listening' ? 'listen' : mode === 'reading' || mode === 'story' ? 'read' : 'happy'} />
          <LexText variant="h2" style={{ color: 'white', marginTop: 18, textAlign: 'center' }}>
            {mode === 'speaking' ? 'Say this answer out loud' : question.prompt}
          </LexText>
          <LexText style={{ fontSize: 68, textAlign: 'center', marginTop: 12 }}>{question.visual}</LexText>
          <View style={{ marginTop: 12, alignSelf: 'center' }}>
            <KidButton
              title={mode === 'speaking' ? 'Speak answer' : 'Play audio'}
              icon={mode === 'speaking' ? 'mic.fill' : 'speaker.wave.2.fill'}
              onPress={() => Speech.speak(question.audioText)}
            />
          </View>
        </KidCard>

        <View style={styles.optionsGrid}>
          {question.options.map((option) => (
            <QuizOption
              key={option}
              label={option}
              selected={selected === option}
              correct={done && option === question.answer}
              wrong={done && selected === option && !ok}
              onPress={() => {
                if (done) return;
                hapticSelection();
                setSelected(option);
                if (option === question.answer) setCorrectCount((value) => value + 1);
              }}
            />
          ))}
        </View>

        {done ? (
          <KidCard color={ok ? c.mintSoft : c.coralSoft} style={{ marginTop: 12 }}>
            <LexText variant="title" style={{ color: c.ink }}>
              {ok ? 'Great job! 🎉' : `Good try. ${question.hint}`}
            </LexText>
          </KidCard>
        ) : null}

        <View style={{ marginTop: 'auto', paddingBottom: 10 }}>
          <KidButton
            title={index >= kidQuizQuestions.length - 1 ? 'Finish lesson' : 'Next'}
            disabled={!done}
            onPress={() => {
              if (index >= kidQuizQuestions.length - 1) setComplete(true);
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

export function KidsProfilesScreen() {
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  return (
    <KidScreen>
      <KidHeader eyebrow="Family account" title="Who is learning?" subtitle="Choose a child profile or add a new learner." avatar="👨‍👩‍👧" />
      {kidProfiles.map((profile) => (
        <Pressable
          key={profile.id}
          accessibilityRole="button"
          onPress={() => {
            setOnboardingCompleted(true);
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
              <KidProgressBar progress={profile.xp / 700} color={c.purple} />
            </View>
            <XpChip xp={profile.xp} />
          </KidCard>
        </Pressable>
      ))}
      <KidButton title="Add child profile" icon="plus" onPress={() => router.push('/parent')} />
    </KidScreen>
  );
}

export function KidsRewardsScreen() {
  return (
    <KidScreen>
      <KidHeader eyebrow="Rewards" title="Badges & stars" subtitle="Celebrate wins and unlock new adventures." avatar="🏆" />
      <KidCard color={c.yellow}>
        <LexText variant="h2" style={{ color: c.ink }}>
          You did 16 streaks!
        </LexText>
        <KidProgressBar progress={0.68} color={c.purple} />
      </KidCard>
      <SectionTitle title="My badges" />
      <View style={styles.badgeGrid}>
        {kidBadges.map((badge) => (
          <BadgeTile key={badge.id} icon={badge.icon} title={badge.title} locked={!badge.unlocked} progress={badge.progress} />
        ))}
      </View>
    </KidScreen>
  );
}

export function KidsSocialScreen() {
  const [tab, setTab] = useState<'world' | 'friends'>('world');
  const rows = tab === 'world' ? kidLeaderboard : kidFriends.map((item, index) => ({ ...item, rank: index + 1 }));

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
          <XpChip xp={row.xp} />
        </KidCard>
      ))}
    </KidScreen>
  );
}

export function KidsProgressScreen() {
  return (
    <KidScreen>
      <KidHeader eyebrow="Profile" title="Mika’s progress" subtitle="Parent-friendly learning snapshot." avatar="🦊" right={<KidButton title="Parent" onPress={() => router.push('/parent')} />} />
      <View style={styles.statsRow}>
        <MiniStat icon="⭐" value="323" label="XP" color={c.yellowSoft} />
        <MiniStat icon="🔥" value="16" label="streak" color={c.coralSoft} />
        <MiniStat icon="📚" value="42" label="words" color={c.mintSoft} />
      </View>
      <KidCard>
        <SectionMini title="Level progress" />
        <KidProgressBar progress={0.62} color={c.purple} />
        <LexText variant="muted" style={{ color: c.muted, marginTop: 10 }}>
          277 XP to Level 6
        </LexText>
      </KidCard>
      <SectionTitle title="Weekly learning" />
      <View style={styles.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View key={`${day}-${index}`} style={[styles.dayDot, { backgroundColor: index < 5 ? c.mint : c.lilac }]}>
            <LexText variant="label" style={{ color: index < 5 ? 'white' : c.muted }}>
              {day}
            </LexText>
          </View>
        ))}
      </View>
      <SectionTitle title="Achievements" action="See all" onPress={() => router.push('/rewards')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {kidBadges.slice(0, 4).map((badge) => (
          <BadgeTile key={badge.id} icon={badge.icon} title={badge.title} locked={!badge.unlocked} progress={badge.progress} />
        ))}
      </ScrollView>
    </KidScreen>
  );
}

export function KidsParentDashboardScreen() {
  return (
    <KidScreen>
      <KidHeader eyebrow="Parent area" title="Learning dashboard" subtitle="A calm place for grown-ups to review progress and safety." avatar="🔐" />
      <KidCard>
        <SectionMini title="Parent gate" />
        <LexText variant="muted" style={{ color: c.muted }}>
          Purchases, settings, and content controls should live behind this grown-up area.
        </LexText>
        <View style={{ marginTop: 14 }}>
          <TextInput placeholder="Type 12 + 3" placeholderTextColor={c.muted} style={styles.parentInput} />
        </View>
      </KidCard>
      <View style={styles.statsRow}>
        <MiniStat icon="⏱️" value="24m" label="this week" color={c.sky} />
        <MiniStat icon="✅" value="87%" label="accuracy" color={c.mintSoft} />
        <MiniStat icon="📥" value="8" label="cached" color={c.yellowSoft} />
      </View>
      <KidCard>
        <SectionMini title="Teacher/Admin quick tools" />
        {['Create lesson', 'Review vocabulary', 'Manage classes'].map((item) => (
          <Pressable key={item} style={styles.activityRow} onPress={() => router.push('/admin')}>
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
  const drafts = useMemo(
    () => kidLessons.filter((lesson) => lesson.title.toLowerCase().includes(search.trim().toLowerCase())),
    [search]
  );

  return (
    <KidScreen>
      <KidHeader eyebrow="Teacher studio" title="Content manager" subtitle="Create, review, and publish kid-safe English lessons." avatar="👩‍🏫" />
      <KidCard color={c.purple}>
        <LexText variant="h2" style={{ color: 'white' }}>
          12 lessons ready
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
            <LexText style={{ fontSize: 22 }}>{lesson.icon}</LexText>
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
  return (
    <KidScreen>
      <KidHeader eyebrow="Review" title="Warm up your words" subtitle="Quick, gentle recall before learning more." avatar="🔁" />
      <KidCard color={c.mint}>
        <LexText variant="h2" style={{ color: 'white' }}>
          5 words ready
        </LexText>
        <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
          Review cards adapt to what your child remembers.
        </LexText>
        <View style={{ marginTop: 16 }}>
          <KidButton title="Start review" onPress={() => router.push('/practice/vocabulary?lesson=animals-1')} />
        </View>
      </KidCard>
      {kidQuizQuestions.map((q) => (
        <KidCard key={q.id} style={styles.reviewPreview}>
          <LexText style={{ fontSize: 34 }}>{q.visual}</LexText>
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
  return (
    <KidScreen>
      <KidHeader eyebrow="Play" title="Daily challenge" subtitle="Games that make English practice feel alive." avatar="🎮" />
      <KidCard color={c.coral} style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: c.yellow }}>
            Today’s game
          </LexText>
          <LexText variant="h2" style={{ color: 'white', marginTop: 6 }}>
            Picture Match
          </LexText>
          <LexText variant="muted" style={{ color: 'rgba(255,255,255,0.82)', marginTop: 6 }}>
            Match 6 pictures before the timer ends.
          </LexText>
          <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
            <KidButton title="Play now" onPress={() => router.push('/practice/vocabulary?lesson=animals-1')} />
          </View>
        </View>
        <CharacterBubble mood="star" />
      </KidCard>
      <SectionTitle title="Game modes" />
      {[
        ['Listening Pop', 'Hear a word and tap the picture', '🎧', 'listening'],
        ['Speaking Star', 'Say the answer out loud', '🎤', 'speaking'],
        ['Grammar Garden', 'Choose the best sentence', '🌱', 'grammar'],
        ['Story Island', 'Read and unlock the ending', '🏝️', 'story'],
      ].map(([title, subtitle, icon, mode]) => (
        <LessonCard
          key={mode}
          title={title}
          subtitle={subtitle}
          icon={icon}
          color={mode === 'grammar' ? c.mint : mode === 'speaking' ? c.coral : c.purple}
          progress={0.25}
          onPress={() => router.push(`/practice/${mode}?lesson=animals-1`)}
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
      <LexText style={{ fontSize: 24 }}>{icon}</LexText>
      <LexText variant="h3" style={{ color: c.ink, marginTop: 4 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ color: c.muted, fontSize: 9 }}>
        {label}
      </LexText>
    </KidCard>
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

function MissionRow({ title, reward, progress, icon }: { title: string; reward: string; progress: number; icon: string }) {
  return (
    <KidCard animated={false} style={styles.missionRow}>
      <LexText style={{ fontSize: 28 }}>{icon}</LexText>
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
  onboardingHero: { flex: 1, marginTop: 16, marginBottom: 18 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  miniStat: { flex: 1, minHeight: 112, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  categoryTile: { width: 112, minHeight: 116, alignItems: 'center', justifyContent: 'center' },
  friendBubble: { width: 88, alignItems: 'center', padding: 12 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  optionsGrid: { gap: 10, marginTop: 16 },
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
