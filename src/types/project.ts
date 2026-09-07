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
