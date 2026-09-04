import styles from './Footer.module.css'

function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={`container ${styles.inner}`}>
          <p>Copyright &copy; 2026 Chaei.</p>
          <p>All rights reserved. Built with React, TypeScript, and CSS Modules.</p>
        </div>
      </footer>
    </>
  )
}

export default Footer
