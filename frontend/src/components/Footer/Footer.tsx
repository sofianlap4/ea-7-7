import React from 'react';
import styles from './Footer.module.css';
import logo from '../../images/logo-ea-dark-300-150.png'; // Your logo path

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <img src={logo} alt="Logo" className={styles.logo} />

        <div className={styles.socialLinks}>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 15l5.2-3-5.2-3v6zm12-3c0-1.5-.2-3-.6-4.3-.4-1.2-1.4-2.2-2.6-2.6C17.9 4.2 12 4.2 12 4.2s-5.9 0-7.8.9C2.9 5.5 1.9 6.5 1.5 7.7 1.1 9 1 10.5 1 12s.1 3 .5 4.3c.4 1.2 1.4 2.2 2.6 2.6 1.9.9 7.8.9 7.8.9s5.9 0 7.8-.9c1.2-.4 2.2-1.4 2.6-2.6.4-1.3.5-2.8.5-4.3z" />
            </svg>
          </a>

          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.5.6.6.3 1.1.7 1.6 1.2.5.5.9 1 1.2 1.6.3.5.5 1.3.6 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.6 2.5-.3.6-.7 1.1-1.2 1.6-.5.5-1 .9-1.6 1.2-.5.3-1.3.5-2.5.6-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.5-.6-.6-.3-1.1-.7-1.6-1.2-.5-.5-.9-1-1.2-1.6-.3-.5-.5-1.3-.6-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .6-2.5.3-.6.7-1.1 1.2-1.6.5-.5 1-.9 1.6-1.2.5-.3 1.3-.5 2.5-.6C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1 .1-1.6.2-2 .4-.5.2-.9.5-1.3.9-.4.4-.7.8-.9 1.3-.2.4-.3 1-.4 2-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 2 .2.5.5.9.9 1.3.4.4.8.7 1.3.9.4.2 1 .3 2 .4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 2-.4.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.4.3-1 .4-2 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-2-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.4-.2-1-.3-2-.4-1.3-.1-1.7-.1-4.8-.1zm0 3.2a5.6 5.6 0 110 11.2 5.6 5.6 0 010-11.2zm0 1.8a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm6.5-.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z" />
            </svg>
          </a>

          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.64 2h3.33c.14 1.1.63 2.12 1.41 2.9.78.79 1.8 1.28 2.9 1.41v3.33c-1.04-.06-2.05-.33-2.96-.8v6.86c0 4.08-3.31 7.39-7.39 7.39A7.39 7.39 0 013 15.7a7.4 7.4 0 017.39-7.39v3.34a4.06 4.06 0 00-4.05 4.05 4.06 4.06 0 004.05 4.05 4.06 4.06 0 004.05-4.05V2z" />
            </svg>
          </a>

          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.6 9.87v-6.99H8v-2.88h2.4v-2.2c0-2.4 1.43-3.73 3.63-3.73 1.05 0 2.14.19 2.14.19v2.36h-1.2c-1.18 0-1.55.73-1.55 1.47v1.91H16l-.32 2.88h-2.13v6.99A10 10 0 0022 12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
