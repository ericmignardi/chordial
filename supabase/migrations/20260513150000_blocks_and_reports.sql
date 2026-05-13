-- Blocks: a user (blocker) silences another user (blocked).
-- Composite PK prevents duplicates.

create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

-- Only the blocker can see their own block rows (avoids leaking who blocked whom).
create policy "Users can see their own blocks"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Users can block as themselves"
  on public.blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Users can unblock their own blocks"
  on public.blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);

create index blocks_blocker_id_idx on public.blocks (blocker_id, created_at desc);
create index blocks_blocked_id_idx on public.blocks (blocked_id);

-- is_blocked(viewer, target) returns true if either side has blocked the other.
-- security definer so RLS-restricted select policies on `blocks` can still query
-- the full set when the caller is the viewer.

create or replace function public.is_blocked(viewer uuid, target uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = viewer and blocked_id = target)
       or (blocker_id = target and blocked_id = viewer)
  );
$$;

-- Reports: arbitrary user-generated abuse reports. Admins review out-of-band.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'user', 'comment')),
  target_id uuid not null,
  reason text not null check (char_length(reason) > 0 and char_length(reason) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can see their own reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Users can submit reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create index reports_reporter_id_idx on public.reports (reporter_id, created_at desc);
create index reports_target_idx on public.reports (target_type, target_id);

-- Refresh existing SELECT policies to apply the block filter.
-- Authenticated users cannot see posts/comments/profiles where either side has blocked the other.

drop policy if exists "Posts are publicly readable" on public.posts;
create policy "Posts are publicly readable"
  on public.posts for select
  using (
    auth.uid() is null
    or not public.is_blocked(auth.uid(), author_id)
  );

drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable"
  on public.comments for select
  using (
    auth.uid() is null
    or not public.is_blocked(auth.uid(), author_id)
  );

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (
    auth.uid() is null
    or auth.uid() = id
    or not public.is_blocked(auth.uid(), id)
  );

-- Account deletion: invokable by the signed-in user; removes their auth row,
-- which cascades to profiles (and thus posts, gear, follows, blocks, etc.).

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
