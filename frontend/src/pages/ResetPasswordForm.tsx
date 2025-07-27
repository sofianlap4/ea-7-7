import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const navigate = useNavigate();

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await resetPassword({ token: token ?? undefined, newPassword: password });
    if (res?.data && res.success) {
      setMessage(res?.data?.message || "Mot de passe réinitialisé avec succès !");
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setMessage(res.error || "Erreur lors de la réinitialisation.");
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h2>Définir un nouveau mot de passe</h2>
      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Réinitialiser le mot de passe</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ResetPasswordForm;