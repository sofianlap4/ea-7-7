import React from "react";

const ContactPage: React.FC = () => (
  <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
    <h2>Contacter nous</h2>
    <p>
      Pour toute question ou assistance, vous pouvez nous contacter par e-mail ou WhatsApp :
    </p>
    <ul>
      <li>
        <strong>Email:</strong>{" "}
        <a href={`mailto:${process.env.REACT_APP_EMAIL_CONTACT || "sofienneititch@gmail.com"}`}>support@example.com</a>
      </li>
      <li>
        <strong>WhatsApp:</strong>{" "}
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
        >
          {process.env.REACT_APP_WHATSAPP_CONTACT || "+21655377225"}
        </a>
      </li>
    </ul>
  </div>
);

export default ContactPage;