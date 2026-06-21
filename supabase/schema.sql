-- CupidList — per-user data store.
-- Run this once in your Supabase project (SQL Editor → New query → Run).
--
-- One row per user. Friends and matches are stored as JSON, mirroring the
-- app's "save the whole list" model. Access is server-side only (via the
-- service-role key in our API routes), which is why RLS is enabled with no
-- public policies: the anon/public key cannot read or write this table.

create table if not exists public.user_data (
  user_id    text primary key,
  friends    jsonb not null default '[]'::jsonb,
  matches    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- No policies are created on purpose: with RLS enabled and no policies, the
-- anon/public role is denied all access. The service-role key used by the
-- server bypasses RLS, so the app still works while direct browser access is
-- blocked.
