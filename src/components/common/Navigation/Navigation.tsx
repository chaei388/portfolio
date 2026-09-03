import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  archiveNavigationItem,
  sectionNavigationItems,
} from '../../../data/navigation'
import { useActiveSection } from '../../../hooks/useActiveSection'
import styles from './Navigation.module.css'

// Home 섹션 id 목록
const sectionIds = sectionNavigationItems.map((item) => item.id)

function Navigation() {
  // 현재 URL 정보
  // ex. /#skills이면 pathname은 '/', hash는 '#skills'
  // ex. /archive이면 pathname은 '/archive', hash는 ''
  // 여기서는 Home('/') 화면인지, Archive('/archive') 화면인지 구분할 때 사용
  const location = useLocation()

  // 스크롤 위치 기준 활성 섹션 id
  // ex. Skills 영역이 화면 중앙에 있으면 'skills'
  const activeSectionId = useActiveSection(sectionIds)

  useEffect(() => {
    // Home 화면이 아니거나 활성 섹션이 없으면 URL hash를 바꾸지 않음
    if (location.pathname !== '/' || !activeSectionId) return

    // 현재 섹션 기준 hash
    // ex. activeSectionId가 'projects'이면 nextHash는 '#projects'
    const nextHash = `#${activeSectionId}`

    // 이미 URL hash가 현재 섹션과 같으면 replaceState를 다시 실행하지 않음
    if (window.location.hash === nextHash) return

    // replaceState: 브라우저 주소만 교체하고, 뒤로가기 기록은 새로 쌓지 않는 API
    // 스크롤할 때마다 pushState를 쓰면 뒤로가기를 여러 번 눌러야 해서 replaceState를 사용
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}${nextHash}`,
    )
  }, [activeSectionId, location.pathname])

  return (
    <nav className={styles.navigation} aria-label="메인 메뉴">
      {/* Home 섹션 메뉴 */}
      <ul className={styles.menuList}>
        {sectionNavigationItems.map((item) => {
          // item.id: 이동할 section id
          // item.label: 화면에 보여줄 메뉴 이름

          // 현재 메뉴 활성 여부
          // Home 화면('/')에서 스크롤 위치의 섹션 id와 메뉴 id가 같으면 active 스타일 적용
          // URL의 hash(#skills 등)를 기준으로 삼으면 클릭 후 스크롤할 때 메뉴가 고정될 수 있음
          const isActive =
            location.pathname === '/' && activeSectionId === item.id

          return (
            <li key={item.id}>
              <a
                // href="/#섹션id": Home으로 이동한 뒤 해당 id 섹션으로 스크롤 (브라우저 기본 문법)
                href={`/#${item.id}`}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Archive 페이지 메뉴 */}
      <ul className={styles.featuredList}>
        <li>
          {/* NavLink: 현재 URL이 to 경로와 일치하면 isActive를 자동으로 전달 */}
          <NavLink
            // Archive는 Home 섹션이 아니라 별도 페이지이므로 path로 이동
            to={archiveNavigationItem.path}
            className={({ isActive }) =>
              `${styles.link} ${styles.featuredLink} ${
                isActive ? styles.active : ''
              }`
            }
          >
            {archiveNavigationItem.label}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
