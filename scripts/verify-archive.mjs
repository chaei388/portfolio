import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { archivePosts } from '../src/data/archivePosts.ts'
import { archiveAnswers } from '../src/data/archiveAnswers.ts'

const options = { auth: { persistSession: false, autoRefreshToken: false } }
const create = () => createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY, options)
const visitor = create()
const admin = create()
const checked = ({ data, error }) => { assert.equal(error, null, error?.message); return data }

const settingsResponse = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
  headers: { apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY },
})
assert.equal(settingsResponse.status, 200)
const settings = await settingsResponse.json()
assert.equal(settings.disable_signup, true, 'Public signup must be disabled')

const posts = checked(await visitor.from('archive_posts').select('*, archive_answers(count)').in('id', archivePosts.map((post) => post.id)))
const answers = checked(await visitor.from('archive_answers').select('*').in('id', archiveAnswers.map((answer) => answer.id)))
assert.equal(posts.length, archivePosts.length)
assert.equal(answers.length, archiveAnswers.length)
for (const original of archivePosts) {
  const row = posts.find((post) => post.id === original.id)
  assert.equal(row.title, original.title)
  assert.equal(row.content, original.content)
  assert.equal(row.code_text, original.codeText)
  assert.equal(row.language, original.language)
  assert.deepEqual(row.tags, original.tags)
  assert.equal(row.archive_answers[0].count, archiveAnswers.filter((answer) => answer.postId === row.id).length)
  assert.equal(new Date(row.created_at).getTime(), new Date(`${original.createdAt.replaceAll('.', '-')}T00:00:00+09:00`).getTime())
}
for (const original of archiveAnswers) assert.deepEqual(answers.find((answer) => answer.id === original.id).blocks, original.blocks)
console.log('PASS: public signup disabled; original posts, answers, code blocks, dates and counts preserved')

if (process.argv.includes('--write')) {
  assert.ok(process.env.ARCHIVE_TEST_EMAIL && process.env.ARCHIVE_TEST_PASSWORD, 'Set test credentials in the process environment')
  const id = `codex-smoke-${randomUUID()}`
  let created = false
  try {
    const login = checked(await admin.auth.signInWithPassword({ email: process.env.ARCHIVE_TEST_EMAIL, password: process.env.ARCHIVE_TEST_PASSWORD }))
    assert.equal(checked(await admin.rpc('is_archive_admin')), true)
    const row = checked(await admin.from('archive_posts').insert({ id, title: 'Codex disposable verification', content: '임시 검증 데이터', is_public: false }).select().single())
    created = true
    assert.equal(row.owner_id, login.user.id)
    assert.equal(checked(await visitor.from('archive_posts').select('id').eq('id', id)).length, 0)
    checked(await admin.from('archive_posts').update({ title: 'Updated verification', tags: ['verification'] }).eq('id', id).select('id').single())
    const first = checked(await admin.rpc('save_archive_answer', { p_post_id: id, p_blocks: [{ type: 'paragraph', text: '첫 답변' }], p_mark_solved: false }).single())
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'unsolved')
    const invalid = await admin.rpc('save_archive_answer', { p_post_id: id, p_blocks: [], p_mark_solved: true })
    assert.ok(invalid.error)
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'unsolved')
    checked(await admin.rpc('save_archive_answer', { p_post_id: id, p_blocks: [{ type: 'paragraph', text: '해결 답변' }], p_mark_solved: true }).single())
    assert.equal(checked(await visitor.from('archive_answers').select('id').eq('post_id', id)).length, 0)
    checked(await admin.from('archive_posts').update({ is_public: true }).eq('id', id).select('id').single())
    const publicRow = checked(await visitor.from('archive_posts').select('status, archive_answers(count)').eq('id', id).single())
    assert.equal(publicRow.status, 'solved')
    assert.equal(publicRow.archive_answers[0].count, 2)
    const denied = await visitor.from('archive_posts').update({ title: 'Unauthorized' }).eq('id', id)
    assert.ok(denied.error)
    checked(await admin.from('archive_answers').delete().eq('id', first.id).select('id').single())
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'solved')
    console.log('PASS: login, owner assignment, private reads, create/update, answers, atomic status and anonymous write denial')
  } finally {
    if (created) {
      checked(await admin.from('archive_posts').delete().eq('id', id).select('id').single())
      assert.equal(checked(await admin.from('archive_answers').select('id').eq('post_id', id)).length, 0)
      console.log('PASS: disposable post deleted; related answers removed')
    }
    await admin.auth.signOut({ scope: 'local' })
  }
}
