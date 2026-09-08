import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { archivePosts } from '../src/data/archivePosts.ts'
import { archiveAnswers } from '../src/data/archiveAnswers.ts'
import { archiveAnswerFields } from './lib/archive-answer-fields.mjs'

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
  assert.equal(Object.hasOwn(row, 'updated_at'), false)
  assert.equal(row.title, original.title)
  assert.equal(row.content, original.content)
  assert.equal(row.code_text, original.codeText)
  assert.equal(row.language, original.language)
  assert.deepEqual(row.tags, original.tags)
  assert.equal(row.archive_answers[0].count, archiveAnswers.filter((answer) => answer.postId === row.id).length)
  assert.equal(new Date(row.created_at).getTime(), new Date(`${original.createdAt.replaceAll('.', '-')}T00:00:00+09:00`).getTime())
}
for (const original of archiveAnswers) {
  const row = answers.find((answer) => answer.id === original.id)
  const fields = archiveAnswerFields(original.blocks)
  assert.equal(Object.hasOwn(row, 'blocks'), false)
  assert.equal(row.post_id, original.postId)
  assert.equal(row.content, fields.content)
  assert.equal(row.language, fields.language)
  assert.equal(row.code_text, fields.codeText)
  assert.equal(new Date(row.created_at).getTime(), new Date(`${original.createdAt.replaceAll('.', '-')}T00:00:00+09:00`).getTime())
}
console.log('PASS: public signup disabled; original posts, answers, code blocks, dates and counts preserved')

if (process.argv.includes('--write')) {
  assert.ok(process.env.ARCHIVE_TEST_EMAIL && process.env.ARCHIVE_TEST_PASSWORD, 'Set test credentials in the process environment')
  const id = `codex-smoke-${randomUUID()}`
  const createdIds = []
  try {
    const login = checked(await admin.auth.signInWithPassword({ email: process.env.ARCHIVE_TEST_EMAIL, password: process.env.ARCHIVE_TEST_PASSWORD }))
    assert.equal(checked(await admin.rpc('is_archive_admin')), true)
    const row = checked(await admin.from('archive_posts').insert({ id, title: 'Codex disposable verification', content: '임시 검증 데이터' }).select().single())
    createdIds.push(id)
    assert.equal(row.owner_id, login.user.id)
    assert.equal(row.status, 'unsolved')
    assert.equal(row.is_public, true)
    assert.equal(Object.hasOwn(row, 'updated_at'), false)
    assert.equal(row.language, null)
    assert.equal(row.code_text, null)
    assert.equal(row.tags, null)
    for (const key of ['id', 'title', 'content', 'language', 'code_text', 'tags', 'owner_id', 'created_at', 'is_public']) {
      const result = await admin.from('archive_posts').update({ [key]: row[key] }).eq('id', id)
      assert.equal(result.error?.code, '42501', `${key} must be immutable`)
    }
    const first = checked(await admin.rpc('save_archive_answer', { p_post_id: id, p_content: '첫 답변' }).single())
    assert.equal(first.owner_id, login.user.id)
    assert.equal(first.language, null)
    assert.equal(first.code_text, null)
    assert.equal((await admin.from('archive_answers').update({ content: 'Forbidden' }).eq('id', first.id)).error?.code, '42501')
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'unsolved')
    const invalid = await admin.rpc('save_archive_answer', { p_post_id: id, p_content: ' \n\t', p_mark_solved: true })
    assert.ok(invalid.error)
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'unsolved')
    const second = checked(await admin.rpc('save_archive_answer', { p_post_id: id, p_content: '해결 답변', p_language: 'sql', p_code_text: 'select 1;', p_mark_solved: true }).single())
    assert.equal(second.language, 'sql')
    assert.equal(second.code_text, 'select 1;')
    const publicRow = checked(await visitor.from('archive_posts').select('status, archive_answers(count)').eq('id', id).single())
    assert.equal(publicRow.status, 'solved')
    assert.equal(publicRow.archive_answers[0].count, 2)
    const privateId = `${id}-private`
    checked(await admin.from('archive_posts').insert({ id: privateId, title: 'Private verification', content: 'Private', is_public: false }))
    createdIds.push(privateId)
    checked(await admin.rpc('save_archive_answer', { p_post_id: privateId, p_content: 'Private answer' }))
    assert.equal(checked(await visitor.from('archive_posts').select('id').eq('id', privateId)).length, 0)
    assert.equal(checked(await visitor.from('archive_answers').select('id').eq('post_id', privateId)).length, 0)
    const denied = await visitor.from('archive_posts').update({ title: 'Unauthorized' }).eq('id', id)
    assert.ok(denied.error)
    assert.ok((await visitor.from('archive_posts').insert({ title: 'Forbidden', content: 'Forbidden' })).error)
    assert.ok((await visitor.rpc('save_archive_answer', { p_post_id: id, p_content: 'Forbidden' })).error)
    checked(await admin.from('archive_answers').delete().eq('id', first.id).select('id').single())
    assert.equal(checked(await admin.from('archive_posts').select('status').eq('id', id).single()).status, 'solved')
    checked(await admin.from('archive_posts').update({ status: 'unsolved' }).eq('id', id).select('id').single())
    assert.equal(checked(await visitor.from('archive_posts').select('status').eq('id', id).single()).status, 'unsolved')
    console.log('PASS: login, defaults, private reads, immutable content, optional code, atomic status and anonymous write denial')
  } finally {
    if (createdIds.length) {
      const deleted = checked(await admin.from('archive_posts').delete().in('id', createdIds).select('id'))
      assert.equal(deleted.length, createdIds.length)
      assert.equal(checked(await admin.from('archive_answers').select('id').in('post_id', createdIds)).length, 0)
      console.log('PASS: disposable posts deleted; related answers removed')
    }
    await admin.auth.signOut({ scope: 'local' })
  }
}
