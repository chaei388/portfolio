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
- Archive: Supabase 기반 문제 해결 기록과 답변 조회, 관리자 로그인 및 글/답변 관리

## Supabase 활용

- Home은 정적 데이터로 구성하고, Archive에만 Supabase Authentication과 Database 적용
- 환경변수의 프로젝트 URL과 Publishable Key를 사용해 Supabase Client 생성
- `archiveApi.ts`에서 DB의 `snake_case` 데이터를 화면용 `camelCase` 데이터로 변환

**Authentication 흐름**

1. `ArchiveLayout`에서 Supabase 인증 상태 구독
2. 이메일과 비밀번호를 이용한 관리자 로그인
3. `is_archive_admin` RPC를 호출해 등록된 관리자 여부 확인
4. 인증 상태와 로그인·로그아웃 함수를 Context로 Archive 하위 페이지에 공유

**Archive 데이터 및 권한**

- 방문자는 RLS 정책을 통과한 공개 게시글과 답변 조회 가능
- 관리자는 본인 소유의 게시글·답변 작성 및 삭제, 게시글 해결 상태 변경 가능
- 게시글과 답변은 일반 본문과 선택 코드 언어·코드를 별도 필드로 저장
- 답변 저장과 해결완료 처리는 `save_archive_answer` RPC의 단일 트랜잭션으로 처리
- 프론트엔드의 관리자 화면 제한과 별도로 Supabase RLS에서 실제 데이터 접근 권한 검증

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
│       ├── ConfirmModal/                   # 확인/선택 액션 모달
│       │   ├── ConfirmModal.tsx
│       │   └── ConfirmModal.module.css
│       ├── Dropdown/                       # 공통 드롭다운
│       │   ├── Dropdown.tsx
│       │   └── Dropdown.module.css
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
│       ├── ArchiveLayout.tsx               # Archive 인증 영역과 로그인/로그아웃
│       ├── ArchiveLogin.tsx                # 관리자 로그인 모달
│       ├── ArchiveCommon.module.css        # Archive 관리 UI 공통 스타일
│       ├── useArchiveAuth.ts               # Archive 인증 컨텍스트
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
│   ├── archiveAnswers.ts                   # Archive - 초기 답변 데이터
│   ├── archiveLanguages.ts                 # Archive - 코드 언어 옵션
│   ├── archivePosts.ts                     # Archive - 초기 게시글 데이터
│   ├── skills.ts                           # Skills - 기술 스택 데이터
│   ├── experience.ts                       # Experience - 경험 데이터
│   ├── projects.ts                         # Projects - 프로젝트 데이터
│   └── navigation.ts                       # Header Navigation - 메뉴 데이터
│
├── hooks/                                  # 커스텀 훅
│   ├── useActiveSection.ts                 # 현재 화면 기준 active 섹션 계산
│   ├── useArchiveQuery.ts                  # Archive 조회 취소와 로딩/오류 처리
│   └── useRouteScroll.ts                   # 라우트 이동 시 스크롤 위치 보정
│
├── lib/                                    # 외부 서비스 클라이언트
│   ├── archiveApi.ts                       # Archive 데이터 조회 및 저장 요청
│   └── supabaseClient.ts
│
├── styles/
│   └── var.css                             # 색상, 폰트, 레이아웃, radius, shadow 변수
│
├── types/                                  # 타입 정의
│   ├── archive.ts                          # Archive 타입
│   ├── database.ts                         # Archive DB 타입
│   ├── experience.ts                       # Experience 타입
│   ├── navigation.ts                       # Navigation 타입
│   ├── project.ts                          # Project 타입
│   ├── skill.ts                            # Skill 타입
│   └── index.ts                            # 타입 내보내기
│
├── App.tsx                                 # 라우트 정의 및 스크롤 훅 연결
├── index.css                               # 전역 스타일
└── main.tsx                                # React 진입점

.env.example                            # Supabase 환경변수 예시
```
