// components/Auth/AuthTabs.tsx
import React from 'react';
import styles from './AuthPage.module.css';

const AuthTabs: React.FC = () => {
  return (
    <nav className={styles.tabs} role="tablist">
      <a className={`${styles.tabLink} ${styles.active}`} href="#" role="tab" aria-selected="true">Register</a>
      <a className={styles.tabLink} href="#" role="tab" aria-selected="false">Sign in</a>
      <a className={styles.moreTab} href="#" role="tab" tabIndex={-1}>
        <div className={styles.dropdown}>
          <button className={styles.dropdownToggle} type="button">More...</button>
        </div>
      </a>
    </nav>
  );
};

export default AuthTabs;
