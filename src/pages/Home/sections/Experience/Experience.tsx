import { experiences } from '../../../../data/experience'
import styles from './Experience.module.css'

function Experience() {
  return (
    <>
      <section id="experience">
        <div className="container">
          <h2 className={styles.title}>Experience</h2>

          <ol className={styles.timeline}>
            {experiences.map((experience) => (
              <li key={experience.id} className={styles.item}>
                <p className={styles.period}>{experience.period}</p>

                <div className={styles.content}>
                  <h3 className={styles.itemTitle}>
                    {/* 제목 + 해당 프로젝트 카드 위치로 이동하는 링크 */}
                    {experience.projectId ? (
                      <a
                        href={`#project-${experience.projectId}`}
                        className={styles.projectLink}
                      >
                        {experience.title}
                      </a>
                    ) : (
                      experience.title
                    )}
                  </h3>

                  {/* 기술 태그 */}
                  {experience.stacks && experience.stacks.length > 0 && (
                    <ul className={styles.stackList}>
                      {experience.stacks.map((stack) => (
                        <li key={stack} className={styles.stackItem}>
                          {stack}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 역할 */}
                  {experience.role && (
                    <p className={styles.role}>{experience.role}</p>
                  )}

                  {/* 내용 */}
                  <p className={styles.description}>
                    {experience.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

export default Experience
