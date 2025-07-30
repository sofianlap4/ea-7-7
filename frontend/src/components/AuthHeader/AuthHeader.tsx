// components/Auth/AuthHeader.tsx
import React from 'react';
import styles from './AuthPage.module.css';

const AuthHeader: React.FC = () => {
  return (
    <span className={styles.headerWrapper}>
      <div className={styles.topStripe}></div>
      <div>
        <a
          className={styles.logoLink}
          href="https://www.edx.org"
          target="_self"
        >
          <img
            alt="edX"
            src="https://edx-cdn.org/v3/prod/logo-white.svg"
            className={styles.logoSmall}
          />
        </a>
        <div className={styles.headerTextWrapper}>
          <div className={styles.yellowLine}></div>
          <h1 className={styles.headerText}>
            Start learning <span className={styles.highlight}>with edX</span>
          </h1>
        </div>
      </div>
    </span>
  );
};

export default AuthHeader;
