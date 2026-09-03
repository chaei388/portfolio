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
  | 'DevOps & Tools'

export interface SkillGroup {
  id: string
  title: SkillCategory
}

export interface Skill {
  id: string
  name: string
  category: SkillCategory
}

export interface Experience {
  id: string
  period: string
  title: string
  description: string
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
  githubUrl?: string
  demoUrl?: string
  isAwarded?: boolean
}
