-- Fuel-sharing schema. Applied once via scripts/migrate.mjs.
-- All access goes through the server using the Supabase secret key, so RLS
-- is enabled with no policies: only the secret key (which bypasses RLS) can
-- read/write these tables.

create extension if not exists pgcrypto;

create table if not exists app_users (
  id text primary key, -- Clerk user id
  name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('manager', 'member')),
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;

create table if not exists drives (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id),
  start_km numeric not null,
  end_km numeric,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  note text,
  constraint end_km_after_start check (end_km is null or end_km >= start_km)
);

alter table drives enable row level security;

-- Only one drive can be "in progress" (end_km/ended_at null) at a time,
-- since there's a single shared car.
create unique index if not exists one_open_drive_idx
  on drives ((true))
  where ended_at is null;

create index if not exists drives_user_id_idx on drives (user_id);

create table if not exists refuels (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id), -- who paid
  km numeric not null,
  cost numeric(10, 2) not null check (cost > 0),
  liters numeric(10, 2),
  refueled_at timestamptz not null default now(),
  note text
);

alter table refuels enable row level security;

create index if not exists refuels_user_id_idx on refuels (user_id);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  from_user_id text not null references app_users(id),
  to_user_id text not null references app_users(id),
  amount numeric(10, 2) not null check (amount > 0),
  settled_at timestamptz not null default now(),
  note text
);

alter table settlements enable row level security;
