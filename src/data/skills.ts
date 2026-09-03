import type { Skill, SkillGroup } from '../types'

// 기술 스택 카테고리
export const skillGroups: SkillGroup[] = [
  { id: 'language', title: 'Language' },
  { id: 'frontend', title: 'Frontend' },
  { id: 'backend', title: 'Backend' },
  { id: 'database', title: 'Database' },
  { id: 'devops', title: 'DevOps & Tools' },
]

// 기술 스택 항목
export const skills: Skill[] = [
  { id: 'javascript', name: 'JavaScript', category: 'Language' },
  { id: 'typescript', name: 'TypeScript', category: 'Language' },
  { id: 'java', name: 'Java', category: 'Language' },
  { id: 'python', name: 'Python', category: 'Language' },
  { id: 'cpp', name: 'C++', category: 'Language' },

  { id: 'html', name: 'HTML', category: 'Frontend' },
  { id: 'css', name: 'CSS', category: 'Frontend' },
  { id: 'scss', name: 'SCSS', category: 'Frontend' },
  { id: 'react', name: 'React', category: 'Frontend' },

  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend' },

  { id: 'postgresql', name: 'PostgreSQL', category: 'Database' },
  { id: 'mysql', name: 'MySQL', category: 'Database' },

  { id: 'git', name: 'Git', category: 'DevOps & Tools' },
  { id: 'github', name: 'GitHub', category: 'DevOps & Tools' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps & Tools' },
  { id: 'docker', name: 'Docker', category: 'DevOps & Tools' },
  { id: 'aws', name: 'AWS', category: 'DevOps & Tools' },
  { id: 'vercel', name: 'Vercel', category: 'DevOps & Tools' },
  { id: 'nginx', name: 'Nginx', category: 'DevOps & Tools' },
  { id: 'linux', name: 'Linux', category: 'DevOps & Tools' },
]
