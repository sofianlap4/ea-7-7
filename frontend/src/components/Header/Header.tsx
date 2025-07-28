import styles from './Header.module.css';
import logo from "../../images/logo-ea-white-300-150.png";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoContainer}>
          <a href="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </a>
        </div>
        <div className={styles.actions}>
          <a href="/login" className={styles.signinButton}>Sign In</a>
          <a href="/register" className={styles.registerButton}>Register for free</a>
        </div>
      </div>

      {/* 
      <div className={styles.promoBanner}>
        <p>
          <strong>Level up your career — Get 15% off</strong> select programs until July 30. 
          Use the code <strong>LEVELUPEDX25</strong>. 
          <a href="https://www.edx.org/level-up-promo">Learn more</a>.
        </p>
        <button className={styles.closeBanner} aria-label="Close site banner">&times;</button>
      </div> 
      */}
    </header>
  );
};

export default Header;
