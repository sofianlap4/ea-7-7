import React from "react";
import styles from "./RegisterNow.module.css";

const RegisterNow = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <img
          src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/53405f7f3dd342ada40d32c06bbe54ab.png?auto=format%2Ccompress&dpr=1"
          alt="Coursera Plus"
          className={styles.logo}
        />
        <p className={styles.subheading}>
          Atteignez vos objectifs de carrière avec Coursera Plus
        </p>
        <button className={styles.button}>
          Commencer un essai gratuit de 7&nbsp;jours
        </button>
        <p className={styles.price}>
          <strong>59&nbsp;$US/mois, annulez à tout moment</strong>
        </p>
      </div>
    </section>
  );
};

export default RegisterNow;
