import styles from './Banner.module.css';
import p1 from '../../images/p1.png';

const Banner = () => {
    return (
        <section className={styles.bannerContainerMain}>
            <div className={styles.bannerWrapper}>
                <img
                    alt=""
                    className={`${styles.firstImg} ${styles.mobileBanner}`}
                    src="https://images.cdn.edx.org/attachment-18421Mobile-dark.jpg"
                />
                <img
                    alt=""
                    className={`${styles.firstImg} ${styles.tabletBanner}`}
                    src="https://images.cdn.edx.org/attachment-18424Tablet-Dark.jpg"
                />
                <img
                    alt=""
                    className={`${styles.firstImg} ${styles.desktopBanner}`}
                    src="https://images.cdn.edx.org/attachment-18420Desk-Dark.jpg"
                />

                <div className={styles.bannerContainer}>
                    <div className={styles.contentWrapper}>
                        <div className={styles.textContent}>
                            <h1 className={styles.title}>
                                Learn to Code. Practice. Compete. Succeed.
                            </h1>
                            <p className={styles.description}>
                                Video courses{' '}
                                <span className={styles.highlight}>real-time code practice</span>, and challenges
                            </p>
                            <div className={styles.actions}>
                                <a
                                    href="https://www.edx.org/level-up-promo"
                                    className={`${styles.btn} ${styles.primary}`}
                                    target="_self"
                                    rel="noopener noreferrer"
                                >
                                    How it works
                                </a>
                                <a
                                    href="https://www.edx.org/search?learning_type=Course&learning_type=MicroBachelors&learning_type=MicroMasters&learning_type=Professional+Certificate&learning_type=XSeries"
                                    className={`${styles.btn} ${styles.secondary}`}
                                    target="_self"
                                    rel="noopener noreferrer"
                                >
                                    Start Learning
                                </a>
                            </div>
                        </div>
                        <div className={styles.cards}>
                            <a href="#" className={styles.courseCard}>
                                <div className={styles.card}>
                                    <div className={styles.cardImgContainer}>
                                        <img className={styles.courseImg} src={p1} alt="Course thumbnail" />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h2>Exercising Leadership: Foundational Principles</h2>
                                        <div className={styles.cardBodyP}>
                                            <p className={styles.institution}>HarvardX</p>
                                        </div>
                                    </div>
                                    <div className={styles.badgeContainer}>
                                        <span className={styles.badgeText}>Course</span>
                                    </div>
                                </div>
                            </a>

                            <a href="#" className={styles.courseCard}>
                                <div className={styles.card}>
                                    <div className={styles.cardImgContainer}>
                                        <img className={styles.courseImg} src={p1} alt="Course thumbnail" />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h2>Introduction to Generative AI</h2>
                                        <div className={styles.cardBodyP}>
                                            <p className={styles.institution}>IBM</p>
                                        </div>
                                    </div>
                                    <div className={styles.badgeContainer}>
                                        <span className={styles.badgeText}>Course</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
