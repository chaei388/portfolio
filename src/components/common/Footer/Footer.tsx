import styles from './Footer.module.css'

function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={`container ${styles.inner}`}>
          <p>Copyright &copy; 2026 Chaei. All rights reserved.</p>
          <p>Built with React, TypeScript, and CSS Modules.</p>
        </div>
      </footer>
    </>
  )
}

export default Footer
