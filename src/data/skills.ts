import type { Skill, SkillGroup } from '../types/skill'

import awsIcon from '../assets/icons/skills/aws.svg'
import azureIcon from '../assets/icons/skills/azure.svg'
import cppIcon from '../assets/icons/skills/cpp.svg'
import cssIcon from '../assets/icons/skills/css.svg'
import dockerIcon from '../assets/icons/skills/docker.svg'
import expoIcon from '../assets/icons/skills/expo.svg'
import figmaIcon from '../assets/icons/skills/figma.svg'
import gitIcon from '../assets/icons/skills/git.svg'
import githubIcon from '../assets/icons/skills/github.svg'
import githubActionsIcon from '../assets/icons/skills/github-actions.svg'
import htmlIcon from '../assets/icons/skills/html.svg'
import javaIcon from '../assets/icons/skills/java.svg'
import javascriptIcon from '../assets/icons/skills/javascript.svg'
import linuxIcon from '../assets/icons/skills/linux.svg'
import mysqlIcon from '../assets/icons/skills/mysql.svg'
import nginxIcon from '../assets/icons/skills/nginx.svg'
import nodejsIcon from '../assets/icons/skills/nodejs.svg'
import notionIcon from '../assets/icons/skills/notion.svg'
import postgresqlIcon from '../assets/icons/skills/postgresql.svg'
import postmanIcon from '../assets/icons/skills/postman.svg'
import pythonIcon from '../assets/icons/skills/python.svg'
import reactIcon from '../assets/icons/skills/react.svg'
import reactNativeIcon from '../assets/icons/skills/react-native.svg'
import scssIcon from '../assets/icons/skills/scss.svg'
import springBootIcon from '../assets/icons/skills/spring-boot.svg'
import streamlitIcon from '../assets/icons/skills/streamlit.svg'
import supabaseIcon from '../assets/icons/skills/supabase.svg'
import tailwindCssIcon from '../assets/icons/skills/tailwind-css.svg'
import typescriptIcon from '../assets/icons/skills/typescript.svg'
import vercelIcon from '../assets/icons/skills/vercel.svg'
import viteIcon from '../assets/icons/skills/vite.svg'

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
  // Language
  { id: 'javascript', name: 'JavaScript', category: 'Language', icon: javascriptIcon },
  { id: 'typescript', name: 'TypeScript', category: 'Language', icon: typescriptIcon },
  { id: 'java', name: 'Java', category: 'Language', icon: javaIcon },
  { id: 'python', name: 'Python', category: 'Language', icon: pythonIcon },
  { id: 'cpp', name: 'C++', category: 'Language', icon: cppIcon },

  // Frontend
  { id: 'html', name: 'HTML', category: 'Frontend', icon: htmlIcon },
  { id: 'css', name: 'CSS', category: 'Frontend', icon: cssIcon },
  { id: 'scss', name: 'SCSS', category: 'Frontend', icon: scssIcon },
  { id: 'tailwind-css', name: 'Tailwind CSS', category: 'Frontend', icon: tailwindCssIcon },
  { id: 'react', name: 'React', category: 'Frontend', icon: reactIcon },
  { id: 'react-native', name: 'React Native', category: 'Frontend', icon: reactNativeIcon },

  // Backend
  { id: 'nodejs', name: 'Node.js', category: 'Backend', icon: nodejsIcon },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend', icon: springBootIcon },

  // Database
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', icon: postgresqlIcon },
  { id: 'mysql', name: 'MySQL', category: 'Database', icon: mysqlIcon },

  // DevOps
  { id: 'git', name: 'Git', category: 'DevOps', icon: gitIcon },
  { id: 'github', name: 'GitHub', category: 'DevOps', icon: githubIcon },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps', icon: githubActionsIcon },
  { id: 'docker', name: 'Docker', category: 'DevOps', icon: dockerIcon },
  { id: 'aws', name: 'AWS', category: 'DevOps', icon: awsIcon },
  { id: 'azure', name: 'Azure', category: 'DevOps', icon: azureIcon },
  { id: 'vercel', name: 'Vercel', category: 'DevOps', icon: vercelIcon },
  { id: 'nginx', name: 'Nginx', category: 'DevOps', icon: nginxIcon },
  { id: 'linux', name: 'Linux', category: 'DevOps', icon: linuxIcon },

  // Tools
  { id: 'vite', name: 'Vite', category: 'Tools', icon: viteIcon },
  { id: 'expo', name: 'Expo', category: 'Tools', icon: expoIcon },
  { id: 'streamlit', name: 'Streamlit', category: 'Tools', icon: streamlitIcon },
  { id: 'supabase', name: 'Supabase', category: 'Tools', icon: supabaseIcon },
  { id: 'figma', name: 'Figma', category: 'Tools', icon: figmaIcon },
  { id: 'notion', name: 'Notion', category: 'Tools', icon: notionIcon },
  { id: 'postman', name: 'Postman', category: 'Tools', icon: postmanIcon },
]
