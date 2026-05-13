-- Loosen profiles SELECT so other users' profile rows can be embedded into
-- feed queries. Usernames and avatars are public per the product design.

drop policy if exists "profiles are viewable by owner" on public.profiles;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- Posts: photo + caption, owned by author.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text check (caption is null or char_length(caption) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are publicly readable"
  on public.posts for select
  using (true);

create policy "Users can create their own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create index posts_author_id_idx on public.posts (author_id, created_at desc);
create index posts_created_at_idx on public.posts (created_at desc);

-- post_images: separate table so multi-image is trivial to add later.

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  ordinal int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_images enable row level security;

create policy "Post images are publicly readable"
  on public.post_images for select
  using (true);

create policy "Users can attach images to their own posts"
  on public.post_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts
      where id = post_id and author_id = auth.uid()
    )
  );

create policy "Users can delete images of their own posts"
  on public.post_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts
      where id = post_id and author_id = auth.uid()
    )
  );

create index post_images_post_id_idx on public.post_images (post_id, ordinal);

-- likes: composite PK (post_id, user_id) prevents double-likes at the DB layer.

create table public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are publicly readable"
  on public.likes for select
  using (true);

create policy "Users can like as themselves"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);

create index likes_post_id_idx on public.likes (post_id);

-- comments

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 500),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Comments are publicly readable"
  on public.comments for select
  using (true);

create policy "Users can create their own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);

create index comments_post_id_idx on public.comments (post_id, created_at);
