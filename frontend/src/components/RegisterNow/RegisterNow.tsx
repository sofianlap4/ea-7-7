import React from "react";
import styles from "./RegisterNow.module.css";

const RegisterNow = () => {
    return (
        <section>
            <div className={styles.container}>
                <div className={styles.blockLayout}>
                    <div className={styles.imageWrapper}>
                        <div className={styles.gridItem}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/53405f7f3dd342ada40d32c06bbe54ab.png?auto=format%2Ccompress&dpr=1"
                                    srcSet="
                                        https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/53405f7f3dd342ada40d32c06bbe54ab.png?auto=format%2Ccompress&dpr=2 2x,
                                        https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/53405f7f3dd342ada40d32c06bbe54ab.png?auto=format%2Ccompress&dpr=3 3x
                                    "
                                    width="285"
                                    alt="Coursera Plus"
                                />
                                <div className={styles.textSection}>
                                    <div className={styles.titleWrapper}>
                                        <span className={styles.titleText}>
                                            Atteignez vos objectifs de carrière avec Coursera Plus
                                        </span>
                                    </div>
                                    <div className={styles.buttonAndPrice}>
                                        <div className={styles.buttonWrapper}>
                                            <button
                                                className={styles.trialButton}
                                                type="button"
                                                data-e2e="coursera-plus-enroll-button"
                                                data-track="true"
                                                data-track-app="premium_hub"
                                                data-track-page="coursera_plus_landing_page"
                                                data-track-action="click"
                                                data-track-component="footer_monthly"
                                                aria-disabled="false"
                                            >
                                                <span className={styles.buttonLabel}>
                                                    Commencer un essai gratuit de 7&nbsp;jours
                                                </span>
                                            </button>
                                        </div>
                                        <div className={styles.priceWrapper}>
                                            <span className={styles.priceText}>
                                                <b>59&nbsp;$US/mois, annulez à tout moment</b>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegisterNow;
