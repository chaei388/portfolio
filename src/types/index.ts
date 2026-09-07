// Home 화면(One Page): 내부에서 스크롤되는 메뉴는 section id 사용
export interface SectionNavigationItem {
  id: string
  label: string
}

// Archive: 별도 라우트로 이동하는 메뉴는 path 사용
export interface PageNavigationItem {
  path: string
  label: string
}

export type SkillCategory =
  | 'Language'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'DevOps'
  | 'Tools'

export interface SkillGroup {
  id: string
  title: SkillCategory
}

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  icon: string
}

export interface Experience {
  id: string
  period: string
  title: string
  description: string
  role?: string
  stacks?: string[]
  projectId?: string
}

export interface Project {
  id: string
  title: string
  summary: string
  period: string
  role: string
  stacks: string[]
  features: string[]
  thumbnailUrl?: string
  githubUrl?: string
  demoUrl?: string
  screenshotUrls?: string[]
  readmeMd?: string
  award?: string
}

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

export interface ArchivePost {
  id: string
  title: string
  content: string // 본문 입력값
  language: CodeLanguage // 코드블록 언어 선택값
  codeText: string // 코드 입력값
  tags: string[] // 해시태그
  status: PostStatus
  answerCount: number
  createdAt: string
}
