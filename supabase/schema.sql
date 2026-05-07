-- MusclesBuzz PostgreSQL schema for Supabase
-- Run this in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  profile_picture_url text,
  country text,
  age int,
  language text not null default 'en',
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.foods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  protein_per_100g numeric not null default 0,
  fat_per_100g numeric not null default 0,
  carbs_per_100g numeric not null default 0,
  sodium_per_100g numeric not null default 0,
  calories_per_100g numeric not null default 0,
  water_per_100g numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_intakes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  date date not null,
  consumed_grams numeric not null default 0,
  calculated_protein numeric not null default 0,
  calculated_fat numeric not null default 0,
  calculated_carbs numeric not null default 0,
  calculated_sodium numeric not null default 0,
  calculated_calories numeric not null default 0,
  calculated_water numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  notes text,
  body_part_tag text not null,
  manual_pr_weight numeric not null default 0,
  manual_pr_reps int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  body_part_tag text not null,
  calories_burned numeric not null default 0,
  duration_minutes numeric,
  speed numeric,
  steps int,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_entry_id uuid not null references public.workout_entries(id) on delete cascade,
  set_number int not null,
  reps int,
  weight numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.body_weight_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  body_weight numeric not null,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.body_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  tag text not null check (tag in ('full','legs','biceps','back','abs','side')),
  image_path text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.personal_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_foods_user on public.foods(user_id);
create index if not exists idx_food_intakes_user_date on public.food_intakes(user_id, date);
create index if not exists idx_exercises_user_tag on public.exercises(user_id, body_part_tag);
create index if not exists idx_workout_sessions_user_date on public.workout_sessions(user_id, date);
create index if not exists idx_workout_entries_user on public.workout_entries(user_id);
create index if not exists idx_body_weight_user_date on public.body_weight_logs(user_id, date);
create index if not exists idx_body_photos_user_date_tag on public.body_photos(user_id, date, tag);
create index if not exists idx_notes_user on public.personal_notes(user_id);

alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.food_intakes enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_entries enable row level security;
alter table public.workout_sets enable row level security;
alter table public.body_weight_logs enable row level security;
alter table public.body_photos enable row level security;
alter table public.personal_notes enable row level security;

-- RLS policies for direct Supabase access. Backend service role bypasses RLS.
create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "foods own rows" on public.foods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "food_intakes own rows" on public.food_intakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises own rows" on public.exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sessions own rows" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_entries own rows" on public.workout_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_weight own rows" on public.body_weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_photos own rows" on public.body_photos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes own rows" on public.personal_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workout_sets policy uses parent workout_entries ownership.
create policy "workout_sets own rows" on public.workout_sets
for all using (
  exists (
    select 1 from public.workout_entries we
    where we.id = workout_sets.workout_entry_id and we.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workout_entries we
    where we.id = workout_sets.workout_entry_id and we.user_id = auth.uid()
  )
);
