# 수박의정석

**수박의정석**은 수박을 살 때 참고할 수 있는 가격 흐름과 사진 기반 수박 외관 분석을 한 번에 확인하는 Streamlit 서비스입니다.
당일 기준 도매가 대시보드와 수박 이미지 분석 결과를 제공해 사용자가 수박을 고를 때 참고할 수 있도록 돕습니다.

- 배포 URL: https://watermelon-ai.streamlit.app/

## 주요 기능

### 수박 가격 예측 대시보드

백엔드 가격 예측 API에서 데이터를 받아 어제, 오늘, 내일 도매가와 7일 예측 흐름을 보여줍니다.

- 어제, 오늘, 내일 도매가 요약
- 오늘부터 7일간 예측 가격 그래프
- AI 모델 관련 안내 제공

### 이 수박 맛있을까?

수박 사진을 촬영하거나 업로드하면 외관 기반 숙도 분석 결과를 보여줍니다.

- 카메라 촬영 또는 갤러리 이미지 첨부, 이미지 미리보기 및 선택 확정
- `맛있는 수박`/`맛없는 수박` 분류, 예측 확률과 신뢰도 안내
- AI 모델 관련 안내 제공

## 주요 폴더 구조

```text
watermelon-fe/
├─ app.py                         # 홈 화면과 페이지 진입점
├─ pages/
│  ├─ price_prediction.py         # 가격 예측 API 연동 및 대시보드
│  └─ watermelon_quality.py       # 이미지 입력 및 분석 결과 화면
├─ src/
│  ├─ custom_vision.py            # Azure Custom Vision Prediction API 연동
│  └─ ui.py                       # 공통 테마와 UI 헬퍼
├─ .streamlit/
│  └─ config.toml                 # 이미지 업로드 용량 설정
├─ .env.example                   # 환경변수 작성 예시
├─ requirements.txt               # Python 패키지 목록
└─ README.md
```

## 실행 방법

### 1. 가상환경 생성 및 활성화

```bash
python -m venv .venv
```

Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, 아래 형식으로 Azure Custom Vision 정보를 입력합니다.

```env
CUSTOM_VISION_PREDICTION_KEY=실제 Prediction Key 입력
CUSTOM_VISION_PREDICTION_URL=실제 Prediction URL 입력
```

`.env` 파일에는 실제 Key가 포함되므로 GitHub에 업로드하지 않습니다.
GitHub에는 `.env.example`만 업로드합니다.

가격 예측 API 주소는 코드에 설정된 운영 엔드포인트를 기본값으로 사용합니다.

### 4. Streamlit 실행

```bash
streamlit run app.py
```

---

## 브랜치 전략

짧은 개발 기간에 맞춰 **팀원별 개인 개발 브랜치**를 사용합니다.
브랜치는 단순하게 관리하고, 작업 내용은 커밋 메시지와 PR 제목에 명확히 남깁니다.

```text
main
└─ dev/이름
```

| 브랜치 | 설명 | 예시 |
| --- | --- | --- |
| `main` | 최종 제출 기준 브랜치 | `main` |
| `dev/이름` | 팀원별 개인 작업 브랜치 | `dev/chaei` |

### 작업 흐름

1. 각자 `dev/이름` 브랜치에서 작업
2. 작업 단위로 커밋
3. 작업이 끝나면 `main`으로 PR 생성
4. 화면 동작 확인 후 병합

## 커밋 컨벤션

```text
type: 작업 내용
```

### 커밋 타입

| Type | 설명 | 예시 |
| --- | --- | --- |
| `feat` | 새로운 기능 또는 화면 추가 | `feat: 수박 이미지 분석 모달 흐름 추가` |
| `fix` | 버그 수정 | `fix: 이미지 분석 결과 그래프 표시 수정` |
| `style` | UI, CSS, 문구 수정 | `style: 홈 카드 디자인 개선` |
| `docs` | 문서 수정 | `docs: README 협업 규칙 추가` |
| `chore` | 설정, 의존성, 기타 정리 | `chore: Streamlit 배포 설정 정리` |

## PR 컨벤션

### Pull Request

```text
[type] 작업 내용
```

- 관련 작업 내용을 간단명료하게 적습니다.
- 직접 확인한 동작을 체크합니다.

---

## 현재 상태

현재 서비스는 Streamlit Community Cloud에 배포되어 있습니다.

- 가격 예측 페이지는 백엔드의 `GET /api/v1/prices` 응답을 사용합니다.
- 이미지 분석 페이지는 Azure Custom Vision Prediction API와 연동합니다.
- Custom Vision Key와 Prediction URL은 로컬 `.env` 또는 Streamlit Secrets에서 관리합니다.
- 외부 API의 상세 오류는 사용자 화면에 노출하지 않고 서버 로그에 필요한 범위로 기록합니다.
