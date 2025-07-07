import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const codeFromUrl = searchParams.get("code") || "";
  const [code, setCode] = useState(codeFromUrl);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Auto-verify if both email and code are present in the URL
  useEffect(() => {
    const autoVerify = async () => {
      if (email && codeFromUrl) {
        const res = await verifyEmail(email, codeFromUrl);
        if (res && res.success) {
          setMsg(res?.data?.message || "Email vérifié avec succès !");
          setTimeout(() => navigate("/profile"), 1500);
        } else {
          setMsg(res.error || res.data.message || "Code incorrect.");
        }
      }
    };
    autoVerify();
    // eslint-disable-next-line
  }, [email, codeFromUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyEmail(email, code);
    if (res && res.success) {
      setMsg(res?.data.message || "Email vérifié avec succès !");
      setTimeout(() => navigate("/profile"), 1500);
    } else {
      setMsg(res.error || res.data.message || "Code incorrect.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Vérification de l'email</h2>
      <p>Un code de vérification a été envoyé à <b>{email}</b>.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Code de vérification"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />
        <button type="submit" style={{ width: "100%" }}>Vérifier</button>
      </form>
      {msg && <div style={{ marginTop: 12, color: msg.includes("succès") ? "green" : "red" }}>{msg}</div>}
    </div>
  );
};

export default VerifyEmailPage;