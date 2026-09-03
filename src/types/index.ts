export interface NavigationItem {
  href: string
  label: string
  isFeatured?: boolean
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
