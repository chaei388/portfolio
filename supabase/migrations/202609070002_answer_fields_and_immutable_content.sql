begin;

-- 수정일은 사용하지 않음. 대시보드에서 컬럼만 삭제한 경우 남은 트리거도 정리.
drop trigger if exists archive_posts_updated_at on public.archive_posts;
drop function if exists public.touch_archive_post();
alter table public.archive_posts drop column if exists updated_at;

-- 문단 사이의 코드는 Markdown 본문으로 보존하고 마지막 코드는 선택 코드 칸으로 이동.
-- 변환 함수는 현재 연결에서만 존재하며 DB에 영구 API로 노출되지 않음.
create function pg_temp.archive_answer_fields(blocks jsonb)
returns table (content text, language text, code_text text)
language plpgsql immutable as $$
declare
  block jsonb;
  position integer := 0;
  count integer := jsonb_array_length(blocks);
  split_last boolean;
  fence text;
  piece text;
begin
  if not public.valid_archive_blocks(blocks) then raise exception 'Invalid legacy answer blocks'; end if;
  split_last := blocks->(count - 1)->>'type' = 'code' and exists (
    select 1 from jsonb_array_elements(blocks) b where b->>'type' = 'paragraph'
  );
  content := '';
  for block in select * from jsonb_array_elements(blocks) loop
    position := position + 1;
    if split_last and position = count then
      code_text := block->>'codeText';
      language := block->>'language';
    else
      if block->>'type' = 'paragraph' then
        piece := block->>'text';
      else
        select repeat('`', greatest(3, coalesce(max(length(m[1])), 0) + 1)) into fence
          from regexp_matches(block->>'codeText', '`+', 'g') m;
        piece := fence || (block->>'language') || E'\n' || (block->>'codeText') || E'\n' || fence;
      end if;
      content := content || case when content = '' then '' else E'\n\n' end || piece;
    end if;
  end loop;
  return next;
end;
$$;

lock table public.archive_answers in access exclusive mode;
alter table public.archive_answers add column if not exists language text;
alter table public.archive_answers alter column language drop default;
alter table public.archive_answers add column content text;

-- 기존 데이터와 변환 결과를 트랜잭션 안에 보존해 삭제/누락 여부 확인
create temporary table archive_answer_conversion on commit drop as
  select a.id, a.post_id, a.owner_id, a.created_at, f.*
  from public.archive_answers a cross join lateral pg_temp.archive_answer_fields(a.blocks) f;

update public.archive_answers a set content = f.content, language = f.language
from archive_answer_conversion f where f.id = a.id;

alter table public.archive_answers drop constraint archive_answers_blocks_check;
alter table public.archive_answers alter column blocks type text
  using blocks::text;
alter table public.archive_answers rename column blocks to code_text;
alter table public.archive_answers alter column code_text drop not null;
update public.archive_answers a set code_text = f.code_text
from archive_answer_conversion f where f.id = a.id;
alter table public.archive_answers alter column content set not null;

alter table public.archive_answers
  add constraint archive_answers_content_check check (length(content) between 1 and 50000 and content ~ '[^[:space:]]'),
  add constraint archive_answers_code_text_check check (length(code_text) between 1 and 50000 and code_text ~ '[^[:space:]]'),
  add constraint archive_answers_language_check check (language in ('javascript', 'typescript', 'tsx', 'java', 'python', 'html', 'css', 'sql', 'bash', 'json')),
  add constraint archive_answers_code_language_check check (code_text is not null or language is null);

do $$ begin
  if exists (
    select * from archive_answer_conversion
    except select id, post_id, owner_id, created_at, content, language, code_text from public.archive_answers
  ) or (select count(*) from archive_answer_conversion) <> (select count(*) from public.archive_answers)
  then raise exception 'Answer conversion mismatch'; end if;
end $$;

-- 내용은 생성 이후 변경 불가. 해결 상태만 관리자 소유권 정책과 함께 허용.
revoke update on public.archive_posts from public, anon, authenticated;
grant update (status) on public.archive_posts to authenticated;
revoke update on public.archive_answers from public, anon, authenticated;
alter policy "Admin updates own posts" on public.archive_posts rename to "Admin changes own post status";

alter table public.archive_posts
  add constraint archive_posts_title_not_blank check (title ~ '[^[:space:]]'),
  add constraint archive_posts_content_not_blank check (content ~ '[^[:space:]]'),
  add constraint archive_posts_code_text_not_blank check (code_text ~ '[^[:space:]]'),
  add constraint archive_posts_code_language_check check (code_text is not null or language is null);

drop function public.save_archive_answer(text, jsonb, boolean);
drop function public.valid_archive_blocks(jsonb);

create function public.save_archive_answer(
  p_post_id text,
  p_content text,
  p_language text default null,
  p_code_text text default null,
  p_mark_solved boolean default false
)
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
  return query insert into public.archive_answers (post_id, content, language, code_text)
    values (p_post_id, p_content, p_language, p_code_text) returning *;
end;
$$;
revoke all on function public.save_archive_answer(text, text, text, text, boolean) from public, anon;
grant execute on function public.save_archive_answer(text, text, text, text, boolean) to authenticated;

notify pgrst, 'reload schema';
commit;
