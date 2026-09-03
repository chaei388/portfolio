import { aboutData } from '../../../../data/about'

function About() {
  return (
    <>
      <section id="about" aria-labelledby="about-title">
        <div className="container">
          <p>About Me</p>

          {/* 이름, 한 줄 소개, 자기소개 */}
          <h1 id="about-title">{aboutData.name}</h1>
          <p>{aboutData.tagline}</p>
          <p>{aboutData.description}</p>

          {/* Contact (깃허브, 이메일) */}
          <nav aria-label="프로필 링크">
            <a href={aboutData.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={aboutData.links.email}>Email</a>
          </nav>

          <section aria-labelledby="education-title">
            <h2 id="education-title">Education</h2>

            {/* 학력 리스트 */}
            <ul>
              {aboutData.education.map((item) => (
                <li key={item.id}>
                  <p>{item.period}</p>
                  <strong>{item.school}</strong>
                  <p>
                    {item.major} · {item.status}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  )
}

export default About
