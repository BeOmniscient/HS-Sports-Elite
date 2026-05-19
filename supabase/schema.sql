-- Run this in your Supabase SQL editor to set up the database

-- ── Profiles (extends Supabase auth.users) ────────────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  email        text unique not null,
  full_name    text,
  avatar_url   text,
  is_subscriber boolean not null default false,
  subscription_tier text check (subscription_tier in ('free','monthly','annual')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_ends_at timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow service role to upsert (needed for webhook)
create policy "Service role full access to profiles" on public.profiles
  using (true) with check (true);

-- ── Ad bookings ────────────────────────────────────────────────────────────
create table if not exists public.ad_bookings (
  id                      uuid primary key default gen_random_uuid(),
  slot_type               text not null,
  business_name           text not null,
  contact_email           text not null,
  contact_name            text not null default '',
  creative_url            text,
  link_url                text not null default '',
  sport                   text,
  school_slug             text,
  duration_type           text not null check (duration_type in ('weekly','monthly','seasonal')),
  starts_at               timestamptz not null default now(),
  ends_at                 timestamptz not null,
  price_cents             integer not null,
  stripe_session_id       text unique,
  stripe_payment_intent_id text,
  status                  text not null default 'pending_payment'
                            check (status in ('pending_payment','active','expired','cancelled')),
  created_at              timestamptz not null default now()
);

alter table public.ad_bookings enable row level security;

-- Only service role can insert/update ad_bookings (via webhooks)
-- Public can read active ads for display
create policy "Public can read active ads" on public.ad_bookings
  for select using (status = 'active' and ends_at > now());

-- ── Newsletter subscribers ─────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  name           text,
  is_active      boolean not null default true,
  subscribed_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- ── Auto-expire ads (cron or trigger) ────────────────────────────────────
-- Optionally run this nightly via Supabase cron extension:
-- update public.ad_bookings set status = 'expired'
-- where status = 'active' and ends_at < now();

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_ad_bookings_status_slot on public.ad_bookings(status, slot_type);
create index if not exists idx_ad_bookings_ends_at on public.ad_bookings(ends_at);
create index if not exists idx_profiles_email on public.profiles(email);
