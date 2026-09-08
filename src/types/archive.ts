// Archive 화면과 프론트엔드 로직에서 사용하는 데이터 타입
// DB 행의 snake_case 컬럼 구조는 database.ts에서 별도로 정의하고,
// archiveApi.ts에서 아래 camelCase 화면용 타입으로 변환해서 사용

// Archive 게시글의 해결 상태로 허용하는 두 값
export type PostStatus = 'solved' | 'unsolved'

// 코드블록에서 선택할 수 있는 언어 값
// archiveLanguages.ts의 드롭다운 옵션 및 Supabase의 language 제약조건과 같은 값으로 유지
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

// 코드 언어 드롭다운 옵션 한 개의 구조
// value는 실제 저장값, label은 사용자에게 보여주는 이름
export interface CodeLanguageOption {
  value: CodeLanguage
  label: string
}

// Archive 게시글을 화면에서 사용할 때의 기본 구조
// ownerId와 isPublic은 DB 조회 결과에만 필요하므로 archiveApi.ts의 SavedPost에서 추가
export interface Post {
  id: string
  title: string // 게시글 제목
  content: string // 일반 텍스트 본문
  language: CodeLanguage | null // 코드가 있을 때 선택한 언어, 코드가 없으면 null
  codeText: string | null // 선택 입력한 코드, 코드가 없으면 null
  tags: string[] | null // 해시태그 목록, 해시태그가 없으면 null
  status: PostStatus // 해결완료 또는 미해결 상태
  answerCount: number // 목록과 상세 화면에 표시할 답변 개수
  createdAt: string // 화면 표시용으로 변환된 작성일
}

// Archive 답변을 화면에서 사용할 때의 기본 구조
// 게시글과 마찬가지로 일반 본문과 선택 코드블록을 별도 필드로 관리
export interface Answer {
  id: string
  postId: string // 답변이 연결되는 Archive 게시글 id
  content: string // 답변의 일반 텍스트 본문
  language: CodeLanguage | null // 답변 코드블록의 언어, 코드가 없으면 null
  codeText: string | null // 답변에 첨부한 코드, 코드가 없으면 null
  createdAt: string // 화면 표시용으로 변환된 작성일
}
