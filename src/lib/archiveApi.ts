// Archive 화면과 Supabase DB 사이를 연결하는 데이터 접근/service 파일
// DB의 snake_case 컬럼명을 React의 camelCase로 변환

import { getSupabase } from './supabaseClient'
import type { Answer, CodeLanguage, Post, PostStatus } from '../types/archive'
import type { AnswerRow, PostRow } from '../types/database'

// SavedPost: 기본 Post에는 UI에 필요한 일반 게시글 정보만 존재하므로
// Supabase에 실제 저장된 게시글에서만 필요한 소유자(ownerId)/공개 여부(isPublic)까지 추가
export type SavedPost = Post & { ownerId: string; isPublic: boolean }

// SavedAnswer: 기본 Answer에는 UI에 필요한 일반 답변 정보만 존재하므로
// Supabase에 실제 저장된 답변에서만 필요한 소유자(ownerId)까지 추가
export type SavedAnswer = Answer & { ownerId: string }

// AnswerInput: 답변을 작성할 때 프론트에서 넘겨줘야 할 값 - content, language, codeText 세 개
// Pick: 기존 타입에서 원하는 필드만 골라오는 TypeScript 기능 → Answer타입에서 세 필드만 골라오기
// 왜냐하면 답변을 새로 작성하는 시점에서 아래 필드는 입력받을 필요X
// id          → DB가 생성
// postId      → 함수의 별도 인자로 받음
// createdAt   → DB가 생성
// ownerId     → 로그인 사용자 기준 DB에서 처리
export type AnswerInput = Pick<Answer, 'content' | 'language' | 'codeText'>

// PostInput: 게시글을 작성할 때 프론트에서 넘겨줘야 할 값
// 여기에도 id, ownerId, createdAt, status는 없음(DB가 처리)
export interface PostInput {
  title: string
  content: string
  language: CodeLanguage | null
  codeText: string | null
  tags: string[] | null
}

// formatDate: DB에서 오는 날짜(2026-09-08T01:15:20.123Z)를 2026.09.08 같은 형태로 바꿔주는 함수
const formatDate = (value: string) => new Intl.DateTimeFormat('sv-SE', {
  // 스웨덴 날짜표기: XXXX-XX-XX, 한국 날짜표기: XXXX. XX. XX이라 스웨덴 로케일 sv-SE 사용
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value)).replaceAll('-', '.') // replaceAll로 -를 .로 바꿈

// DB 데이터 → 프론트 데이터 변환 함수 (어댑터 역할)
// Supabase에서 받아온 PostRow를 React에서 사용할 SavedPost로 변환
const toPost = (row: PostRow, answerCount: number): SavedPost => ({
  id: row.id, 
  ownerId: row.owner_id, 
  title: row.title, 
  content: row.content,
  language: row.language, 
  codeText: row.code_text, 
  tags: row.tags,
  status: row.status, 
  isPublic: row.is_public, 
  answerCount,
  createdAt: formatDate(row.created_at),
})

// DB 데이터 → 프론트 데이터 변환 함수 (어댑터 역할)
// Supabase에서 받아온 AnswerRow를 React에서 사용할 SavedAnswer로 변환
const toAnswer = (row: AnswerRow): SavedAnswer => ({
  id: row.id, 
  postId: row.post_id, 
  ownerId: row.owner_id,
  content: row.content, 
  language: row.language, 
  codeText: row.code_text,
  createdAt: formatDate(row.created_at),
})

// listPosts(): 게시글 목록 조회
// async: Supabase 서버에 요청하고 결과를 기다리는 비동기 함수
export async function listPosts(signal: AbortSignal) {
  const { data, error } = await getSupabase().from('archive_posts') // archive_posts 테이블에서 가져옴
    .select('*, archive_answers(count)') // 게시글 전체 컬럼 + 연결된 archive_answers(답변) 개수도 가져옴
    .order('created_at', { ascending: false }) // 1차 정렬: 작성일 기준 내림차순
    .order('id') // 2차 정렬: (작성일이 같으면) 게시글 id 기준으로 한 번 더 정렬
    .abortSignal(signal) // 요청취소
    // 사용자가 페이지에 들어오자마자 나갈 경우 supabase 요청이 필요없어졌으므로 기다리지 않고 취소함
  
    if (error) throw error // 오류처리
  
  // DB에서 가져온 게시글 각각을 toPost()로 변환
  return data.map((row) => 
    toPost(
      row, // 게시글
      row.archive_answers[0]?.count ?? 0)) // 아까 같이 조회한 답변 개수
      // ?.   : 값이 없더라도 에러를 내지 않고 undefined를 반환하는 옵셔널체이닝(optional chaining)
      // ?? 0 : 앞의 값(답변 개수)이 null이나 undefined면 0을 사용
}

