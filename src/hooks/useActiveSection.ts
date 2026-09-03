import { useEffect, useState } from 'react'

/* 화면 중앙 근처에 들어온 Home 섹션의 id를 반환하는 훅
Navigation에서 현재 위치한 메뉴를 표시하기 위해 사용 */
export function useActiveSection(sectionIds: string[]) {
  // 첫 화면에서는 첫 번째 섹션인 About을 기본 active로 표시
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? '')

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

    // 컴포넌트가 사라질 때 observer 연결 정리
    return () => observer.disconnect()
  }, [sectionIds])

  return activeSectionId
}
