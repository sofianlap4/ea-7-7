import React from 'react';
import styles from './Footer.module.css';
import logo from '../../images/logo-ea-dark-300-150.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <img src={logo} alt="Logo" className={styles.logo} />

        <Link to="/contact" className={styles.contact}>Contact</Link>

        <div className={styles.socialLinks}>
          {/* YouTube */}
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48" fill="currentColor">
              <path d="M43.6 14.2s-.4-3-1.7-4.3c-1.6-1.8-3.4-1.8-4.2-1.9C32.6 7.5 24 7.5 24 7.5h-.1s-8.6 0-13.6.5c-.8.1-2.6.1-4.2 1.9C4.8 11.3 4.4 14.2 4.4 14.2S4 17.5 4 20.9v2.2c0 3.4.4 6.7.4 6.7s.4 3 1.7 4.3c1.6 1.8 3.7 1.8 4.6 1.9 3.3.3 13.3.5 13.3.5s8.6 0 13.6-.5c.8-.1 2.6-.1 4.2-1.9 1.3-1.3 1.7-4.3 1.7-4.3s.4-3.4.4-6.7v-2.2c0-3.4-.4-6.7-.4-6.7zM19.2 29.6V17.3l11.5 6.1-11.5 6.2z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.5.6.6.3 1.1.7 1.6 1.2.5.5.9 1 1.2 1.6.3.5.5 1.3.6 2.5.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.6 2.5-.3.6-.7 1.1-1.2 1.6-.5.5-1 .9-1.6 1.2-.5.3-1.3.5-2.5.6-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.5-.6-.6-.3-1.1-.7-1.6-1.2-.5-.5-.9-1-1.2-1.6-.3-.5-.5-1.3-.6-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .6-2.5.3-.6.7-1.1 1.2-1.6.5-.5 1-.9 1.6-1.2.5-.3 1.3-.5 2.5-.6C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1 .1-1.6.2-2 .4-.5.2-.9.5-1.3.9-.4.4-.7.8-.9 1.3-.2.4-.3 1-.4 2-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 2 .2.5.5.9.9 1.3.4.4.8.7 1.3.9.4.2 1 .3 2 .4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 2-.4.5-.2.9-.5 1.3-.9.4-.4.7-.8.9-1.3.2-.4.3-1 .4-2 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-2-.2-.5-.5-.9-.9-1.3-.4-.4-.8-.7-1.3-.9-.4-.2-1-.3-2-.4-1.3-.1-1.7-.1-4.8-.1zm0 3.2a5.6 5.6 0 110 11.2 5.6 5.6 0 010-11.2zm0 1.8a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm6.5-.7a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z" />
            </svg>
          </a>

          {/* TikTok */}
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.64 2h3.33c.14 1.1.63 2.12 1.41 2.9.78.79 1.8 1.28 2.9 1.41v3.33c-1.04-.06-2.05-.33-2.96-.8v6.86c0 4.08-3.31 7.39-7.39 7.39A7.39 7.39 0 013 15.7a7.4 7.4 0 017.39-7.39v3.34a4.06 4.06 0 00-4.05 4.05 4.06 4.06 0 004.05 4.05 4.06 4.06 0 004.05-4.05V2z" />
            </svg>
          </a>

          {/* Facebook */}
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 10-11.6 9.87v-6.99H8v-2.88h2.4v-2.2c0-2.4 1.43-3.73 3.63-3.73 1.05 0 2.14.19 2.14.19v2.36h-1.2c-1.18 0-1.55.73-1.55 1.47v1.91H16l-.32 2.88h-2.13v6.99A10 10 0 0022 12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
