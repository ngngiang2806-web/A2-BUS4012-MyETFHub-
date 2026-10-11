-- MyETFHub initial schema migration.
-- Prepared only: applying this file requires explicit approval in the Supabase SQL Editor.
-- This migration intentionally creates new objects and does not drop or replace existing data.

create extension if not exists pgcrypto;

create table if not exists public.investor_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    email_address text not null check (length(btrim(email_address)) > 0),
    full_name text not null check (length(btrim(full_name)) between 1 and 200),
    investment_goal text not null check (
        investment_goal in ('capital-growth', 'income-generation', 'capital-preservation')
    ),
    risk_preference text not null check (
        risk_preference in ('conservative', 'moderate', 'aggressive')
    ),
    investment_timeframe text not null check (
        investment_timeframe in ('short-term', 'medium-term', 'long-term')
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.etf_holdings (
    holding_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    ticker text not null check (
        ticker = upper(ticker)
        and ticker ~ '^[A-Z0-9._-]{1,15}$'
    ),
    units numeric(18, 6) not null check (units > 0),
    purchase_price numeric(18, 2) not null check (purchase_price >= 0),
    purchase_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists etf_holdings_user_id_purchase_date_idx
    on public.etf_holdings (user_id, purchase_date desc, created_at desc);

-- The migration framework should execute this file once. These names are intentionally specific
-- to MyETFHub so it does not alter a generic timestamp trigger used by another application.
create function public.myetfhub_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger myetfhub_investor_profiles_set_updated_at
before update on public.investor_profiles
for each row execute function public.myetfhub_set_updated_at();

create trigger myetfhub_etf_holdings_set_updated_at
before update on public.etf_holdings
for each row execute function public.myetfhub_set_updated_at();

alter table public.investor_profiles enable row level security;
alter table public.etf_holdings enable row level security;

create policy "Users can view their own investor profile"
on public.investor_profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own investor profile"
on public.investor_profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own investor profile"
on public.investor_profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can view their own ETF holdings"
on public.etf_holdings
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own ETF holdings"
on public.etf_holdings
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own ETF holdings"
on public.etf_holdings
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own ETF holdings"
on public.etf_holdings
for delete to authenticated
using ((select auth.uid()) = user_id);