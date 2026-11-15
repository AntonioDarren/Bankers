-- ============================================================================
-- BANKERS — Supabase PostgreSQL Database Schema
-- How to run:
-- 1. Open your Supabase Dashboard -> SQL Editor -> New Query
-- 2. Paste this entire file and click "Run"
-- 3. In Authentication -> Providers -> Email, turn OFF "Confirm email"
--    so university testers can sign up and log in immediately!
-- ============================================================================

-- 1. Users & Financial Data Table
create table if not exists public.bankers_users (
  id text primary key,
  email text unique not null,
  onboarding_completed boolean default false,
  onboarding_answers jsonb default '{}'::jsonb,
  onboarding_custom_answers jsonb default '{}'::jsonb,
  profile jsonb default '{}'::jsonb,
  wallets jsonb default '[]'::jsonb,
  transactions jsonb default '[]'::jsonb,
  notifications jsonb default '[]'::jsonb,
  feedbacks jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bankers_users add column if not exists feedbacks jsonb default '[]'::jsonb;

alter table public.bankers_users enable row level security;

drop policy if exists "Allow authenticated and anon access for uni project" on public.bankers_users;
create policy "Allow authenticated and anon access for uni project"
  on public.bankers_users
  for all
  using (true)
  with check (true);

-- 2. Dedicated User Feedback Table (Easy to view all feedbacks in Supabase Table Editor)
create table if not exists public.bankers_feedback (
  id text primary key,
  user_email text not null,
  user_name text not null,
  rating integer default 5,
  message text not null,
  created_at timestamptz default now()
);

alter table public.bankers_feedback enable row level security;

drop policy if exists "Allow feedback insert and select for uni project" on public.bankers_feedback;
create policy "Allow feedback insert and select for uni project"
  on public.bankers_feedback
  for all
  using (true)
  with check (true);
