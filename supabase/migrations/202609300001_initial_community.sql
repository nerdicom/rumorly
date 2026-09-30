begin;

-- Internal privileged helpers are outside the Data API's exposed schemas.
create schema rumorly_private;
revoke all on schema rumorly_private from public, anon;
grant usage on schema rumorly_private to authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Curious human' check (char_length(btrim(display_name)) between 1 and 30),
  created_at timestamptz not null default now()
);
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 12 and 120),
  body text not null check (char_length(btrim(body)) between 30 and 1000),
  source text not null default '' check (char_length(source) <= 2000 and (source = '' or source ~ '^https://[^/@[:space:]]+\.[^/@[:space:]]+')),
  topic text not null check (topic in ('Reality TV', 'Creators', 'Music', 'Internet')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','published','rejected','removed')),
  editorial_status text not null default 'Unverified' check (editorial_status in ('Unverified','Developing','Updated')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create table public.story_updates (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 20 and 1000),
  source text not null default '' check (char_length(source) <= 2000 and (source = '' or source ~ '^https://[^/@[:space:]]+\.[^/@[:space:]]+')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','published','rejected','removed')),
  created_at timestamptz not null default now()
);
create table public.votes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (story_id, user_id)
);
create table public.follows (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (story_id, user_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('Harassment or bullying','Private information','Involves a minor','Misleading or missing context','Other')),
  details text not null default '' check (char_length(details) <= 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (story_id, user_id)
);
create table public.blocks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('story','context')),
  content_id uuid not null,
  decision text not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  actor text not null,
  created_at timestamptz not null default now()
);

create index stories_feed_idx on public.stories (created_at desc) where moderation_status = 'published';
create index stories_author_idx on public.stories (author_id, created_at desc);
create index updates_story_idx on public.story_updates (story_id, created_at);
create index updates_author_idx on public.story_updates (author_id);
create index votes_user_idx on public.votes (user_id);
create index follows_user_idx on public.follows (user_id);
create index reports_user_idx on public.reports (user_id);
create index blocks_blocked_idx on public.blocks (blocked_id);

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_updates enable row level security;
alter table public.votes enable row level security;
alter table public.follows enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.moderation_actions enable row level security;

-- Remove Supabase's broad default grants. Column grants prevent self-publication,
-- forged timestamps, editorial changes, report resolution, and role escalation.
revoke all on public.profiles, public.stories, public.story_updates, public.votes,
  public.follows, public.reports, public.blocks, public.moderation_actions from anon, authenticated;
grant select on public.profiles, public.stories, public.story_updates, public.votes,
  public.follows, public.reports, public.blocks to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert (author_id,title,body,source,topic) on public.stories to authenticated;
grant insert (story_id,author_id,body,source) on public.story_updates to authenticated;
grant insert (story_id,user_id,value), update (value), delete on public.votes to authenticated;
grant insert (story_id,user_id), delete on public.follows to authenticated;
grant insert (story_id,user_id,reason,details), update (reason,details) on public.reports to authenticated;
grant insert (user_id,blocked_id), delete on public.blocks to authenticated;
grant all on public.profiles, public.stories, public.story_updates, public.votes,
  public.follows, public.reports, public.blocks, public.moderation_actions to service_role;

-- An insert into reports must not recursively expand stories -> reports policies.
-- This helper only answers whether the current caller can report a published story.
create function rumorly_private.can_report_story(target_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.stories s where s.id = target_id and s.moderation_status = 'published'
    and not exists (select 1 from public.blocks b where b.user_id = auth.uid() and b.blocked_id = s.author_id)
  );
$$;
revoke all on function rumorly_private.can_report_story(uuid) from public, anon;
grant execute on function rumorly_private.can_report_story(uuid) to authenticated;

