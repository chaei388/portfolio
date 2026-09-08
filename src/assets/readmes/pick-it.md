# 🧲 Pick-It Frontend

> 캡스톤디자인 프로젝트 - Pick-It 프론트엔드 레포지토리

---

## 🛠️ 기술 스택

- Framework: React (Vite)
- Language: JavaScript (JSX)
- Styling: SASS / SCSS
- Build Tool: Vite

---

## 📁 프로젝트 구조

```
src
├── assets
│   ├── images          # 로고 및 정적 이미지 파일
│   └── sass            # 스타일 관리
│       ├── components  # 컴포넌트 스타일 파일
│       ├── sections    # 페이지별 스타일
│       │   ├── _splash.scss
│       │   ├── _onboarding.scss
│       │   ├── _home.scss
│       │   ├── _group.scss
│       │   ├── _chat.scss
│       │   └── _mypage.scss
│       ├── setting     # 전역 설정 (common, reset, var, mixin.scss)
│       └── style.scss  # 전체 스타일 통합 파일
├── components          # 재사용 가능한 공통 컴포넌트 (Button, Input 등) 및 해당 페이지에서만 사용되는 컴포넌트는 페이지별 폴더 생성 후 관리
├── pages               # 메인 페이지 컴포넌트
│   ├── Splash.jsx      # 스플래시 화면
│   ├── Onboarding.jsx  # 온보딩 화면
│   ├── Home.jsx        # 홈 화면
│   ├── Group.jsx       # 모집 화면
│   ├── Chat.jsx        # 채팅 화면
│   └── Mypage.jsx      # 마이페이지 화면
├── App.jsx             # 메인 앱 컴포넌트 및 라우팅 설정
└── main.jsx            # 엔트리 포인트
```

---

## 🌿 브랜치 전략

`Github Flow` 기반으로 운영합니다.

```
main ← develop ← feat/*
```

| 브랜치 | 설명 |
|--------|------|
| `main` | 배포용 안정 브랜치. PR로만 병합, 직접 커밋 금지 |
| `develop` | 통합 개발 브랜치. feature 브랜치들이 병합되는 곳 |
| `feat/{도메인}-{기능명}` | 기능 단위 개발 브랜치 (예: `feat/auth-login`) |

### 작업 흐름

1. 작업 단위로 **Issue** 생성
2. `develop` 브랜치에서 `feat/` 브랜치 분기
3. 작업 완료 후 `develop`으로 **PR** 생성
4. **2인 이상 코드 리뷰 및 승인** 후 병합
5. 배포 가능 상태 확인 후 `develop` → `main` PR 생성

---

## ✍️ 커밋 컨벤션

```
Type: 제목

본문 (선택) - 무엇을, 왜 변경했는지 설명

```

### 커밋 타입

| Type | 설명 | 예시 |
|------|------|------|
| `Feat` | 새로운 기능 추가 | `Feat: 로그인 API 추가 ` |
| `Fix` | 버그 수정 | `Fix: 토큰 갱신 오류 수정 ` |
| `Refactor` | 코드 리팩토링 (기능 변경 없음) | `Refactor: 유저 서비스 로직 분리` |
| `Docs` | 문서 수정 | `Docs: README 업데이트` |
| `Style` | 코드 스타일 변경 (로직 영향 없음) | `Style: import 정리` |
| `Test` | 테스트 코드 추가/수정 | `Test: 유저 저장 테스트 추가` |
| `Chore` | 빌드/설정/기타 작업 | `Chore: Gradle 의존성 업데이트` |
| `Init` | 프로젝트 초기 세팅 | `Init: Spring Boot 프로젝트 초기화` |
| `Rename` | 파일/폴더명 변경 | `Rename: UserDto → UserResponseDto` |
| `Remove` | 파일/코드 삭제 | `Remove: 미사용 테스트 코드 삭제` |
| `Merge` | 브랜치 병합 | `Merge: feat/user-1-signup` |
| `!HOTFIX` | 운영 긴급 수정 | `!HOTFIX: 로그인 실패 긴급 수정` |

### 예시

```
Feat: 아이템 찜하기 API 추가

사용자가 아이템을 찜 목록에 추가/제거할 수 있는 API를
구현했습니다.

```

---

## 📋 PR 규칙

### Pull Request
```
[Tag] 제목
```
- Labels, Assignees, Reviewers 지정 필수
- 관련 이슈 / 작업 내용 / 테스트 결과 / 참고 사항 포함
- **2인 이상 승인 후 병합**
