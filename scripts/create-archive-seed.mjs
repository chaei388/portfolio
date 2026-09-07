import { writeFileSync } from 'node:fs'
import { archivePosts } from '../src/data/archivePosts.ts'
import { archiveAnswers } from '../src/data/archiveAnswers.ts'

// Auth에서 관리자 계정을 만든 뒤 SQL Editor에서 실행. 내용과 기존 URL을 보존함.
const quote = (value) => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`
const date = (value) => quote(`${value.replaceAll('.', '-')}T00:00:00+09:00`)
const sql = [
  '-- scripts/create-archive-seed.mjs로 생성. 원본 글/답변을 수정해도 재실행 시 기존 DB 내용을 덮어쓰지 않음.',
  'begin;',
  `do $$ begin if not exists (select 1 from auth.users where email = 'day3856@gmail.com' and email_confirmed_at is not null) then raise exception '먼저 인증이 확인된 관리자 Auth 계정을 생성해주세요.'; end if; end $$;`,
  `insert into public.archive_admins (user_id) select id from auth.users where email = 'day3856@gmail.com' on conflict do nothing;`,
]
for (const post of archivePosts) {
  sql.push(`insert into public.archive_posts (id, owner_id, title, content, language, code_text, tags, status, created_at)
values (${quote(post.id)}, (select id from auth.users where email = 'day3856@gmail.com'), ${quote(post.title)}, ${quote(post.content)}, ${quote(post.language)}, ${quote(post.codeText)}, ${post.tags ? `array[${post.tags.map(quote).join(', ')}]::text[]` : 'null'}, ${quote(post.status)}, ${date(post.createdAt)}) on conflict (id) do nothing;`)
}
for (const answer of archiveAnswers) {
  sql.push(`insert into public.archive_answers (id, post_id, owner_id, blocks, created_at)
values (${quote(answer.id)}, ${quote(answer.postId)}, (select id from auth.users where email = 'day3856@gmail.com'), ${quote(JSON.stringify(answer.blocks))}::jsonb, ${date(answer.createdAt)}) on conflict (id) do nothing;`)
}
sql.push('commit;')
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql.join('\n\n') + '\n')
console.log(`Seed generated: ${archivePosts.length} posts, ${archiveAnswers.length} answers`)
