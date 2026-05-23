-- Lexora — Supabase Schema (Prompt 2)
-- Apply in Supabase SQL Editor.
-- Notes:
-- - Uses UUID primary keys.
-- - Enables RLS + starter policies.
-- - Words + categories are readable by authenticated users.
-- - User-owned tables: read/write only by owner.

-- Extensions
create extension if not exists "pgcrypto";

-- WORDS
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  phonetic text,
  part_of_speech text,
  definition text,
  short_definition text,
  etymology text,
  difficulty_level int check (difficulty_level between 1 and 5),
  frequency_rank int,
  categories text[] default '{}'::text[],
  example_sentences jsonb default '[]'::jsonb,
  synonyms text[] default '{}'::text[],
  antonyms text[] default '{}'::text[],
  image_url text,
  audio_url text,
  mnemonic text,
  created_at timestamp with time zone default now()
);

-- CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text,
  description text,
  word_count int default 0,
  color text,
  is_premium boolean default false
);

-- USER PROFILES
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  level int default 1,
  xp_total int default 0,
  streak_current int default 0,
  streak_longest int default 0,
  streak_last_date date,
  daily_goal_words int default 10,
  proficiency_level text,
  selected_categories text[] default '{}'::text[],
  is_premium boolean default false,
  created_at timestamp with time zone default now()
);

-- USER WORD PROGRESS
create table if not exists public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null references public.words(id) on delete cascade,
  status text not null default 'new',
  ease_factor float default 2.5,
  interval int default 1,
  repetitions int default 0,
  next_review_date date,
  last_reviewed_at timestamp with time zone,
  correct_count int default 0,
  incorrect_count int default 0,
  first_seen_at timestamp with time zone default now(),
  mastered_at timestamp with time zone,
  unique (user_id, word_id)
);

-- USER DAILY STATS
create table if not exists public.user_daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  words_learned int default 0,
  words_reviewed int default 0,
  xp_earned int default 0,
  time_spent_seconds int default 0,
  sessions_count int default 0,
  accuracy_percent float default 0,
  unique (user_id, date)
);

-- USER ACHIEVEMENTS
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_slug text not null,
  unlocked_at timestamp with time zone default now(),
  unique (user_id, achievement_slug)
);

-- Enable RLS
alter table public.words enable row level security;
alter table public.categories enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_word_progress enable row level security;
alter table public.user_daily_stats enable row level security;
alter table public.user_achievements enable row level security;

-- Policies: public words/categories readable to authenticated
drop policy if exists "Words are readable by authenticated" on public.words;
create policy "Words are readable by authenticated"
on public.words
for select
to authenticated
using (true);

drop policy if exists "Categories are readable by authenticated" on public.categories;
create policy "Categories are readable by authenticated"
on public.categories
for select
to authenticated
using (true);

-- User-owned policies
drop policy if exists "Profiles are readable by owner" on public.user_profiles;
create policy "Profiles are readable by owner"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.user_profiles;
create policy "Profiles are updatable by owner"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Progress is readable by owner" on public.user_word_progress;
create policy "Progress is readable by owner"
on public.user_word_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Progress is writable by owner" on public.user_word_progress;
create policy "Progress is writable by owner"
on public.user_word_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Daily stats readable by owner" on public.user_daily_stats;
create policy "Daily stats readable by owner"
on public.user_daily_stats
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Daily stats writable by owner" on public.user_daily_stats;
create policy "Daily stats writable by owner"
on public.user_daily_stats
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Achievements readable by owner" on public.user_achievements;
create policy "Achievements readable by owner"
on public.user_achievements
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Achievements writable by owner" on public.user_achievements;
create policy "Achievements writable by owner"
on public.user_achievements
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

