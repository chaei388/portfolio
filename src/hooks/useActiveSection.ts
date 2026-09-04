import { useEffect, useState } from 'react'

/* 화면 중앙 근처에 들어온 Home 섹션의 id를 반환하는 훅
Navigation에서 현재 위치한 메뉴를 표시하기 위해 사용 */
export function useActiveSection(sectionIds: string[]) {
  // 초기 활성 섹션 id
  // ex. /#skills로 바로 들어온 경우 Skills 메뉴가 먼저 active 되도록 hash 값을 확인
  const getInitialSectionId = () => {
    const hashSectionId = window.location.hash.replace('#', '')

    if (sectionIds.includes(hashSectionId)) {
      return hashSectionId
    }

    return sectionIds[0] ?? ''
  }

  // 첫 화면에서는 URL hash가 있으면 해당 섹션, 없으면 첫 번째 섹션인 About을 기본 active로 표시
  const [activeSectionId, setActiveSectionId] = useState(getInitialSectionId)

  useEffect(() => {
    // 감시할 섹션 id가 없으면 observer 안 만듦
    if (sectionIds.length === 0) return

    // IntersectionObserver: 섹션이 화면에 들어왔는지 브라우저가 알려주는 API
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id)
          }
        })
      },
      {
        /* rootMargin: observer가 판단하는 화면 영역 조절
          위아래 45%를 줄여서 화면 중앙 근처에 온 섹션만 active로 판단 */
        rootMargin: '-45% 0px -45% 0px',
      },
    )

    sectionIds.forEach((sectionId) => {
      const section = document.getElementById(sectionId)

      // 아직 렌더링되지 않았거나 id가 잘못된 섹션은 null이므로 건너뜀
      if (section) {
        // 실제 DOM 요소를 observer 감시 대상에 등록
        observer.observe(section)
      }
    })

    // Contact 섹션이 옵저버에 안 잡히는 문제 해결
    // → 최하단에 닿으면 Contact 자동 active
    const handleScrollBottom = () => {
      // window.scrollY: 문서 맨 위에서 현재 얼마나 아래로 내려왔는지
      // window.innerHeight: 브라우저 화면에서 실제로 보이는 높이
      // 둘을 더하면 현재 화면의 아래쪽 위치를 알 수 있음
      const currentScrollBottom = window.scrollY + window.innerHeight

      // scrollHeight: 스크롤 가능한 문서 전체 높이
      const documentHeight = document.documentElement.scrollHeight

      // 2px 이내면 맨 아래로 판단
      const isPageBottom = documentHeight - currentScrollBottom <= 2

      if (isPageBottom) {
        // 마지막 섹션(Contact)이 짧아 observer 기준에 안 걸려도,
        // 페이지 맨 아래에서는 마지막 메뉴가 active 되도록 처리
        setActiveSectionId(sectionIds[sectionIds.length - 1])
      }
    }

    // scroll 이벤트: 사용자가 스크롤할 때마다 현재 위치가 맨 아래인지 확인
    window.addEventListener('scroll', handleScrollBottom, { passive: true })

    // 새로고침 또는 hash 진입 직후 이미 맨 아래인 경우를 대비해 한 번 실행
    handleScrollBottom()

    // 컴포넌트가 사라질 때 observer 연결 정리
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScrollBottom)
    }
  }, [sectionIds])

  return activeSectionId
}
