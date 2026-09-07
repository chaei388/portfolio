import type { ArchivePost } from '../types'

export const archivePosts: ArchivePost[] = [
  {
    id: 'backdrop-filter-deploy',
    title: 'Vercel 배포 환경에서 backdrop-filter 미적용 오류',
    content: '로컬 개발 환경에서는 Header와 ContactButton의 글래스 효과가 정상적으로 보였지만, Vercel에 배포한 뒤에는 backdrop-filter의 blur 효과가 적용되지 않았다. 동일한 CSS를 사용하고 있었기 때문에 처음에는 브라우저 차이라고 생각했지만, 개발자 도구에서 로컬과 배포 환경의 최종 CSS를 비교해보니 빌드 이후 적용되는 스타일에 차이가 있었다. 특히 backdrop-filter와 함께 호환성을 위해 직접 작성해둔 -webkit-backdrop-filter가 배포 결과에서 예상과 다르게 처리되고 있었다.',
    language: 'css',
    codeText: `backdrop-filter: saturate(160%) blur(1rem);
    -webkit-backdrop-filter: saturate(160%) blur(1rem);`,
    tags: ['CSS', 'Vite', 'Vercel', 'Troubleshooting'],
    status: 'solved',
    answerCount: 1,
    createdAt: '2026.09.07',
  },
  {
    id: 'active-section-scroll',
    title: 'Header 메뉴 active 오류',
    content: 'Header에서 현재 보고 있는 섹션의 메뉴를 active 상태로 표시하기 위해 IntersectionObserver를 사용했다. 화면 위아래 영역을 각각 45%씩 줄여 중앙 근처에 들어온 섹션을 active로 판단하도록 구현했으며, 아래로 스크롤할 때는 대체로 정상적으로 동작했다. 하지만 마지막 Contact 섹션까지 내려간 뒤 다시 위로 스크롤하면 이전 섹션으로 active가 자연스럽게 전환되지 않는 경우가 발생했다. 화면 중앙의 좁은 영역과 섹션이 교차하는지만을 기준으로 상태를 변경하다 보니, 섹션의 높이와 스크롤 방향에 따라 현재 사용자가 보고 있는 영역과 active 메뉴가 어긋나는 문제가 있었다.',
    language: 'tsx',
    codeText: `const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id)
        }
      })
    },
    {
      rootMargin: '-45% 0px -45% 0px',
    },
  )

  sectionIds.forEach((sectionId) => {
    const section = document.getElementById(sectionId)

    if (section) {
      observer.observe(section)
    }
  })`,
    tags: ['React', 'Scroll', 'IntersectionObserver', 'Custom Hook'],
    status: 'solved',
    answerCount: 1,
    createdAt: '2026.09.04',
  },
  {
    id: 'navigation-active-hash',
    title: 'URL hash 기준 Header active 처리 오류',
    content:
      'Header 메뉴의 active 상태를 표시할 때 URL hash와 스크롤 감지값을 함께 사용했다. 메뉴를 클릭하면 URL에 #skills와 같은 hash가 생기고, 클릭 직후에는 해당 메뉴가 바로 active 되도록 hash 값을 스크롤 감지값보다 우선하도록 구현했다. 하지만 한 번 hash가 생성된 뒤에는 사용자가 다른 섹션으로 직접 스크롤해 useActiveSection의 값이 변경되어도 기존 hash가 계속 우선 적용되었다. 그 결과 실제로 보고 있는 섹션은 바뀌었지만 Header에서는 처음 클릭한 메뉴가 계속 active 상태로 남는 문제가 발생했다.',
    language: 'tsx',
    codeText: `const activeSectionId = useActiveSection(sectionIds)

  const hashSectionId = location.hash.replace('#', '')

  // hash가 존재하면 스크롤 감지값보다 항상 우선됨
  const currentSectionId = hashSectionId || activeSectionId

  const isActive =
    location.pathname === '/' &&
    currentSectionId === item.id`,
    tags: ['React', 'React Router', 'Navigation', 'URL Hash'],
    status: 'solved',
    answerCount: 1,
    createdAt: '2026.09.03',
  },
]