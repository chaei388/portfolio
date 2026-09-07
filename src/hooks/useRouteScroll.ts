import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const HOME_PATH = '/'

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  })
}

export function useRouteScroll() {
  const location = useLocation()

  useEffect(() => {
    // 브라우저의 이전 스크롤 위치 자동 복원을 끄고, 라우트 기준으로 직접 제어
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useEffect(() => {
    let firstFrameId = 0
    let secondFrameId = 0

    const updateScrollPosition = () => {
      // Archive처럼 Home이 아닌 페이지로 이동하면 항상 페이지 최상단에서 시작
      if (location.pathname !== HOME_PATH) {
        scrollToTop()
        return
      }

      // Home('/')에 hash가 없으면 About 섹션이 있는 최상단에서 시작
      if (!location.hash) {
        scrollToTop()
        return
      }

      // hash: URL에서 # 뒤에 붙는 값
      // ex. /#skills → location.hash는 '#skills', sectionId는 'skills'
      const sectionId = decodeURIComponent(location.hash.replace('#', ''))
      const targetSection = document.getElementById(sectionId)

      if (!targetSection) {
        scrollToTop()
        return
      }

      // section의 scroll-margin-top 값을 반영해서 sticky Header 아래로 이동
      targetSection.scrollIntoView({
        block: 'start',
        behavior: 'auto',
      })
    }

    // 라우트가 바뀐 직후에는 새 페이지 DOM이 막 그려지는 중일 수 있어서
    // requestAnimationFrame을 두 번 거쳐 레이아웃이 잡힌 뒤 스크롤 위치를 계산
    firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(updateScrollPosition)
    })

    return () => {
      cancelAnimationFrame(firstFrameId)
      cancelAnimationFrame(secondFrameId)
    }
  }, [location.hash, location.pathname])
}
