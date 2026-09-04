import { useEffect, useState } from 'react'

/* 현재 화면에서 가장 많이 보이는 Home 섹션의 id를 반환하는 훅
Navigation에서 현재 위치한 메뉴를 표시하기 위해 사용 */
export function useActiveSection(sectionIds: string[]) {
  // 초기 활성 섹션 id
  // ex. /#skills로 바로 들어온 경우 Skills 메뉴가 먼저 active 되도록 hash 값을 확인
  const getInitialSectionId = () => {
    const hashSectionId = window.location.hash.replace('#', '')

    // 실제 존재하는 섹션인지 확인
    if (sectionIds.includes(hashSectionId)) {
      return hashSectionId
    }

    // 실제 존재하지 않는 섹션이면 맨 위로
    return sectionIds[0] ?? ''
  }

  // 첫 화면에서는 URL hash가 있으면 해당 섹션, 없으면 첫 번째 섹션인 About을 기본 active로 표시
  const [activeSectionId, setActiveSectionId] = useState(getInitialSectionId)

  useEffect(() => {
    // 감시할 섹션 id가 없으면 스크롤 계산 X
    if (sectionIds.length === 0) return

    // HTML section 가져오기
    const getSectionElements = () =>
      sectionIds
        .map((sectionId) => document.getElementById(sectionId))
        .filter((section): section is HTMLElement => Boolean(section))

    // 섹션 active 자동 전환 처리하는 함수!
    // 현재 화면에서 가장 많이 보이는 section이 뭔지 계산해서 반영
    const updateActiveSection = () => {
      const sectionElements = getSectionElements()

      // 아직 렌더링된 섹션이 없으면 active 값을 바꾸지 않음
      if (sectionElements.length === 0) return
      
      // window.scrollY: 페이지 맨 위에서부터 얼마나 내려왔는지
      // window.innerHeight: 현재 브라우저 화면 높이
      // currentScrollBottom: 현재 화면의 맨 아래가 문서의 어느 위치인지
      const currentScrollBottom = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 화면 아래쪽과 문서 끝의 차이가 2px 이하면 페이지 맨 아래로 판단
      const isPageBottom = documentHeight - currentScrollBottom <= 2

      // 페이지 맨 아래에서는 마지막 섹션(Contact)을 우선 active 처리
      if (isPageBottom) {
        setActiveSectionId(sectionIds[sectionIds.length - 1])
        return
      }

      // Header는 sticky라 화면 위쪽을 차지하므로, 실제 본문이 보이는 영역은 Header 아래부터로 계산
      const headerHeight =
        document.querySelector('header')?.getBoundingClientRect().height ?? 0
      const visibleAreaTop = headerHeight
      const visibleAreaBottom = window.innerHeight

      let maxVisibleHeight = 0
      let nextActiveSectionId = ''

      sectionElements.forEach((section) => {
        const sectionRect = section.getBoundingClientRect()

        // visibleTop/visibleBottom: 섹션과 현재 화면이 겹치는 부분의 위/아래 위치
        const visibleTop = Math.max(sectionRect.top, visibleAreaTop)
        const visibleBottom = Math.min(sectionRect.bottom, visibleAreaBottom)

        // visibleHeight: 현재 화면에 실제로 보이는 섹션 높이
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight
          nextActiveSectionId = section.id
        }
      })

      // 화면에 보이는 섹션이 있을 때만 active 변경
      if (nextActiveSectionId) {
        setActiveSectionId(nextActiveSectionId)
      }
    }

    // scroll 이벤트: 사용자가 스크롤할 때마다 가장 많이 보이는 섹션 다시 계산
    window.addEventListener('scroll', updateActiveSection, { passive: true })

    // resize 이벤트: 브라우저 높이가 바뀌면 보이는 섹션 비율도 달라질 수 있어서 다시 계산
    window.addEventListener('resize', updateActiveSection)

    // 첫 렌더링 직후 현재 위치 기준 active 섹션 계산
    updateActiveSection()

    // 컴포넌트가 사라질 때 이벤트 연결 정리
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sectionIds])

  return activeSectionId
}
