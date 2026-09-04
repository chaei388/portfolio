import type { Skill, SkillGroup } from '../types'

// 기술 스택 카테고리
export const skillGroups: SkillGroup[] = [
  { id: 'language', title: 'Language' },
  { id: 'frontend', title: 'Frontend' },
  { id: 'backend', title: 'Backend' },
  { id: 'database', title: 'Database' },
  { id: 'devops', title: 'DevOps' },
  { id: 'tools', title: 'Tools' },
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
  { id: 'tailwind-css', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'react-native', name: 'React Native', category: 'Frontend' },

  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend' },

  { id: 'postgresql', name: 'PostgreSQL', category: 'Database' },
  { id: 'mysql', name: 'MySQL', category: 'Database' },

  { id: 'git', name: 'Git', category: 'DevOps' },
  { id: 'github', name: 'GitHub', category: 'DevOps' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps' },
  { id: 'docker', name: 'Docker', category: 'DevOps' },
  { id: 'aws', name: 'AWS', category: 'DevOps' },
  { id: 'azure', name: 'Azure', category: 'DevOps' },
  { id: 'vercel', name: 'Vercel', category: 'DevOps' },
  { id: 'nginx', name: 'Nginx', category: 'DevOps' },
  { id: 'linux', name: 'Linux', category: 'DevOps' },

  { id: 'vite', name: 'Vite', category: 'Tools' },
  { id: 'expo', name: 'Expo', category: 'Tools' },
  { id: 'streamlit', name: 'Streamlit', category: 'Tools' },
  { id: 'supabase', name: 'Supabase', category: 'Tools' },
  { id: 'figma', name: 'Figma', category: 'Tools' },
  { id: 'notion', name: 'Notion', category: 'Tools' },
  { id: 'postman', name: 'Postman', category: 'Tools' },
]
