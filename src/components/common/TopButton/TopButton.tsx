import arrowIcon from '../../../assets/icons/arrow.svg'
import styles from './TopButton.module.css'

function TopButton() {
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={styles.button}
      aria-label="맨 위로 이동"
      onClick={handleClick}
    >
      <img className={styles.icon} src={arrowIcon} alt="" />
    </button>
  )
}

export default TopButton
