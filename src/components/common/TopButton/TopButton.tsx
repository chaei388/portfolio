import { useEffect, useState } from 'react'
import arrowIcon from '../../../assets/icons/arrow.svg'
import styles from './TopButton.module.css'

function TopButton() {
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    const updateVisibility = () => {
      // window.scrollY: 페이지 최상단에서 현재 얼마나 아래로 내려왔는지
      // 0이면 최상단이므로 버튼 숨김, 0보다 크면 버튼 표시
      setIsHidden(window.scrollY === 0)
    }

    updateVisibility()

    // passive: true는 scroll 이벤트 안에서 preventDefault를 쓰지 않겠다는 의미
    // 브라우저가 스크롤을 더 부드럽게 처리할 수 있음
    window.addEventListener('scroll', updateVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateVisibility)
    }
  }, [])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isHidden ? styles.hidden : ''}`}
      aria-label="맨 위로 이동"
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : undefined}
      onClick={handleClick}
    >
      <img className={styles.icon} src={arrowIcon} alt="" />
    </button>
  )
}

export default TopButton
