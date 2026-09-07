begin;

-- 관리자 지정은 SQL Editor에서만 가능하며 브라우저는 변경할 수 없음
create table public.archive_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.archive_admins enable row level security;
revoke all on public.archive_admins from anon, authenticated;
grant select on public.archive_admins to authenticated;
create policy "Read own admin membership" on public.archive_admins
  for select to authenticated using (user_id = (select auth.uid()));

create function public.is_archive_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.archive_admins where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_archive_admin() from public, anon;
grant execute on function public.is_archive_admin() to authenticated;

create table public.archive_posts (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null default auth.uid() references auth.users(id),
  title text not null check (length(btrim(title)) between 1 and 200),
  content text not null check (length(btrim(content)) between 1 and 50000),
  language text check (language in ('javascript', 'typescript', 'tsx', 'java', 'python', 'html', 'css', 'sql', 'bash', 'json')),
  code_text text check (length(code_text) <= 50000),
  tags text[] check (cardinality(tags) <= 20),
  status text not null default 'unsolved' check (status in ('solved', 'unsolved')),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.valid_archive_blocks(blocks jsonb) returns boolean
language plpgsql immutable set search_path = ''
as $$
declare block jsonb;
begin
  if blocks is null or jsonb_typeof(blocks) <> 'array' then return false; end if;
  if jsonb_array_length(blocks) not between 1 and 100 or octet_length(blocks::text) > 200000 then return false; end if;
  for block in select * from jsonb_array_elements(blocks) loop
    if jsonb_typeof(block) <> 'object' then return false; end if;
    if block->>'type' = 'paragraph' then
      if jsonb_typeof(block->'text') is distinct from 'string'
        or length(btrim(block->>'text')) = 0 then return false; end if;
    elsif block->>'type' = 'code' then
      if jsonb_typeof(block->'codeText') is distinct from 'string'
        or length(btrim(block->>'codeText')) = 0
        or coalesce(block->>'language', '') not in ('javascript', 'typescript', 'tsx', 'java', 'python', 'html', 'css', 'sql', 'bash', 'json')
      then return false; end if;
    else return false;
    end if;
  end loop;
  return true;
end;
$$;

create table public.archive_answers (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references public.archive_posts(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id),
  blocks jsonb not null check (public.valid_archive_blocks(blocks)),
  created_at timestamptz not null default now()
);
create index archive_posts_created_at_idx on public.archive_posts (created_at desc, id);
create index archive_posts_owner_id_idx on public.archive_posts (owner_id);
create index archive_answers_post_id_idx on public.archive_answers (post_id, created_at, id);
create index archive_answers_owner_id_idx on public.archive_answers (owner_id);

create function public.touch_archive_post() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger archive_posts_updated_at before update on public.archive_posts
  for each row execute function public.touch_archive_post();

alter table public.archive_posts enable row level security;
alter table public.archive_answers enable row level security;
revoke all on public.archive_posts, public.archive_answers from anon, authenticated;
grant select on public.archive_posts, public.archive_answers to anon, authenticated;
grant insert, update, delete on public.archive_posts to authenticated;
grant insert, delete on public.archive_answers to authenticated;

create policy "Read public posts" on public.archive_posts
  for select to anon, authenticated using (is_public);
create policy "Read own private posts" on public.archive_posts
  for select to authenticated using ((select public.is_archive_admin()) and owner_id = (select auth.uid()));
create policy "Admin creates own posts" on public.archive_posts
  for insert to authenticated with check ((select public.is_archive_admin()) and owner_id = (select auth.uid()));
create policy "Admin updates own posts" on public.archive_posts
  for update to authenticated
  using ((select public.is_archive_admin()) and owner_id = (select auth.uid()))
  with check ((select public.is_archive_admin()) and owner_id = (select auth.uid()));
create policy "Admin deletes own posts" on public.archive_posts
  for delete to authenticated using ((select public.is_archive_admin()) and owner_id = (select auth.uid()));

-- 게시글의 조회 정책을 통과해야 답변도 조회 가능
create policy "Read answers of visible posts" on public.archive_answers
  for select to anon, authenticated using (exists (
    select 1 from public.archive_posts p where p.id = post_id
  ));
create policy "Admin answers own posts" on public.archive_answers
  for insert to authenticated with check (
    (select public.is_archive_admin()) and owner_id = (select auth.uid())
    and exists (select 1 from public.archive_posts p where p.id = post_id and p.owner_id = (select auth.uid()))
  );
create policy "Admin deletes own answers" on public.archive_answers
  for delete to authenticated using ((select public.is_archive_admin()) and owner_id = (select auth.uid()));

-- 답변 저장과 해결완료 처리를 하나의 트랜잭션으로 실행
create function public.save_archive_answer(p_post_id text, p_blocks jsonb, p_mark_solved boolean default false)
returns setof public.archive_answers
language plpgsql security invoker set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise insufficient_privilege; end if;
  perform 1 from public.archive_posts
    where id = p_post_id and owner_id = (select auth.uid()) for update;
  if not found then raise exception 'Post unavailable' using errcode = '42501'; end if;
  if p_mark_solved then
    update public.archive_posts set status = 'solved' where id = p_post_id;
  end if;
  return query insert into public.archive_answers (post_id, blocks)
    values (p_post_id, p_blocks) returning *;
end;
$$;
revoke all on function public.save_archive_answer(text, jsonb, boolean) from public, anon;
grant execute on function public.save_archive_answer(text, jsonb, boolean) to authenticated;
revoke all on function public.touch_archive_post() from public, anon, authenticated;
revoke all on function public.valid_archive_blocks(jsonb) from public, anon;
grant execute on function public.valid_archive_blocks(jsonb) to authenticated;

commit;
