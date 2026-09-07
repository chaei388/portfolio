import { skillGroups, skills } from '../../../../data/skills'
import styles from './Skills.module.css'

function Skills() {
  return (
    <>
      <section id="skills">
        <div className="container">
          <h2 className={styles.title}>Skills</h2>

          <div className={styles.groupList}>
            {/* 카테고리별 기술 스택 묶음 */}
            {skillGroups.map((group) => {
              // 현재 카테고리에 속한 기술 스택만 필터링
              const groupSkills = skills.filter(
                (skill) => skill.category === group.title,
              )

              return (
                <article key={group.id} className={styles.group}>

                  {/* 스킬 카테고리명 */}
                  <h3 className={styles.groupTitle}>{group.title}</h3>

                  <ul className={styles.skillList}>
                    {groupSkills.map((skill) => (
                      <li key={skill.id} className={styles.skillItem}>
                        {/* 스킬 아이콘 이미지 */}
                        <img
                          src={skill.icon}
                          alt=""
                          className={styles.skillIcon}
                        />

                        {/* 스킬 이름 */}
                        <span className={styles.skillName}>{skill.name}</span>
                      </li>
                    ))}
                  </ul>
                  
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default Skills
