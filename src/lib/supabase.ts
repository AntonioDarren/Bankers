import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigData {
  url: string;
  anonKey: string;
}

const RUNTIME_SUPABASE_STORAGE_KEY = 'bankers_runtime_supabase_config_v1';

export const SUPABASE_SQL_SCHEMA = `-- Run this in Supabase Dashboard -> SQL Editor -> New Query
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
  on public.bankers_users for all using (true) with check (true);

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
  on public.bankers_feedback for all using (true) with check (true);`;

export const getEnvSupabaseConfig = (): SupabaseConfigData | null => {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (url && anonKey && url.startsWith('http')) {
    return { url, anonKey };
  }
  return null;
};

export const getRuntimeSupabaseConfig = (): SupabaseConfigData | null => {
  try {
    const raw = localStorage.getItem(RUNTIME_SUPABASE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.url === 'string' &&
      typeof parsed.anonKey === 'string' &&
      parsed.url.startsWith('http') &&
      parsed.anonKey.length > 10
    ) {
      return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
    }
  } catch {
    // Ignore parse error
  }
  return null;
};

export const getActiveSupabaseConfig = (): SupabaseConfigData | null => {
  return getRuntimeSupabaseConfig() || getEnvSupabaseConfig();
};

export const saveRuntimeSupabaseConfig = (config: SupabaseConfigData) => {
  try {
    localStorage.setItem(RUNTIME_SUPABASE_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore write error
  }
};

export const clearRuntimeSupabaseConfig = () => {
  try {
    localStorage.removeItem(RUNTIME_SUPABASE_STORAGE_KEY);
  } catch {
    // Ignore error
  }
};

let cachedClient: SupabaseClient | null = null;
let cachedKeySignature = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getActiveSupabaseConfig();
  if (!config) {
    cachedClient = null;
    cachedKeySignature = '';
    return null;
  }

  const sig = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedKeySignature === sig) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedKeySignature = sig;
    return cachedClient;
  } catch (err) {
    console.error('Supabase initialization error:', err);
    return null;
  }
};

export const getSupabaseProjectHost = (config: SupabaseConfigData | null): string | null => {
  if (!config?.url) return null;
  try {
    const u = new URL(config.url);
    return u.hostname.replace('.supabase.co', '');
  } catch {
    return config.url;
  }
};
