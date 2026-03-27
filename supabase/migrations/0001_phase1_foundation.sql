-- Phase 1 foundation schema for Gas Hacks mobile
-- Target: Supabase Postgres

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  default_unit text default 'gallons' check (default_unit in ('gallons', 'liters')),
  default_location text,
  is_pro boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  year integer,
  make text not null,
  model text not null,
  trim text,
  tank_capacity_gallons numeric(4, 1) not null,
  current_tune text,
  current_ethanol_mix integer,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.fill_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  logged_at timestamptz default now(),

  -- Tank state before fill
  tank_level_before integer not null,
  ethanol_mix_before integer not null,

  -- Targets and blend results
  target_ethanol_mix integer not null,
  resulting_ethanol_mix integer not null,
  resulting_octane integer not null,

  -- Fill inputs
  e85_gallons numeric(6, 2),
  pump_gas_gallons numeric(6, 2),
  pump_gas_octane integer,
  e85_actual_ethanol integer,

  -- Optional context
  station_name text,
  user_notes text,
  track_temp_f integer,
  track_humidity integer,

  -- Cost
  e85_price_per_gallon numeric(6, 2),
  pump_gas_price_per_gallon numeric(6, 2),
  total_cost numeric(8, 2),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.favorite_stations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  has_e85 boolean default true,
  has_100_octane boolean default false,
  typical_e85_price numeric(6, 2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vehicles_user_id on public.vehicles(user_id);
create index if not exists idx_fill_logs_user_id on public.fill_logs(user_id);
create index if not exists idx_fill_logs_vehicle_id on public.fill_logs(vehicle_id);
create index if not exists idx_fill_logs_logged_at on public.fill_logs(logged_at desc);
create index if not exists idx_favorite_stations_user_id on public.favorite_stations(user_id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
  before update on public.vehicles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_fill_logs_updated_at on public.fill_logs;
create trigger set_fill_logs_updated_at
  before update on public.fill_logs
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_favorite_stations_updated_at on public.favorite_stations;
create trigger set_favorite_stations_updated_at
  before update on public.favorite_stations
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.fill_logs enable row level security;
alter table public.favorite_stations enable row level security;

drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Vehicles select own" on public.vehicles;
create policy "Vehicles select own"
  on public.vehicles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Vehicles insert own" on public.vehicles;
create policy "Vehicles insert own"
  on public.vehicles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Vehicles update own" on public.vehicles;
create policy "Vehicles update own"
  on public.vehicles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Vehicles delete own" on public.vehicles;
create policy "Vehicles delete own"
  on public.vehicles
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Fill logs select own" on public.fill_logs;
create policy "Fill logs select own"
  on public.fill_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Fill logs insert own" on public.fill_logs;
create policy "Fill logs insert own"
  on public.fill_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Fill logs update own" on public.fill_logs;
create policy "Fill logs update own"
  on public.fill_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Fill logs delete own" on public.fill_logs;
create policy "Fill logs delete own"
  on public.fill_logs
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Favorite stations select own" on public.favorite_stations;
create policy "Favorite stations select own"
  on public.favorite_stations
  for select
  using (auth.uid() = user_id);

drop policy if exists "Favorite stations insert own" on public.favorite_stations;
create policy "Favorite stations insert own"
  on public.favorite_stations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Favorite stations update own" on public.favorite_stations;
create policy "Favorite stations update own"
  on public.favorite_stations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Favorite stations delete own" on public.favorite_stations;
create policy "Favorite stations delete own"
  on public.favorite_stations
  for delete
  using (auth.uid() = user_id);
