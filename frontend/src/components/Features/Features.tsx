import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Features.css';

const featuresData = [
  {
    title: 'Formation pratique',
    description:
      "Perfectionnez vos compétences de manière efficace grâce à des exercices de codage, des exercices pratiques et des quiz alimentés par l'IA.",
    image:
      'https://cms-images.udemycdn.com/96883mtakkm8/4kbyXne3Slx9Sfz4nTBqdf/dcee8645ac7a78bbebc8e2ef1d3993f2/French.png',
  },
  {
    title: 'Préparation aux certifications',
    description:
      'Préparez-vous à obtenir des certifications reconnues par le secteur en relevant des défis concrets et décrochez des badges au passage.',
    image:
      'https://cms-images.udemycdn.com/96883mtakkm8/GUVYFTj0uwEQuJha5j7TZ/6993e5e5d59d1cf7ebad512f1b91275f/French.png',
  },
  {
    title: 'Informations et analyses',
    description:
      'Atteignez rapidement vos objectifs grâce à des informations avancées et à une équipe dédiée à la réussite des clients.',
    image:
      'https://cms-images.udemycdn.com/96883mtakkm8/6q4N9BvIQusFoheoALJhGj/e1e44d506d3b6b6d38cfd6893b131603/French.png',
  },
  {
    title: 'Contenu personnalisable',
    description:
      "Créez des parcours d'apprentissage personnalisés selon les objectifs de votre organisation, et hébergez votre propre contenu.",
    image:
      'https://cms-images.udemycdn.com/96883mtakkm8/385IhnON960Wvz50ooWIN3/db60552ea0c7bfb9c41b57fefb39af04/French.png',
  },
];

const Features = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-heading">Un apprentissage axé sur vos objectifs</h2>

        {isMobile ? (
          <Swiper pagination={{ clickable: true }} modules={[Pagination]} spaceBetween={20}>
            {featuresData.map((feature, index) => (
              <SwiperSlide key={index}>
                <div className="feature-card">
                  <img src={feature.image} alt={feature.title} className="feature-img" />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="features-grid">
            <div className="features-tabs">
              {featuresData.map((feature, index) => (
                <div
                  key={index}
                  className={`features-tab ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="features-image">
              <img src={featuresData[activeIndex].image} alt={featuresData[activeIndex].title} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
