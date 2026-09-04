import { projects } from '../../../../data/projects'
import ProjectCard from './ProjectCard'
import styles from './Projects.module.css'

function Projects() {
  return (
    <>
      <section id="projects">
        <div className="container">
          <h2 className={styles.title}>Projects</h2>

          <div className={styles.projectList}>
            {/* 프로젝트 카드 목록 */}
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Projects
