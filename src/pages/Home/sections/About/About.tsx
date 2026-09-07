import { aboutData } from '../../../../data/about'
import emailIcon from '../../../../assets/icons/email.svg'
import githubIcon from '../../../../assets/icons/github.svg'
import styles from './About.module.css'

const profileLinks = [
  {
    id: 'github',
    label: 'GitHub',
    href: aboutData.links.github,
    text: aboutData.links.github.replace('https://', ''),
    icon: githubIcon,
  },
  {
    id: 'email',
    label: 'Email',
    href: aboutData.links.email,
    text: aboutData.links.email.replace('mailto:', ''),
    icon: emailIcon,
  },
]

// 한 줄 소개에서 드래그 효과로 강조할 문구
const taglineHighlightText = '서비스의 흐름을 이해하는 개발자'
const taglineBaseText = aboutData.tagline
  .replace(taglineHighlightText, '')
  .trim()

function About() {
  return (
    <>
      <section id="about" className={styles.about} aria-labelledby="about-title">
        <div className={`container ${styles.inner}`}>
          {/* 왼쪽 영역: About Me */}
          <div className={styles.profile}>
            <p className={styles.eyebrow}>About Me</p>

            {/* 이름, 한 줄 소개, 자기소개 */}
            <h1 id="about-title" className={styles.name}>
              {aboutData.name}
            </h1>
            <p className={styles.tagline}>
              <span>{taglineBaseText}</span>
              <span className={styles.taglineHighlight}>
                {taglineHighlightText}
              </span>
            </p>
            <p className={styles.description}>{aboutData.description}</p>

            {/* Contact (깃허브, 이메일) */}
            <nav className={styles.linkList} aria-label="프로필 링크">
              {profileLinks.map((link) => {
                const isExternalLink = !link.href.startsWith('mailto:')

                return (
                  <a
                    key={link.id}
                    href={link.href}
                    className={styles.profileLink}
                    target={isExternalLink ? '_blank' : undefined}
                    rel={isExternalLink ? 'noreferrer' : undefined}
                  >
                    <img src={link.icon} alt="" className={styles.linkIcon} />
                    <span>
                      <strong className={styles.linkLabel}>{link.label}</strong>
                      <span className={styles.linkText}>{link.text}</span>
                    </span>
                  </a>
                )
              })}
            </nav>
          </div>

          {/* 오른쪽 영역: Education */}
          <div className={styles.education} aria-labelledby="education-title">
            <h2 id="education-title" className={styles.educationTitle}>
              Education
            </h2>

            {/* 학력 리스트 */}
            <ul className={styles.educationList}>
              {aboutData.education.map((item) => (
                <li key={item.id} className={styles.educationItem}>
                  <strong className={styles.school}>{item.school}</strong>
                  <p className={styles.major}>
                    {item.major} · {item.status}
                  </p>
                  <p className={styles.period}>{item.period}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
