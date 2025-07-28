import React from 'react';
import './Features.css';

const Features: React.FC = () => {
  return (
    <section className="features-section">
      <div className="viewport-container">
        <div className="container-with-padding">
          <div className='container_with_content'>
            <h2 id="values-props-and-features-title" className="heading-xl">
              Un apprentissage axé sur vos objectifs
            </h2>
            <div className="features-content">
              <div
                role="tablist"
                aria-labelledby="values-props-and-features-title"
                aria-orientation="vertical"
                className="features-tablist"
              >
                <div
                  id="hands_on_feature"
                  tabIndex={0}
                  role="tab"
                  aria-selected="true"
                  className="features-tab selected"
                >
                  <img
                    alt=""
                    src="https://cms-images.udemycdn.com/96883mtakkm8/7kN9RBFSMFNHzsGWsElMPi/dde73f8d1c47e046f035274e78410590/hands-on-practice.png"
                    className="features-icon"
                    height="64"
                    width="64"
                    loading="lazy"
                  />
                  <div className="features-tab-content">
                    <div>
                    <div className="features-title">Formation pratique</div>
                    <span className="features-description">
                      <p>
                        Perfectionnez vos compétences de manière efficace grâce à des exercices de codage, des exercices pratiques et des quiz alimentés par l'IA.
                      </p>
                    </span>

                    </div>
                  </div>
                </div>
                <div
                  id="certification_prep_feature"
                  tabIndex={0}
                  role="tab"
                  aria-selected="false"
                  className="features-tab"
                >
                  <img
                    alt=""
                    src="https://cms-images.udemycdn.com/96883mtakkm8/2Xh9YHJustDwCEjn5IlO25/93e9b15c6e74876db0dec63466fcc5a0/certificate.png"
                    className="features-icon"
                    height="64"
                    width="64"
                    loading="lazy"
                  />
                  <div className="features-tab-content">
                    <p className="features-title">Préparation aux certifications</p>
                    <span className="features-description">
                      Préparez-vous à obtenir des certifications reconnues par le secteur en relevant des défis concrets et décrochez des badges au passage.
                    </span>
                    <a
                      href="https://www.udemy.com/browse/certification/"
                      target="_blank"
                      className="btn btn-large btn-ghost"
                      rel="noopener noreferrer"
                    >
                      Explore courses
                    </a>
                  </div>
                </div>
                <div
                  id="insights_analytics_feature"
                  tabIndex={0}
                  role="tab"
                  aria-selected="false"
                  className="features-tab"
                >
                  <img
                    alt=""
                    src="https://cms-images.udemycdn.com/96883mtakkm8/6w8plrr7vY9rIY46UuX0q5/2f0a3f0c22e99bd2d430b998c81321f2/empty-state-1.png"
                    className="features-icon"
                    height="64"
                    width="64"
                    loading="lazy"
                  />
                  <div className="features-tab-content">
                    <p className="features-title">Informations et analyses</p>
                    <span className="features-description">
                      Atteignez rapidement vos objectifs grâce à des informations avancées et à une équipe dédiée à la réussite des clients qui vous aidera à mettre en place un apprentissage efficace.
                    </span>
                    <a
                      href="https://business.udemy.com/fr/analytics/?utm_type=mx&user_type=visitor"
                      target="_blank"
                      className="btn btn-large btn-ghost"
                      rel="noopener noreferrer"
                    >
                      En savoir plus
                    </a>
                  </div>
                </div>
                <div
                  id="customizable_content_feature"
                  tabIndex={0}
                  role="tab"
                  aria-selected="false"
                  className="features-tab"
                >
                  <img
                    alt=""
                    src="https://cms-images.udemycdn.com/96883mtakkm8/2tKGBrb1N60wox2Lh8j3tz/7f1528c9f88ea47bd6ebb46f345902c3/organizations-2.png"
                    className="features-icon"
                    height="64"
                    width="64"
                    loading="lazy"
                  />
                  <div className="features-tab-content">
                    <p className="features-title">Contenu personnalisable</p>
                    <span className="features-description">
                      Créez des parcours d'apprentissage personnalisés en fonction des objectifs de l'équipe et de l'organisation, et hébergez même votre propre contenu ainsi que vos propres ressources.
                    </span>
                    <a
                      href="https://business.udemy.com/fr/user-management/?utm_type=mx&user_type=visitor"
                      target="_blank"
                      className="btn btn-large btn-ghost"
                      rel="noopener noreferrer"
                    >
                      En savoir plus
                    </a>
                  </div>
                </div>
              </div>
              <div className="features-panels" aria-live="polite">
                <div className='feature_card_panel' id="vpf-0" role="tabpanel" tabIndex={0} aria-labelledby="tab-0">
                  <picture>
                    <img
                      alt="Results page for Containerization assessment: User scored 159 (Superior, 88th percentile)."
                      src="https://cms-images.udemycdn.com/96883mtakkm8/4kbyXne3Slx9Sfz4nTBqdf/dcee8645ac7a78bbebc8e2ef1d3993f2/French.png"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <div className='feature_card_panel' id="vpf-1" role="tabpanel" tabIndex={1} aria-labelledby="tab-1" hidden>
                  <picture>
                    <img
                      alt="Certification preparation page displaying various AWS certification badges with search functionality."
                      src="https://cms-images.udemycdn.com/96883mtakkm8/GUVYFTj0uwEQuJha5j7TZ/6993e5e5d59d1cf7ebad512f1b91275f/French.png"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <div className='feature_card_panel' id="vpf-2" role="tabpanel" tabIndex={2} aria-labelledby="tab-2" hidden>
                  <picture>
                    <img
                      alt="Benchmarking report comparing top 10 business and tech skills in your organization vs. industry."
                      src="https://cms-images.udemycdn.com/96883mtakkm8/6q4N9BvIQusFoheoALJhGj/e1e44d506d3b6b6d38cfd6893b131603/French.png"
                      loading="lazy"
                    />
                  </picture>
                </div>
                <div className='feature_card_panel' id="vpf-3" role="tabpanel" tabIndex={3} aria-labelledby="tab-3" hidden>
                  <picture>
                    <img
                      alt="Learning path for Business Communication, listing topics like Effective Writing and Cultural Differences."
                      src="https://cms-images.udemycdn.com/96883mtakkm8/385IhnON960Wvz50ooWIN3/db60552ea0c7bfb9c41b57fefb39af04/French.png"
                      loading="lazy"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;