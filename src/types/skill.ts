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
