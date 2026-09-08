# Archive Supabase 설정

Home의 데이터는 `src/data`의 정적 데이터를 사용한다. Supabase와 인증은 `/archive` 경로에서만 초기화된다.

2026-09-08 현재 대상 Supabase 프로젝트에 두 마이그레이션을 적용했다. 관리자 1명, 기존 글 3개와 답변 3개를 유지하고 공개 회원가입 차단을 확인했다. 답변은 본문과 선택 코드로 통일했으며, `updated_at` 컬럼과 관련 트리거·함수는 제거했다. 아래 최초 설정 절차는 새 프로젝트에서 재현할 때 참고한다. 현재 프로젝트에 적용한 SQL을 다시 실행할 필요는 없다.

## 환경변수

`.env.example`을 `.env.local`로 복사한 뒤 해당 프로젝트의 URL과 publishable key를 설정한다.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

환경변수 변경 후 개발 서버를 다시 시작한다. `VITE_` 값은 브라우저에 포함되므로 관리자 비밀번호, DB 비밀번호, secret key, service_role key를 넣지 않는다. 실제 환경변수 파일은 Git에서 제외한다.

Vercel 프로젝트의 Settings → Environment Variables에도 위 두 변수를 등록하고 새 빌드를 배포해야 한다. `.env.local`은 Git에 올라가지 않으므로 기존 Vercel 배포에 자동 전달되지 않는다.

## 최초 프로젝트 설정

1. Authentication → Users에서 이메일/비밀번호 관리자 계정을 생성하고 이메일 인증을 확인한다.
2. Authentication → Sign In / Providers에서 `Allow new users to sign up`을 끈다. 익명 로그인도 사용하지 않는다. Email 로그인을 유지한다.
3. SQL Editor 또는 관리자 DB 연결로 `supabase/migrations/202609070001_archive.sql`, `202609070002_answer_fields_and_immutable_content.sql`을 순서대로 실행한다. 각 파일을 한 번만 적용한다. 첫 파일은 과거 구조를 기록하며, 두 번째 파일까지 적용한 결과가 현재 스키마다.
4. `supabase/seed.sql`을 실행한다. 지정한 Auth UID와 이메일 인증을 확인한 뒤 관리자 권한, 글 3개, 답변 3개를 등록한다.
5. Archive의 관리자 로그인으로 로그인하고 작성/삭제, 해결 상태 전환과 로그아웃을 확인한다.

현재 초기 데이터의 관리자 UID는 `7d2bc12a-4449-443a-9bb0-8442fe89db9f`이다. 다른 프로젝트에서 사용할 때는 `scripts/create-archive-seed.mjs`의 관리자 UID와 확인용 이메일을 변경하고 `node scripts/create-archive-seed.mjs`로 SQL을 다시 생성한다. Node 24에서 실행할 수 있다.

초기 데이터 SQL은 같은 ID가 이미 있으면 내용을 덮어쓰지 않는다. 기존 주소와 작성일, 답변의 문단/코드 순서를 보존한다. 마지막 코드블록은 `code_text`로, 중간 코드블록은 Markdown 본문으로 옮긴다. `src/data/archivePosts.ts`와 `archiveAnswers.ts`는 이관 원본으로 보존하며 실제 화면에서는 import하지 않는다.

## 권한과 데이터

| 대상 | 권한 |
| --- | --- |
| 방문자 | 공개 글과 해당 글의 답변 조회 |
| 일반 로그인 계정 | 공개 글과 답변 조회, 쓰기 불가 |
| 등록된 관리자 | 본인 글 작성·삭제·해결 상태 변경, 본인 글에 답변 작성 및 본인 답변 삭제 |

- `archive_admins`: 관리자 UID 목록. 브라우저에서 관리자 추가/변경 불가.
- `archive_posts`: 글, 소유자, 코드, 태그, 공개 여부, 해결 상태, 작성 시각.
- `archive_answers`: 연결된 글, 소유자, 필수 본문, 선택 언어·코드, 작성 시각.
- `is_archive_admin`: 현재 인증 계정의 관리자 여부 확인.
- `save_archive_answer`: 답변과 해결완료 변경을 하나의 트랜잭션으로 저장. 실패 시 둘 다 취소.
- 글을 삭제하면 답변도 함께 삭제된다. 답변만 삭제할 때는 해결 상태를 유지한다.
- 답변 수는 조회 시 실제 답변에서 계산한다. 새 글은 기본 공개/미해결로 저장한다.
- 날짜는 DB에 `timestamptz`로 저장하고 화면에서는 한국 시간의 날짜로 표시한다.

관리 UI와 작성 경로의 접근 제어에 더해, 모든 DB 쓰기를 RLS에서 다시 검사한다. 공개 회원가입이 실수로 켜져 있어도 등록된 관리자 외의 계정은 쓸 수 없다.

