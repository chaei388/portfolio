import { Link } from 'react-router-dom'
import Navigation from '../Navigation/Navigation'
import styles from './Header.module.css'

function Header() {
  // 로고 클릭 시 최상단 이동
  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* 로고: favicon 이미지와 Portfolio 텍스트를 하나의 링크로 사용 */}
        <Link to="/" className={styles.logo} onClick={handleLogoClick}>
          <img src="/favicon.svg" alt="" className={styles.logoIcon} />
          <span>Portfolio</span>
        </Link>

        {/* 메인 네비게이션 */}
        <Navigation />
      </div>
    </header>
  )
}

export default Header
