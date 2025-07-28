import styles from './Access.module.css';

const Access = () => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Investissez dans votre carrière</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icon} ></div>
          <h3 className={styles.cardTitle}>Explorer de nouvelles compétences</h3>
          <p className={styles.cardDescription}>
            Accédez à 10,000+ cours sur l'IA, les affaires, la technologie et plus encore.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon} ></div>
          <h3 className={styles.cardTitle}>Obtenir des qualifications utiles</h3>
          <p className={styles.cardDescription}>
            Obtenez des certificats pour chaque cours que vous terminez et augmentez vos chances
            d'être embauché après la fin de votre période d'essai, sans frais supplémentaires.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.icon} ></div>
          <h3 className={styles.cardTitle}>Apprendre des meilleurs</h3>
          <p className={styles.cardDescription}>
            Faites passer vos compétences au niveau supérieur, grâce aux cours dispensés par des
            experts et grâce à Coursera Coach, votre guide reposant sur l’IA.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Access;