create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_edit on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy stories_read on public.stories for select to authenticated using (
  author_id = (select auth.uid()) or (
    moderation_status = 'published'
    and not exists (select 1 from public.blocks b where b.user_id = (select auth.uid()) and b.blocked_id = stories.author_id)
    and not exists (select 1 from public.reports r where r.user_id = (select auth.uid()) and r.story_id = stories.id)
  )
);
create policy stories_submit on public.stories for insert to authenticated with check (author_id = (select auth.uid()) and moderation_status = 'pending');
create policy updates_read on public.story_updates for select to authenticated using (
  author_id = (select auth.uid()) or (
    moderation_status = 'published'
    and exists (select 1 from public.stories s where s.id = story_updates.story_id and s.moderation_status = 'published')
    and not exists (select 1 from public.blocks b where b.user_id = (select auth.uid()) and b.blocked_id = story_updates.author_id)
  )
);
create policy updates_submit on public.story_updates for insert to authenticated with check (
  author_id = (select auth.uid()) and moderation_status = 'pending'
  and exists (select 1 from public.stories s where s.id = story_updates.story_id and s.moderation_status = 'published')
);
create policy votes_read on public.votes for select to authenticated using (user_id = (select auth.uid()));
create policy votes_insert on public.votes for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.stories s where s.id = votes.story_id and s.moderation_status = 'published')
);
create policy votes_update on public.votes for update to authenticated using (user_id = (select auth.uid())) with check (
  user_id = (select auth.uid()) and exists (select 1 from public.stories s where s.id = votes.story_id and s.moderation_status = 'published')
);
create policy votes_delete on public.votes for delete to authenticated using (user_id = (select auth.uid()));
create policy follows_read on public.follows for select to authenticated using (user_id = (select auth.uid()));
create policy follows_insert on public.follows for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.stories s where s.id = follows.story_id and s.moderation_status = 'published')
);
create policy follows_delete on public.follows for delete to authenticated using (user_id = (select auth.uid()));
create policy reports_read on public.reports for select to authenticated using (user_id = (select auth.uid()));
create policy reports_insert on public.reports for insert to authenticated with check (
  user_id = (select auth.uid()) and rumorly_private.can_report_story(story_id)
);
create policy reports_update on public.reports for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy blocks_read on public.blocks for select to authenticated using (user_id = (select auth.uid()));
create policy blocks_insert on public.blocks for insert to authenticated with check (user_id = (select auth.uid()));
create policy blocks_delete on public.blocks for delete to authenticated using (user_id = (select auth.uid()));

create function rumorly_private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,display_name) values (new.id, coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),30),''),'Curious human'));
  return new;
end;
$$;
revoke all on function rumorly_private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure rumorly_private.handle_new_user();
insert into public.profiles (id,display_name)
select id, coalesce(nullif(left(btrim(raw_user_meta_data->>'display_name'),30),''),'Curious human') from auth.users on conflict (id) do nothing;

-- Expose only totals, never another person's voting history. Definer privilege is
-- narrowly scoped to this aggregate and explicitly repeats the story visibility rules.
create function rumorly_private.story_scores(story_ids uuid[]) returns table (story_id uuid, score bigint)
language sql stable security definer set search_path = '' as $$
  select s.id, coalesce(sum(v.value),0)::bigint
  from public.stories s left join public.votes v on v.story_id = s.id
  where auth.uid() is not null and cardinality(story_ids) <= 100 and s.id = any(story_ids)
    and s.moderation_status = 'published'
    and not exists (select 1 from public.blocks b where b.user_id = auth.uid() and b.blocked_id = s.author_id)
    and not exists (select 1 from public.reports r where r.user_id = auth.uid() and r.story_id = s.id)
  group by s.id;
$$;
revoke all on function rumorly_private.story_scores(uuid[]) from public, anon;
grant execute on function rumorly_private.story_scores(uuid[]) to authenticated;

create function public.story_scores(story_ids uuid[]) returns table (story_id uuid, score bigint)
language sql stable security invoker set search_path = '' as $$
  select * from rumorly_private.story_scores(story_ids);
$$;
revoke all on function public.story_scores(uuid[]) from public, anon;
grant execute on function public.story_scores(uuid[]) to authenticated;

-- Operator-only review, initially used from the Supabase SQL editor. Mobile
-- clients cannot invoke it, change moderation fields, or assign themselves roles.
create function public.review_content(content_kind text, target_id uuid, decision text, note text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if decision not in ('published','rejected','removed') or decision is null then raise exception 'Invalid decision'; end if;
  if note is null or char_length(btrim(note)) not between 1 and 1000 then raise exception 'A review reason is required'; end if;
  if content_kind = 'story' then
    update public.stories set moderation_status = decision,
      published_at = case when decision = 'published' then coalesce(published_at,now()) else published_at end where id = target_id;
  elsif content_kind = 'context' then
    update public.story_updates set moderation_status = decision where id = target_id;
  else raise exception 'Invalid content type'; end if;
  if not found then raise exception 'Content not found'; end if;
  insert into public.moderation_actions (content_type,content_id,decision,reason,actor)
    values (content_kind,target_id,decision,btrim(note),coalesce(auth.uid()::text,session_user));
end;
$$;
revoke all on function public.review_content(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.review_content(text,uuid,text,text) to service_role;

commit;
