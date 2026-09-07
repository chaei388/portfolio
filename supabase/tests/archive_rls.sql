-- PostgreSQL 관리자 연결 또는 Supabase SQL Editor에서 실행.
-- 모든 테스트 데이터와 변경은 마지막에 롤백됨.
begin;

insert into auth.users (id, email, email_confirmed_at) values
  ('11111111-1111-4111-8111-111111111111', 'archive-admin-test@example.invalid', now()),
  ('22222222-2222-4222-8222-222222222222', 'archive-other-test@example.invalid', now());
insert into public.archive_admins values ('11111111-1111-4111-8111-111111111111');
insert into public.archive_posts (id, owner_id, title, content, is_public) values
  ('__test_public', '11111111-1111-4111-8111-111111111111', 'Public', 'Content', true),
  ('__test_private', '11111111-1111-4111-8111-111111111111', 'Private', 'Content', false),
  ('__test_other', '22222222-2222-4222-8222-222222222222', 'Other', 'Content', true);
insert into public.archive_answers (id, post_id, owner_id, blocks) values
  ('__test_answer_public', '__test_public', '11111111-1111-4111-8111-111111111111', '[{"type":"paragraph","text":"Public answer"}]'),
  ('__test_answer_private', '__test_private', '11111111-1111-4111-8111-111111111111', '[{"type":"paragraph","text":"Private answer"}]');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  if (select count(*) from public.archive_posts where id like '__test_%') <> 2 then raise exception 'anon public posts'; end if;
  if (select count(*) from public.archive_answers where id like '__test_%') <> 1 then raise exception 'private answers leaked'; end if;
  begin insert into public.archive_posts (title, content) values ('Forbidden', 'Forbidden'); raise exception 'anon insert allowed'; exception when insufficient_privilege then null; end;
  begin update public.archive_posts set title = 'Forbidden' where id = '__test_public'; raise exception 'anon update allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.archive_posts where id = '__test_public'; raise exception 'anon delete allowed'; exception when insufficient_privilege then null; end;
  begin perform public.save_archive_answer('__test_public', '[{"type":"paragraph","text":"Forbidden"}]', false); raise exception 'anon RPC allowed'; exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
  if public.is_archive_admin() then raise exception 'non-admin membership'; end if;
  if exists (select 1 from public.archive_posts where id = '__test_private') then raise exception 'non-admin private read'; end if;
  begin insert into public.archive_admins values ('22222222-2222-4222-8222-222222222222'); raise exception 'self promotion allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.archive_posts (title, content) values ('Forbidden', 'Forbidden'); raise exception 'non-admin insert allowed'; exception when insufficient_privilege then null; end;
  update public.archive_posts set title = 'Forbidden' where id = '__test_other';
  if found then raise exception 'non-admin own update allowed'; end if;
  delete from public.archive_answers where id = '__test_answer_public';
  if found then raise exception 'non-admin answer delete allowed'; end if;
  begin perform public.save_archive_answer('__test_public', '[{"type":"paragraph","text":"Forbidden"}]', false); raise exception 'non-admin RPC allowed'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
do $$ begin
  if not public.is_archive_admin() then raise exception 'admin membership missing'; end if;
  if not exists (select 1 from public.archive_posts where id = '__test_private') then raise exception 'admin private read failed'; end if;
  if not exists (select 1 from public.archive_answers where id = '__test_answer_private') then raise exception 'admin private answer read failed'; end if;
  insert into public.archive_posts (id, title, content) values ('__test_created', 'Created', 'Content');
  update public.archive_posts set title = 'Updated' where id = '__test_created';
  if not found then raise exception 'admin own update failed'; end if;
  update public.archive_posts set title = 'Forbidden' where id = '__test_other';
  if found then raise exception 'other owner update allowed'; end if;
  delete from public.archive_posts where id = '__test_other';
  if found then raise exception 'other owner delete allowed'; end if;
  begin update public.archive_posts set owner_id = '22222222-2222-4222-8222-222222222222' where id = '__test_created'; raise exception 'owner transfer allowed'; exception when insufficient_privilege then null; end;
  begin perform public.save_archive_answer('__test_other', '[{"type":"paragraph","text":"Forbidden"}]', false); raise exception 'other owner RPC allowed'; exception when insufficient_privilege then null; end;
  begin perform public.save_archive_answer('__test_created', '[]', true); raise exception 'invalid answer allowed'; exception when check_violation then null; end;
  if (select status from public.archive_posts where id = '__test_created') <> 'unsolved' then raise exception 'partial answer transaction'; end if;
  perform public.save_archive_answer('__test_created', '[{"type":"paragraph","text":"Saved"}]', true);
  if (select status from public.archive_posts where id = '__test_created') <> 'solved' then raise exception 'answer status failed'; end if;
  if (select count(*) from public.archive_answers where post_id = '__test_created') <> 1 then raise exception 'answer insert failed'; end if;
  delete from public.archive_answers where post_id = '__test_created';
  if not found then raise exception 'admin answer delete failed'; end if;
  perform public.save_archive_answer('__test_created', '[{"type":"paragraph","text":"Cascade"}]', false);
  delete from public.archive_posts where id = '__test_created';
  if exists (select 1 from public.archive_answers where post_id = '__test_created') then raise exception 'answer cascade failed'; end if;
end $$;

reset role;
rollback;
select 'PASS: public/private reads, admin ownership, write denials, atomic answers, cascade deletion' as result;
