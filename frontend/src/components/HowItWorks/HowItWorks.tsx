import howworks from "../../images/how-it-works.png";
import styles from "./HowItWorks.module.css";

const HowItWorks = () => {
  return (
    <section className={styles.section}>
      <div className={styles.imageWrapper}>
        <img src={howworks} alt="Comment ça marche" className={styles.image} />
      </div>
    </section>
  );
};

export default HowItWorks;
