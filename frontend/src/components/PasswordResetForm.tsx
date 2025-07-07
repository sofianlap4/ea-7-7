import React, { useState, FormEvent, ChangeEvent } from 'react';
import { requestPasswordReset } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [step, setStep] = useState<"input" | "done">("input");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await requestPasswordReset(email);
    if (response.success) {
      setMessage(response?.data.message || "Un lien de réinitialisation a été envoyé à votre email.");
      setStep("done");
    } else {
      setMessage(response.error || "Erreur lors de l'envoi du lien de réinitialisation.");
    }
  };

  return (
    <div>
      {step === "input" && (
        <form onSubmit={handleSubmit}>
          <h2>Réinitialisation du mot de passe</h2>
          <p style={{ color: "#555", marginBottom: 12 }}>
            Veuillez saisir votre <b>email</b> pour réinitialiser votre mot de passe.
          </p>
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={{ marginBottom: 8, width: "100%" }}
            required
          />
          <button type="submit">Envoyer le lien de réinitialisation</button>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </form>
      )}

      {step === "done" && (
        <div>
          <p style={{ color: "green" }}>{message}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordResetForm;