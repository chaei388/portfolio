import arrowIcon from '../../../assets/icons/Arrow.svg'

function TopButton() {
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button type="button" aria-label="맨 위로 이동" onClick={handleClick}>
      <img src={arrowIcon} alt="" />
    </button>
  )
}

export default TopButton
