-- Profile extras: every user has a username (3-20 chars, [a-z0-9_]).
-- display_name, bio, location are optional.

alter table public.profiles
  add column username text unique,
  add column display_name text,
  add column bio text,
  add column location text;

-- Username format guard at the DB layer so the UI can't lie.
alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9_]{3,20}$');

-- Gear: per-user rig items. Public read, owner-only writes.

create type public.gear_kind as enum ('guitar', 'bass', 'amp', 'pedal', 'other');

create table public.gear (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind public.gear_kind not null,
  brand text not null,
  model text not null,
  year int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gear enable row level security;

create policy "Anyone can read gear"
  on public.gear for select
  using (true);

create policy "Users can insert their own gear"
  on public.gear for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own gear"
  on public.gear for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own gear"
  on public.gear for delete
  using (auth.uid() = owner_id);

-- Reuse the set_updated_at function from the profiles migration.
create trigger gear_updated_at
  before update on public.gear
  for each row execute function public.set_updated_at();

create index gear_owner_id_idx on public.gear (owner_id, created_at desc);
