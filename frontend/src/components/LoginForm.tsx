import React, { useState, FormEvent, ChangeEvent } from "react";
import { loginRequest } from "../api/auth";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onLogin?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await loginRequest(email, password);

    if (response.success) {
      const token = response?.data?.token;
      setMessage(response?.data?.message || "Login successful");
      if (token) {
        localStorage.setItem("token", token);
        if (onLogin) onLogin();
        navigate("/profile");
      } else {
        console.error("Login successful, but no token received.");
      }
    } else {
      setMessage(response?.error || "Login failed!!");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Se connecter</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default LoginForm;
