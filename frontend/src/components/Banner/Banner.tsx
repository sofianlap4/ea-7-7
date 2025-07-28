import './Banner.css';
import p1 from '../../images/p1.png';

const Banner = () => {
    return (
        <section className="banner-container-main">
            <div className="banner-wrapper">
                <img
                    alt=""
                    className="first-img mobile-banner"
                    src="https://images.cdn.edx.org/attachment-18421Mobile-dark.jpg"
                />
                <img
                    alt=""
                    className="first-img tablet-banner"
                    src="https://images.cdn.edx.org/attachment-18424Tablet-Dark.jpg"
                />
                <img
                    alt=""
                    className="first-img desktop-banner"
                    src="https://images.cdn.edx.org/attachment-18420Desk-Dark.jpg"
                />

                <div className="banner-container">
                    <div className="content-wrapper">
                        <div className="text-content">
                            <h1 className="title">Learn to Code. Practice. Compete. Succeed.</h1>
                            <p className="description">
                                Video courses {' '}
                                <span className="highlight">real-time code practice </span>, and challenges
                            </p>
                            <div className="actions">
                                <a
                                    href="https://www.edx.org/level-up-promo"
                                    className="btn primary"
                                    target="_self"
                                    rel="noopener noreferrer"
                                >
                                    How it works
                                </a>
                                <a
                                    href="https://www.edx.org/search?learning_type=Course&learning_type=MicroBachelors&learning_type=MicroMasters&learning_type=Professional+Certificate&learning_type=XSeries"
                                    className="btn secondary"
                                    target="_self"
                                    rel="noopener noreferrer"
                                >
                                    Start Learning
                                </a>
                            </div>
                        </div>
                        <div className="cards">
                            <a href="#" className="course-card">
                                <div className="card">
                                    <div className="card_img_container">
                                        <img className="course-img" src={p1} alt="Course thumbnail" />
                                    </div>
                                    <div className="card-body">
                                        <h2>Exercising Leadership: Foundational Principles</h2>
                                        <div className="card_body_p">
                                            <p className="institution">HarvardX</p>
                                        </div>
                                    </div>
                                    <div className="badge-container">
                                        <span className="badge-text">Course</span>
                                    </div>
                                </div>
                            </a>

                            <a href="#" className="course-card">
                                <div className="card">
                                    <div className="card_img_container">
                                        <img className="course-img" src={p1} alt="Course thumbnail" />
                                    </div>
                                    <div className="card-body">
                                        <h2>Introduction to Generative AI</h2>
                                        <div className="card_body_p">
                                            <p className="institution">IBM</p>
                                        </div>
                                    </div>
                                    <div className="badge-container">
                                        <span className="badge-text">Course</span>
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