// getPost(): 게시글 하나와 답변 조회
export async function getPost(id: string, signal: AbortSignal) {
  const client = getSupabase() // 먼저 supabase 클라이언트 객체 받아두기

  const { data: post, error } = await client.from('archive_posts')
    .select('*')
    .eq('id', id) // WHERE id = ?
    .abortSignal(signal) // 요청취소
    .maybeSingle() // 결과는 0개(조회하려던 게시글이 존재하지 않는 게시글) 또는 1개
    // single(): 반드시 정확히 1개여야 함
    // maybeSingle(): 0개여도 1개여도 정상, 따라서 /archive/존재하지않는id도 자연스럽게 처리 가능
  
    if (error) throw error // 오류처리

  // 게시글이 존재하지 않으면 null 반환
  if (!post) return null

  // 해당 게시글의 답변 조회
  const { data: answers, error: answerError } = await client.from('archive_answers')
    .select('*')
    .eq('post_id', id) // post_id가 현재 게시글 ID인 답변만 가져오기
    .order('created_at', { ascending: false }) // 1차 정렬: 작성일 기준 내림차순
    .order('id') // 2차 정렬: (작성일이 같으면) 답변 id 기준으로 한 번 더 정렬
    .abortSignal(signal) // 요청취소
  
  if (answerError) throw answerError // 오류처리

  // 반환 형태: post: 게시글{}, answers: 답변 배열[{답변1}, {답변2}, ...]
  return { 
    post: toPost(post, answers.length), 
    answers: answers.map(toAnswer) 
  }
}

// createPost(): 게시글 작성
export async function createPost(input: PostInput) {

  // 프론트 데이터 → DB 저장용 데이터 변환 함수 (어댑터 역할)
  // .trim()은 앞뒤 공백 제거
  const fields = {
    title: input.title.trim(), 
    content: input.content.trim(),
    language: input.language, 
    code_text: input.codeText, 
    tags: input.tags,
  }

  // 실제 게시글을 DB에 추가
  const { data, error } = await getSupabase().from('archive_posts')
    .insert(fields) // insert
    .select('id') // 저장된 게시글에서 id만 다시 받아옴
    .single() // 게시글을 하나만 INSERT했으니까 결과도 하나라고 지정

  if (error) throw error // 오류처리

  return data.id // 새로 작성된 게시글 ID 반환
}

// setPostStatus(): 해결/미해결 상태만 변경
export async function setPostStatus(id: string, status: PostStatus) {
  const { error } = await getSupabase().from('archive_posts')
    .update({ status }) // update
    .eq('id', id) // WHERE id = ?
    .select('id') // 변경된 게시글에서 id만 다시 받아옴
    .single() // single은 결과가 하나가 아니면 에러를 냄, 정확히 게시글 하나가 변경됐는지 체크

  if (error) throw error // 오류처리
}

// deletePost(): 게시글 삭제
export async function deletePost(id: string) {
  const { error } = await getSupabase().from('archive_posts')
    .delete() // delete
    .eq('id', id) // WHERE id = ?
    .select('id') // 삭제된 게시글에서 id만 다시 받아옴
    .single() // single은 결과가 하나가 아니면 에러를 냄, 정확히 게시글 하나가 삭제됐는지 체크
  
  if (error) throw error // 오류처리
}

// saveAnswer(): 답변 저장 (활용가능한 저장옵션은 아래 3가지)
// 취소: saveAnswer() 자체를 호출하지 않음
// 그냥저장: saveAnswer(postId, input, false)
// 해결완료: saveAnswer(postId, input, true)
export async function saveAnswer(postId: string, input: AnswerInput, markSolved: boolean) {
  const { data, error } = await getSupabase().rpc('save_archive_answer', {
    p_post_id: postId, 
    p_content: input.content, 
    p_language: input.language,
    p_code_text: input.codeText, 
    p_mark_solved: markSolved,
  }).single()
  // single():  Supabase RPC 자체 타입상 결과는 배열임
  // 이 함수는 새로 저장한 답변 한 개만 반환한다고 기대하므로 single 붙여서 하나만 받음
  // 배열로 오는 이유: PostgreSQL 함수는 기본적으로 행 집합을 반환해서, 객체 하나여도 배열이 한 겹 씌워져서 옴 [{}]

  // rpc(DB 함수)를 쓰는 이유: 해결완료로 저장은 동시에 두 작업이 필요
  // 1. 게시글(archive_answers)에 답변 INSERT
  // 2. 게시글(archive_posts)의 status를 해결완료(solved)로 UPDATE
  // 프론트에서 따로 하면 두 개의 작업을 진행하다가 중간에 하나가 실패했을 경우 불완전한 상태가 생길 수 있음
  // 따라서 DB 함수 save_archive_answer() 하나로 트랜잭션으로 묶어서 진행

  if (error) throw error // 오류처리

  return toAnswer(data) // DB 형식을 화면용 SavedAnswer로 변환
}

// deleteAnswer(): 답변 삭제
export async function deleteAnswer(id: string) {
  const { error } = await getSupabase().from('archive_answers')
    .delete() // delete
    .eq('id', id) // WHERE id = ?
    .select('id') // 삭제된 답변에서 id만 다시 받아옴
    .single() // single은 결과가 하나가 아니면 에러를 냄, 정확히 답변 하나가 삭제됐는지 체크
  if (error) throw error
}

// archiveError(): Supabase 오류를 사용자용 문장으로 변경
export function archiveError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (code === '42501' || code === 'PGRST301' || code === 'PGRST116') {
    return '권한이 없거나 게시글이 변경되었습니다. 로그인 상태를 확인하고 다시 시도해주세요.'
  }
  if (code === '23514' || code === '22001') return '입력 내용이 너무 길거나 올바르지 않습니다. 내용을 확인해주세요.'
  return '요청을 처리하지 못했습니다. 연결을 확인하고 다시 시도해주세요.'
}
