import { useEffect, useId, useRef, useState } from 'react'
import arrowIcon from '../../../assets/icons/arrow2.svg'
import styles from './Dropdown.module.css'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  options: DropdownOption[]
  placeholder: string
  onChange: (value: string) => void
  className?: string
}

function Dropdown({
  value,
  options,
  placeholder,
  onChange,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectedOption = options.find((option) => option.value === value)
  const selectedLabel = selectedOption?.label ?? placeholder
  const isEmpty = !selectedOption

  const dropdownClassName = className
    ? `${styles.dropdown} ${className}`
    : styles.dropdown

  const handleOptionClick = (nextValue: string) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      // 드롭다운 바깥 클릭 시 목록 닫기
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape 키 입력 시 목록 닫기
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={dropdownRef}
      className={dropdownClassName}
      data-empty={isEmpty}
      data-open={isOpen}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
      >
        <span className={styles.selectedLabel}>{selectedLabel}</span>
        <img src={arrowIcon} alt="" className={styles.arrowIcon} />
      </button>

      {isOpen && (
        <ul id={listboxId} className={styles.optionList} role="listbox">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={styles.optionButton}
              onClick={() => handleOptionClick('')}
            >
              {placeholder}
            </button>
          </li>

          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={styles.optionButton}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
