import type { Experience } from '../types'

// 경험 타임라인 정적 데이터
export const experiences: Experience[] = [
  {
    id: 'hyundai-autoever-webapp',
    period: '2026.07 - 진행 중',
    title: '현대오토에버 모빌리티 SW 스쿨 (웹앱)',
    description:
      '프론트엔드, 백엔드, 데이터베이스부터 Android, iOS, Testing까지 웹앱 개발 전반을 다루는 교육 과정 수료',
    role: '프론트엔드, 백엔드, QA',
    stacks: ['Frontend', 'Backend', 'Database', 'Android', 'iOS', 'Testing'],
  },
  {
    id: 'microsoft-ai-academy',
    period: '2026.05 - 2026.06',
    title: 'Microsoft AI Academy - 수박의정석',
    description:
      '수박 구매 의사결정을 돕는 AI 이미지 분류 서비스 개발',
    role: '기획/디자인, 서비스 구축/배포, AI 모델 구축 및 연동',
    stacks: ['Python', 'Streamlit', 'Azure Custom Vision'],
    projectId: 'watermelon-ai-service',
  },
  {
    id: 'capstone-webapp',
    period: '2026.03 - 2026.06',
    title: '캡스톤디자인 프로젝트 - Pick-it',
    description:
      '프로젝트 팀원 모집과 사용자 활동 관리를 지원하는 웹앱 개발',
    role: '팀장, 기획/디자인, 프론트엔드',
    stacks: ['React', 'JavaScript', 'SCSS'],
    projectId: 'capstone-webapp',
  },
  {
    id: 'likelion-pm-de',
    period: '2024.03 - 2024.12',
    title: '멋쟁이사자처럼 PM&DE',
    description:
      '기획디자인 커리큘럼 학습 및 해커톤 서비스 팀장, PM&DE 참여',
    role: 'PM&DE, QA',
  },
  {
    id: 'software-contest',
    period: '2024.06 - 2024.09',
    title: '컴퓨터공학과 소프트웨어경진대회 - Campus Connect',
    description:
      '외국인 교환학생과 재학생을 연결하는 언어교환 애플리케이션 개발',
    role: '팀장, 기획/디자인, 프론트엔드',
    stacks: ['JavaScript', 'React Native', 'Expo'],
    projectId: 'software-contest-project',
  },
  {
    id: 'global-tech-company-tour',
    period: '2024.05 - 2024.08',
    title: '글로벌기업탐방',
    description:
      '시애틀 글로벌 IT 기업 탐방과 재직자 인터뷰를 통한 개발·디자인 협업 사례 학습',
    role: '팀장, 기업 탐방, 인터뷰',
  },
  {
    id: 'server-system-project',
    period: '2024.03 - 2024.06',
    title: '서버시스템구축실습 팀프로젝트 - Albami',
    description:
      '아르바이트 일정과 급여 관리를 돕는 웹서비스 제작',
    role: '기획/디자인, 프론트엔드, 데이터베이스',
    stacks: ['JavaScript', 'Node.js', 'Express', 'MySQL'],
    projectId: 'albami',
  },
  {
    id: 'app-study',
    period: '2023.03 - 2023.06',
    title: 'Java·Flutter 개발 스터디 - 플래너 애플리케이션',
    description:
      '일정과 계획을 관리하는 플래너 애플리케이션 제작',
    role: '기획/디자인, 프론트엔드',
    stacks: ['Java', 'Flutter'],
    projectId: 'planner-app',
  },
  {
    id: 'cs-academic-festival',
    period: '2022.09 - 2022.11',
    title: '컴퓨터공학과 학술제 - 캠퍼스정복!',
    description:
      '교내 탐방과 퀴즈를 결합한 학교 소개 애플리케이션 제작',
    role: '기획/디자인',
    projectId: 'campus-quiz-app',
  },
]
