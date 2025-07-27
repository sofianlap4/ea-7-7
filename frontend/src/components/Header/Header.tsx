import './Header.css';
import logo from "../../images/logo-ea-white-300-150.png"

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <a href="/">
            <img src={logo} alt="Logo" className="logo" />
          </a>
        </div>
        <div className="actions">
          <a href="/login" className="signin-button">Sign In</a>
          <a href="/register" className="register-button">Register for free</a>
        </div>
      </div>
      <div className="promo-banner">
        <p><strong>Level up your career — Get 15% off</strong> select programs until July 30. Use the code <strong>LEVELUPEDX25</strong>. <a href="https://www.edx.org/level-up-promo">Learn more</a>.</p>
        <button className="close-banner" aria-label="Close site banner">&times;</button>
      </div>
    </header>
  );
};

export default Header;