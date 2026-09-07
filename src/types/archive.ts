export type PostStatus = 'solved' | 'unsolved'

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'tsx'
  | 'java'
  | 'python'
  | 'html'
  | 'css'
  | 'sql'
  | 'bash'
  | 'json'

export interface CodeLanguageOption {
  value: CodeLanguage
  label: string
}

export interface Post {
  id: string
  title: string
  content: string // 본문 입력값
  language: CodeLanguage | null // 코드블록 언어 선택값
  codeText: string | null // 코드 입력값
  tags: string[] | null // 해시태그
  status: PostStatus
  answerCount: number
  createdAt: string
}

export interface TextBlock {
  type: 'paragraph'
  text: string
}

export interface CodeBlock {
  type: 'code'
  language: CodeLanguage
  codeText: string
}

export type AnswerBlock = TextBlock | CodeBlock

export interface Answer {
  id: string
  postId: string // 답변이 연결되는 Archive 게시글 id
  blocks: AnswerBlock[] // 문단과 코드블록을 작성 순서대로 저장
  createdAt: string
}
