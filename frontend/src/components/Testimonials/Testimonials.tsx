import React from 'react';
import styles from './Testimonials.module.css';
import testimonialIcon from './testimonial-icon.svg'; // Make sure to have this SVG in the same directory

const testimonials = [
  {
    quote: '“This course helped me think about the person I want to be. The mental space that it afforded me allowed me to broaden my horizons and think about opportunities I hadn’t considered before.”',
    name: 'Maggie B.',
    program: 'TUMx Lean Six Sigma Professional Certificate',
  },
  {
    quote: '“One employer was very interested in my boot camp experience and couldn’t believe all I learned in just six months. I ended up getting that job.”',
    name: 'Danielle D.',
    program: 'University of Central Florida Digital Marketing Boot Camp',
  },
  {
    quote: '“The online program helped me refocus my main tasks as a leader: engaging with my team [and] connecting with potential stakeholders.”',
    name: 'Slim C.',
    program: 'Oxford Executive Leadership Programme',
  },
];

const Testimonials = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.subheading}>The reviews are in:</h2>
      <h3 className={styles.heading}>What learners are saying</h3>

      <div className={styles.grid}>
        {testimonials.map((item, index) => (
          <div key={index} className={styles.card}>
            <p className={styles.quote}>{item.quote}</p>
            <div className={styles.user}>
              <img src={testimonialIcon} alt="" className={styles.icon} />
              <div>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.program}>{item.program}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default Testimonials;
