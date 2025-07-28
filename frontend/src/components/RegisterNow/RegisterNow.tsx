import styles from "./RegisterNow.module.css";

const RegisterNow = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Register for a free account</h2>
        <p className={styles.description}>Sign up now.</p>
        <div className={styles.buttonWrapper}>
          <a
            href="https://authn.edx.org/register"
            className={styles.ctaButton}
            aria-label="Get started"
            target="_self"
          >
            <span className={styles.ctaText}>Get started</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default RegisterNow;
