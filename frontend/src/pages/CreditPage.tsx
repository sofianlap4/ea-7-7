// src/components/CreditPage.tsx
import React, { useEffect, useState } from "react";
import { fetchCredit } from "../api/profile";
import StudentCreditHistory from "../components/StudentCreditHistory";

const CreditPage: React.FC = () => {
  const [credit, setCredit] = useState<number>(0);

  useEffect(() => {
    fetchCredit().then(response => {
      if (response?.success) {
        setCredit(response?.data?.credit || 0);
      } else {
        console.error("Failed to load credit:", response?.error || "Unknown error");
      }
    });
  }, []);

  return (
    <div>
      <h2>My Credit</h2>
      <p>Your current credit: <b>{credit} TND</b></p>
      <h3>Buy Credit</h3>
      <ul>
        <li>
          <b>Virement bancaire</b> (Bank transfer):<br />
          RIB: <span style={{ fontWeight: "bold" }}>123 456 789 000 12345678</span>
        </li>
        <li>
          <b>Virement postale</b> (Postal transfer):<br />
          RIB: <span style={{ fontWeight: "bold" }}>987 654 321 000 87654321</span>
        </li>
        <li>
          <b>Buy online with Tunisian national credit card</b>:<br />
          <button onClick={() => alert("Redirect to payment gateway")}>Pay Online</button>
        </li>
        <li>
          <b>D17 post app</b>:<br />
          <span>Send to phone: <b>+216 99 900 001</b></span>
        </li>
      </ul>
      <p>
        After payment, please send proof to <b>support@yourapp.com</b> or via WhatsApp: <b>+216 99 900 001</b> to have your credit validated.
      </p>
      <hr />
      <StudentCreditHistory />
    </div>
  );
};

export default CreditPage;
