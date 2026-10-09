-- 33C & 34C — database schema for Supabase.
-- Paste the whole file into Supabase → SQL Editor and Run. Nothing to edit.
--
-- Optional lock: to allow only phones that opened the join link
-- https://your-app.vercel.app/?key=<phrase>, replace `select true` below with
--   select coalesce(current_setting('request.headers', true)::json ->> 'x-family-key', '') = '<phrase>'
-- and run this file again.

create extension if not exists pgcrypto;

create or replace function public.family_ok() returns boolean
language sql stable as $$
  select true
$$;

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  from_id text not null,
  to_id text not null,
  body text not null,
  howler boolean not null default false,
  sent_at timestamptz not null default now(),
  read_by text[] not null default '{}'
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  asked_by text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  by_id text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.points (
  id uuid primary key default gen_random_uuid(),
  member text not null,
  amount integer not null,
  reason text not null,
  at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  added_by text not null
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  member text not null,
  score integer not null,
  at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  member text not null,
  place text not null,
  lat double precision not null,
  lon double precision not null,
  note text not null default '',
  at timestamptz not null default now()
);

-- Drawings, guesses, fashion designs, hearts… one flexible table.
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  by_id text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists items_kind on public.items (kind, updated_at desc);

-- Only phones holding the family key can read or write.
do $$
declare t text;
begin
  foreach t in array array['letters','questions','answers','points','events','scores','checkins','items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists family_read on public.%I', t);
    execute format('drop policy if exists family_insert on public.%I', t);
    execute format('drop policy if exists family_update on public.%I', t);
    execute format('create policy family_read on public.%I for select using (public.family_ok())', t);
    execute format('create policy family_insert on public.%I for insert with check (public.family_ok())', t);
    execute format('create policy family_update on public.%I for update using (public.family_ok()) with check (public.family_ok())', t);
  end loop;
end $$;

-- Phone notifications: one row per phone that turned them on.
create table if not exists public.push_subs (
  id text primary key,
  member text not null,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists family_read on public.push_subs;
drop policy if exists family_insert on public.push_subs;
drop policy if exists family_update on public.push_subs;
drop policy if exists family_delete on public.push_subs;
create policy family_read on public.push_subs for select using (public.family_ok());
create policy family_insert on public.push_subs for insert with check (public.family_ok());
create policy family_update on public.push_subs for update using (public.family_ok()) with check (public.family_ok());
create policy family_delete on public.push_subs for delete using (public.family_ok());
