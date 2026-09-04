# Portfolio

현대 오토에버 모빌리티 스쿨 - 1차 프로젝트  
프론트엔드 기반 BaaS 포트폴리오 웹사이트  
One Page Portfolio + Archive Pages

## 배포 주소

- Vercel: https://portfolio-chaei.vercel.app/

## 기술 스택

- Frontend: React, TypeScript, Vite
- Routing: React Router
- Styling: CSS Modules
- Markdown: React Markdown, remark-gfm
- BaaS: Supabase

## 주요 기능

- About: 이름, 한 줄 소개, 자기소개, 학력 정보
- Experience: 개발 관련 활동 및 경험 타임라인
- Skills: 기술 스택 카테고리별 정리
- Projects: 프로젝트 소개, 역할, 기술 스택, GitHub/Demo 링크
- Contact: Email, GitHub 등 외부 링크
- Archive: 문제 해결 기록 목록, 상세 조회, 작성 기능 (Supabase 연동 예정)

## 라우트 구조

```txt
/                   Home(About, Experience, Skills, Projects, Contact)
/archive            Archive 목록
/archive/new        Archive 작성
/archive/:id        Archive 상세
```

## 프로젝트 구조

```txt
public/
├── favicon.svg
└── fonts/                                  # Paperlogy, Pretendard 폰트

src/
├── assets/
│   ├── images/                             # 프로젝트 스크린샷 등 이미지
│   └── icons/                              # GitHub, Email, Arrow 등 SVG 아이콘
│
├── components/
│   └── common/
│       ├── Header/                         # 상단 헤더
│       │   ├── Header.tsx
│       │   └── Header.module.css
│       ├── Navigation/                     # 메인 네비게이션
│       │   ├── Navigation.tsx
│       │   └── Navigation.module.css
│       ├── Footer/                         # 하단 푸터
│       │   ├── Footer.tsx
│       │   └── Footer.module.css
│       ├── ContactButton/                  # GitHub, Email 플로팅 버튼
│       │   ├── ContactButton.tsx
│       │   └── ContactButton.module.css
│       ├── Modal/                          # 공통 모달 컴포넌트
│       │   ├── Modal.tsx
│       │   └── Modal.module.css
│       └── TopButton/                      # 페이지 상단 이동 버튼
│           ├── TopButton.tsx
│           └── TopButton.module.css
│
├── pages/
│   ├── Home/                               # 홈 섹션 조립
│   │   ├── Home.tsx                        
│   │   ├── Home.module.css
│   │   └── sections/
│   │       ├── About/                      # 자기소개
│   │       │   ├── About.tsx               
│   │       │   └── About.module.css
│   │       ├── Experience/                 # 경험 타임라인
│   │       │   ├── Experience.tsx          
│   │       │   └── Experience.module.css
│   │       ├── Skills/                     # 기술 스택 목록
│   │       │   ├── Skills.tsx              
│   │       │   └── Skills.module.css
│   │       ├── Projects/                   # 프로젝트 카드 목록
│   │       │   ├── Projects.tsx
│   │       │   ├── Projects.module.css
│   │       │   ├── ProjectCard.tsx         # 프로젝트 카드 UI 및 버튼/모달 연결
│   │       │   ├── ProjectCard.module.css  # 스타일: 프로젝트 카드
│   │       │   └── ProjectModal.module.css # 스타일: 이미지/README 모달
│   │       └── Contact/                    # 연락 (깃허브, 이메일)
│   │           ├── Contact.tsx
│   │           └── Contact.module.css
│   └── Archive/
│       ├── ArchiveList/                    # 아카이브 목록 페이지
│       │   ├── ArchiveList.tsx
│       │   └── ArchiveList.module.css
│       ├── ArchiveDetail/                  # 아카이브 상세 페이지
│       │   ├── ArchiveDetail.tsx
│       │   └── ArchiveDetail.module.css
│       └── ArchiveWrite/                   # 아카이브 작성 페이지
│           ├── ArchiveWrite.tsx
│           └── ArchiveWrite.module.css
│
├── data/                                   # 정적 데이터
│   ├── about.ts                            # About - 프로필 데이터
│   ├── skills.ts                           # Skills - 기술 스택 데이터
│   ├── experience.ts                       # Experience - 경험 데이터
│   ├── projects.ts                         # Projects - 프로젝트 데이터
│   └── navigation.ts                       # Header Navigation - 메뉴 데이터
│
├── hooks/                                  # 커스텀 훅
│   ├── useActiveSection.ts
│   └── useScrollTo.ts
│
├── lib/                                    # 외부 서비스 클라이언트
│   └── supabaseClient.ts
│
├── styles/
│   └── var.css                             # 색상, 폰트, 레이아웃, radius 변수
│
├── types/
│   └── index.ts                            # 공통 타입
│
├── App.tsx                                 # 라우트 정의
├── index.css                               # 전역 스타일
└── main.tsx                                # React 진입점
```