글과 답변의 내용은 작성 후 수정할 수 없다. 게시글의 테이블 전체 UPDATE 권한을 제거하고 `status` 컬럼에만 UPDATE를 허용한다. 답변에는 UPDATE 권한이 없다. 기존 `/archive/:id/edit` 주소는 목록으로 이동한다. 공개 여부도 브라우저에서 변경할 수 없으며 새 글은 공개로 작성한다.

## 컬럼 기본값과 제약

| 테이블 | 컬럼 | 필수 여부 / 기본값 | 제약과 용도 |
| --- | --- | --- | --- |
| 관리자 | `user_id` | 필수 / 기본값 없음 | PK, Auth 사용자 FK |
| 글·답변 | `id` | 필수 / UUID 문자열 자동 생성 | PK. 기존 글 주소 보존을 위해 text 유지 |
| 글·답변 | `owner_id` | 필수 / `auth.uid()` | Auth 사용자 FK, RLS로 관리자 본인 확인 |
| 글·답변 | `content` | 필수 / 기본값 없음 | 공백만 입력 불가, 최대 50,000자 |
| 글·답변 | `language` | 선택 / 미입력 시 NULL | 지원 언어 10종, 코드 없으면 NULL |
| 글·답변 | `code_text` | 선택 / 미입력 시 NULL | 코드가 있으면 공백만 입력 불가, 최대 50,000자 |
| 글·답변 | `created_at` | 필수 / `now()` | 시간대 포함 작성 시각 |
| 글 | `title` | 필수 / 기본값 없음 | 공백만 입력 불가, 최대 200자 |
| 글 | `tags` | 선택 / 미입력 시 NULL | 최대 20개 |
| 글 | `status` | 필수 / `unsolved` | `solved` 또는 `unsolved` |
| 글 | `is_public` | 필수 / `true` | 공개 조회 여부 |
| 답변 | `post_id` | 필수 / 기본값 없음 | 글 FK, 글 삭제 시 답변도 삭제 |

답변 `language`의 빈 문자열 기본값은 제거했다. 선택값이 없다는 의미는 NULL로 통일한다. 언어를 선택하지 않고 코드만 입력하는 것은 가능하며 화면에 Plain Text로 표시한다. 과거 `blocks`의 JSON 검사와 `updated_at` 갱신 트리거는 현재 스키마에서 사용하지 않는다.

## 확인 방법

```sh
npm run build
npm run lint
```

`supabase/tests/archive_rls.sql`을 PostgreSQL 관리자 연결 또는 SQL Editor에서 실행하면 방문자/일반 계정/관리자의 권한, 비공개 답변 노출 방지, 내용 수정 차단, 기본값과 선택 코드, 답변·해결 상태 트랜잭션, 삭제 후 답변 정리를 검증한다. 테스트 데이터와 변경은 마지막에 롤백된다.

현재 프로젝트의 공개 API와 초기 데이터 이관 결과를 확인하려면 다음을 실행한다. 원본 데이터와 비교하므로 기존 글·답변을 삭제하거나 원본 글에 답변을 추가한 뒤에는 비교 결과가 달라질 수 있다.

```sh
node --env-file=.env.local scripts/verify-archive.mjs
```

`ARCHIVE_TEST_EMAIL`, `ARCHIVE_TEST_PASSWORD`를 프로세스 환경변수에 설정하고 `--write`를 붙이면 별도의 임시 글로 로그인, 작성, 내용 수정 차단, 공개/비공개 조회, 선택 코드 답변, 해결 상태 전환, 삭제까지 검증한다. 스크립트는 자신이 생성한 임시 글과 답변만 정리하고 인증 토큰과 비밀번호를 출력하지 않는다.

브라우저에서는 다음을 확인한다.

- 비로그인 목록·상세에서 글/답변은 보이고 새 글, 답변 작성, 삭제는 숨겨지는지
- `/archive/new` 직접 접근 시 로그인 안내가 나오는지
- `/archive/:id/edit` 직접 접근 시 목록으로 이동하는지
- 로그인 후 작성한 글과 답변이 새로고침 후에도 유지되는지
- 답변의 ‘그냥 저장’과 ‘해결완료’가 각각 맞게 반영되는지
- 답변 본문만 저장하거나 ‘코드 추가 (선택)’에서 언어·코드를 함께 저장할 수 있는지
- 세션 복원, 로그아웃, 잘못된 비밀번호, 네트워크 실패 시 안내가 적절한지
- Home에서 관리자 UI가 나타나지 않고 기존 정적 섹션이 유지되는지

로그아웃은 현재 브라우저 세션에 적용한다. 비밀번호를 잊은 경우 Supabase 대시보드에서 관리자 계정을 관리한다. 이 프로젝트에는 회원가입과 비밀번호 재설정 메일 화면을 제공하지 않는다.

## 참고

- [Supabase 이메일/비밀번호 인증](https://supabase.com/docs/guides/auth/passwords)
- [Supabase Auth 설정](https://supabase.com/docs/guides/auth/general-configuration)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase 컬럼별 권한](https://supabase.com/docs/guides/database/postgres/column-level-security)
- [Vite 환경변수](https://vite.dev/guide/env-and-mode)
