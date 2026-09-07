import { useEffect, useState } from 'react'
import { aboutData } from '../../../data/about'
import emailIcon from '../../../assets/icons/email.svg'
import githubIcon from '../../../assets/icons/github.svg'
import styles from './ContactButton.module.css'

type ContactLinkId = 'github' | 'email' // ContactLinkId 타입 정의
type HoveredLinkId = ContactLinkId | null
type SelectedLinkId = ContactLinkId | null

const contactLinks: {
  id: ContactLinkId
  label: string
  href: string
  icon: string
}[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: aboutData.links.github,
    icon: githubIcon,
  },
  {
    id: 'email',
    label: 'Email',
    href: aboutData.links.email,
    icon: emailIcon,
  },
]

function ContactButton() {
  const [hoveredLinkId, setHoveredLinkId] = useState<HoveredLinkId>(null)
  const [selectedLinkId, setSelectedLinkId] = useState<SelectedLinkId>(null)
  const [isHidden, setIsHidden] = useState(false)
  const activeLinkId = hoveredLinkId ?? selectedLinkId

  useEffect(() => {
    // Contact 섹션이 화면에 10% 이상 보이면 하단 ContactButton 숨김
    const contactSection = document.getElementById('contact')

    if (!contactSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHidden(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(contactSection)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav
        className={`${styles.contactButton} ${isHidden ? styles.hidden : ''}`}
        data-active={activeLinkId ?? 'none'}
        aria-label="빠른 연락 링크"
        onMouseLeave={() => setHoveredLinkId(null)}
      >
        {/*활성화된 링크 뒤에 나타나는 선택 표시 배경 */}
        <span className={styles.activeBackground} aria-hidden="true" />

        {contactLinks.map((link) => {
          const isExternalLink = !link.href.startsWith('mailto:')
          const isActive = activeLinkId === link.id

          return (
            <a
              key={link.id}
              href={link.href}
              className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noreferrer' : undefined}
              tabIndex={isHidden ? -1 : undefined}
              onMouseEnter={() => setHoveredLinkId(link.id)} // 마우스 올리면 현재 링크 id 저장
              onFocus={() => setHoveredLinkId(link.id)} // 키보드 Tab으로 포커스했을 때도 hover와 동일하게 처리
              onBlur={() => setHoveredLinkId(null)} // 포커스를 잃으면 hover/focus 상태 해제
              onClick={() => setSelectedLinkId(link.id)} // 클릭한 링크를 selected 상태로 저장
            >
              <img src={link.icon} alt="" className={styles.icon} />
              <span>{link.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}

export default ContactButton
