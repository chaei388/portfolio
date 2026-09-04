import githubIcon from '../../../../assets/icons/github.svg'
import emailIcon from '../../../../assets/icons/email.svg'
import { aboutData } from '../../../../data/about'
import styles from './Contact.module.css'

const contactLinks = [
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

function Contact() {
  return (
    <>
      <section id="contact" className={styles.contact}>
        <div className={`container ${styles.inner}`}>
          {/* 텍스트 링크 */}
          <div className={styles.textLinks}>
            {contactLinks.map((link) => {
              const isExternalLink = !link.href.startsWith('mailto:')

              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={styles.textLink}
                  target={isExternalLink ? '_blank' : undefined}
                  rel={isExternalLink ? 'noreferrer' : undefined}
                >
                  {link.label}
                </a>
              )
            })}
          </div>

          {/* 아이콘 링크 */}
          <div className={styles.iconLinks}>
            {contactLinks.map((link) => {
              const isExternalLink = !link.href.startsWith('mailto:')

              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={styles.iconLink}
                  target={isExternalLink ? '_blank' : undefined}
                  rel={isExternalLink ? 'noreferrer' : undefined}
                  aria-label={link.label}
                >
                  <img src={link.icon} alt="" className={styles.icon} />
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
