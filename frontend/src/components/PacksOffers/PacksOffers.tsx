import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./PacksOffers.module.css";

const offers = [
  {
    title: "Apprentissage unitaire",
    subtitle: "Obtenir une qualification sur un sujet ou une compétence",
    price: "49 $US – 79 $US / Mois",
    note:
      "Rendez-vous sur une page d'un cours ou d'une Spécialisation pour acheter.",
    features: [
      "Accéder à tous les cours du programme d'apprentissage",
      "Obtenez un certificat à l’issue de votre période d’essai",
    ],
  },
  {
    title: "Coursera Plus Mensuel",
    subtitle: "Suivre plusieurs cours et obtenir rapidement des qualifications",
    price: "59 $US / Mois",
    note: "Annulez à tout instant",
    button: "Commencer un essai gratuit de 7 jours",
    features: [
      "Accédez à 10,000+ cours et Spécialisations de plus de 170 entreprises et universités de premier plan",
    ],
  },
  {
    title: "Coursera Plus Annuel",
    subtitle:
      "Associer flexibilité et économies avec des objectifs d'apprentissage à long terme",
    price: "399 $US / Année",
    note: "Garantie de remboursement de 14 jours",
    button: "Essayer Coursera Plus Annuel",
    features: [
      "Économisez en payant à l'avance pour l'année",
      "Tout ce qui est inclus dans le plan mensuel",
    ],
  },
    {
    title: "Coursera Plus Annuel",
    subtitle:
      "Associer flexibilité et économies avec des objectifs d'apprentissage à long terme",
    price: "399 $US / Année",
    note: "Garantie de remboursement de 14 jours",
    button: "Essayer Coursera Plus Annuel",
    features: [
      "Économisez en payant à l'avance pour l'année",
      "Tout ce qui est inclus dans le plan mensuel",
    ],
  },
];

const PacksOffers = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Formules pour vous ou votre équipe</h2>

      {/* Desktop layout */}
      <div className={styles.desktopGrid}>
        {offers.map((offer, idx) => (
          <div className={styles.card} key={idx}>
            <div className={styles.topCard}>
              <h3 className={styles.title}>{offer.title}</h3>
              <p className={styles.subtitle}>{offer.subtitle}</p>
            </div>
            <div className={styles.midCard}>
              <p className={styles.price}>{offer.price}</p>
              {offer.note && <p className={styles.note}>{offer.note}</p>}
              {offer.button && (
                <button className={styles.ctaButton}>{offer.button}</button>
              )}
            </div>
            <ul className={styles.features}>
              {offer.features.map((feature, i) => (
                <li key={i}>
                  <span className={styles.bullet}></span>
                  <p>{feature}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mobile layout with Swiper */}
      <div className={styles.mobileSwiper}>
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1.1}
        >
          {offers.map((offer, idx) => (
            <SwiperSlide key={idx}>
              <div className={styles.card}>
                <div className={styles.topCard}>
                  <h3 className={styles.title}>{offer.title}</h3>
                  <p className={styles.subtitle}>{offer.subtitle}</p>
                </div>
                <div className={styles.midCard}>
                  <p className={styles.price}>{offer.price}</p>
                  {offer.note && <p className={styles.note}>{offer.note}</p>}
                  {offer.button && (
                    <button className={styles.ctaButton}>{offer.button}</button>
                  )}
                </div>
                <ul className={styles.features}>
                  {offer.features.map((feature, i) => (
                    <li key={i}>
                      <span className={styles.bullet}></span>
                      <p>{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PacksOffers;
