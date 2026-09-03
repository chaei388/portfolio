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
  const location = useLocation()

  // 스크롤 위치 기준 활성 섹션 id
  // ex. Skills 영역이 화면 중앙에 있으면 'skills'
  const activeSectionId = useActiveSection(sectionIds)

  // URL의 # 뒤에 있는 섹션 id
  // ex. '#skills'에서 비교에 필요한 'skills'만 추출
  const hashSectionId = location.hash.replace('#', '')

  // 최종 활성 섹션 id
  // 클릭 직후에는 hashSectionId를 우선 사용하고, hash가 없으면 스크롤 감지값을 사용
  const currentSectionId = hashSectionId || activeSectionId

  return (
    <nav className={styles.navigation} aria-label="메인 메뉴">
      {/* Home 섹션 메뉴 */}
      <ul className={styles.menuList}>
        {sectionNavigationItems.map((item) => {
          // item.id: 이동할 section id
          // item.label: 화면에 보여줄 메뉴 이름

          // 현재 메뉴 활성 여부
          // Home 화면('/')에서 현재 섹션 id와 메뉴 id가 같으면 active 스타일 적용
          const isActive =
            location.pathname === '/' && currentSectionId === item.id

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
