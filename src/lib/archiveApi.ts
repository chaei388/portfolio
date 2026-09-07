import { getSupabase } from './supabaseClient'
import type { Answer, AnswerBlock, CodeLanguage, Post, PostStatus } from '../types/archive'
import type { AnswerRow, PostRow } from '../types/database'

export type SavedPost = Post & { ownerId: string; isPublic: boolean }
export type SavedAnswer = Answer & { ownerId: string }
export interface PostInput {
  title: string
  content: string
  language: CodeLanguage | null
  codeText: string | null
  tags: string[] | null
}

const formatDate = (value: string) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value)).replaceAll('-', '.')

const toPost = (row: PostRow, answerCount: number): SavedPost => ({
  id: row.id, ownerId: row.owner_id, title: row.title, content: row.content,
  language: row.language, codeText: row.code_text, tags: row.tags,
  status: row.status, isPublic: row.is_public, answerCount,
  createdAt: formatDate(row.created_at),
})

const toAnswer = (row: AnswerRow): SavedAnswer => ({
  id: row.id, postId: row.post_id, ownerId: row.owner_id,
  blocks: row.blocks, createdAt: formatDate(row.created_at),
})

export async function listPosts(signal: AbortSignal) {
  const { data, error } = await getSupabase().from('archive_posts')
    .select('*, archive_answers(count)').order('created_at', { ascending: false })
    .order('id').abortSignal(signal)
  if (error) throw error
  return data.map((row) => toPost(row, row.archive_answers[0]?.count ?? 0))
}

export async function getPost(id: string, signal: AbortSignal) {
  const client = getSupabase()
  const { data: post, error } = await client.from('archive_posts')
    .select('*').eq('id', id).abortSignal(signal).maybeSingle()
  if (error) throw error
  if (!post) return null
  const { data: answers, error: answerError } = await client.from('archive_answers')
    .select('*').eq('post_id', id).order('created_at').order('id').abortSignal(signal)
  if (answerError) throw answerError
  return { post: toPost(post, answers.length), answers: answers.map(toAnswer) }
}

export async function savePost(input: PostInput, id?: string) {
  const fields = {
    title: input.title.trim(), content: input.content.trim(),
    language: input.language, code_text: input.codeText, tags: input.tags,
  }
  const table = getSupabase().from('archive_posts')
  const request = id ? table.update(fields).eq('id', id) : table.insert(fields)
  const { data, error } = await request.select('id').single()
  if (error) throw error
  return data.id
}

export async function setPostStatus(id: string, status: PostStatus) {
  const { error } = await getSupabase().from('archive_posts')
    .update({ status }).eq('id', id).select('id').single()
  if (error) throw error
}

export async function deletePost(id: string) {
  const { error } = await getSupabase().from('archive_posts')
    .delete().eq('id', id).select('id').single()
  if (error) throw error
}

export async function saveAnswer(postId: string, blocks: AnswerBlock[], markSolved: boolean) {
  const { data, error } = await getSupabase().rpc('save_archive_answer', {
    p_post_id: postId, p_blocks: blocks, p_mark_solved: markSolved,
  }).single()
  if (error) throw error
  return toAnswer(data)
}

export async function deleteAnswer(id: string) {
  const { error } = await getSupabase().from('archive_answers')
    .delete().eq('id', id).select('id').single()
  if (error) throw error
}

export function archiveError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (code === '42501' || code === 'PGRST301' || code === 'PGRST116') {
    return '권한이 없거나 게시글이 변경되었습니다. 로그인 상태를 확인하고 다시 시도해주세요.'
  }
  if (code === '23514' || code === '22001') return '입력 내용이 너무 길거나 올바르지 않습니다. 내용을 확인해주세요.'
  return '요청을 처리하지 못했습니다. 연결을 확인하고 다시 시도해주세요.'
}
