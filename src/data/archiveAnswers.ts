import type { Answer, CodeLanguage } from '../types/archive'

// 이관 검증용 원본. 실제 Archive 답변은 content/language/codeText를 사용함.
type LegacyAnswer = Pick<Answer, 'id' | 'postId' | 'createdAt'> & {
  blocks: ({ type: 'paragraph'; text: string } | { type: 'code'; language: CodeLanguage; codeText: string })[]
}

export const archiveAnswers: LegacyAnswer[] = [
  {
    id: 'backdrop-filter-deploy-answer-1',
    postId: 'backdrop-filter-deploy',
    blocks: [
      {
        type: 'paragraph',
        text: '로컬 코드만 확인하지 않고 Vercel에 배포된 결과의 CSS를 비교했다. 수동으로 추가했던 `-webkit-backdrop-filter`를 제거하고 `backdrop-filter`만 작성하도록 정리했다. 이후 빌드 결과에서 필요한 vendor prefix가 함께 생성되는 것을 확인했고, Header와 ContactButton의 blur 효과도 정상적으로 적용됐다. 이 과정에서 로컬에서는 정상적으로 보이는 스타일도 실제 배포 결과가 다를 수 있으므로, 배포 환경에서 문제가 발생하면 원본 코드뿐 아니라 최종 빌드 결과까지 확인해야 한다는 것을 배웠다.',
      },
      {
        type: 'code',
        language: 'css',
        codeText: `.contactButton {
  background: rgba(252, 253, 255, 0.72);
  backdrop-filter: blur(16px);
}`,
      },
    ],
    createdAt: '2026.09.07',
  },
  {
    id: 'active-section-scroll-answer-1',
    postId: 'active-section-scroll',
    blocks: [
      {
        type: 'paragraph',
        text: '`IntersectionObserver`의 교차 여부만 사용하는 방식을 제거하고, 각 섹션과 현재 viewport가 실제로 겹치는 높이를 직접 계산했다. 섹션마다 현재 화면에 보이는 높이를 구한 뒤 가장 많이 보이는 섹션을 active로 선택했다. Sticky Header가 화면 상단을 차지하고 있기 때문에 Header 높이도 계산에서 제외했다. 또한 페이지 최하단에서는 Contact가 화면을 완전히 채우지 못하더라도 마지막 섹션을 active로 표시하도록 별도 예외 처리를 추가했다.',
      },
      {
        type: 'code',
        language: 'tsx',
        codeText: `const sectionRect = section.getBoundingClientRect()

const visibleTop = Math.max(
  sectionRect.top,
  visibleAreaTop,
)

const visibleBottom = Math.min(
  sectionRect.bottom,
  visibleAreaBottom,
)

const visibleHeight = Math.max(
  0,
  visibleBottom - visibleTop,
)

if (visibleHeight > maxVisibleHeight) {
  maxVisibleHeight = visibleHeight
  nextActiveSectionId = section.id
}`,
      },
      {
        type: 'paragraph',
        text: '페이지 최하단은 별도로 처리했다.',
      },
      {
        type: 'code',
        language: 'tsx',
        codeText: `const currentScrollBottom =
  window.scrollY + window.innerHeight

const documentHeight =
  document.documentElement.scrollHeight

const isPageBottom =
  documentHeight - currentScrollBottom <= 2

if (isPageBottom) {
  setActiveSectionId(
    sectionIds[sectionIds.length - 1],
  )
  return
}`,
      },
    ],
    createdAt: '2026.09.07',
  },
  {
    id: 'navigation-active-hash-answer-1',
    postId: 'navigation-active-hash',
    blocks: [
      {
        type: 'paragraph',
        text: 'Header의 active 상태와 URL hash의 역할을 분리했다. 메뉴의 active 여부는 실제 스크롤 위치를 계산하는 `useActiveSection`의 결과를 기준으로 판단하고, URL hash는 현재 보고 있는 섹션을 주소에 반영하는 용도로만 사용했다.',
      },
      {
        type: 'paragraph',
        text: '이때 스크롤할 때마다 `pushState`를 사용하면 섹션이 바뀔 때마다 브라우저 방문 기록이 추가되어 뒤로가기를 여러 번 눌러야 하는 문제가 생긴다. 따라서 새로운 기록을 추가하지 않고 현재 주소만 변경하는 `replaceState`를 사용했다.',
      },
      {
        type: 'code',
        language: 'tsx',
        codeText: `const isActive =
  location.pathname === '/' &&
  activeSectionId === item.id`,
      },
      {
        type: 'paragraph',
        text: '현재 active 섹션이 변경되면 URL만 갱신했다.',
      },
      {
        type: 'code',
        language: 'tsx',
        codeText: `useEffect(() => {
  if (
    location.pathname !== '/' ||
    !activeSectionId
  ) {
    return
  }

  const nextHash = \`#\${activeSectionId}\`

  if (window.location.hash === nextHash) {
    return
  }

  window.history.replaceState(
    null,
    '',
    \`\${window.location.pathname}\${window.location.search}\${nextHash}\`,
  )
}, [activeSectionId, location.pathname])`,
      },
    ],
    createdAt: '2026.09.07',
  },
]
