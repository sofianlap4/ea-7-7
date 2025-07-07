import React, { use, useEffect, useState } from "react";
import { fetchProfile, changePassword, changeEmail } from "../api/profile";
import { sendVerificationEmail } from "../api/auth"; // adjust import
import { useNavigate } from "react-router-dom";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  className: string;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile().then(response => {
      if (response.success) {
        setProfile(response.data);
      } else {
        console.error("Failed to fetch profile:", response.error);
      }
    });
  }, []);



  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg(res?.data.message);
    } else {
      setPasswordMsg(res.error);
    }
    setOldPassword("");
    setNewPassword("");
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await changeEmail(newEmail, emailPassword);
    
    if (res.success) {
      setEmailMsg(res?.data.message);
      setProfile((prev) => (prev ? { ...prev, email: newEmail, isEmailVerified: false } : prev));
      setNewEmail("");
      setEmailPassword("");
    } else {
      setEmailMsg(res.error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!profile) return;
    const res = await sendVerificationEmail(profile.email);
    if (!res.success) {
      setVerifyMsg(res.error || "Failed to send verification email");
      return;
    } else {
      setVerifyMsg(res?.data.message);
      navigate(`/verify-email?email=${encodeURIComponent(profile.email)}`);
      setEmailMsg(""); // Clear email message if verification is successful
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Mon Profil</h2>
      <p>
        <strong>Prenom:</strong> {profile.firstName}
      </p>
      <p>
        <strong>Nom:</strong> {profile.lastName}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>Email verifié:</strong> {profile.isEmailVerified ? "Oui" : "Non"}
        {!profile.isEmailVerified && (
          <>
            <button onClick={handleVerifyEmail} style={{ marginLeft: 8 }}>
              Vérifier l'email
            </button>
            {verifyMsg && <span style={{ marginLeft: 8, color: "green" }}>{verifyMsg}</span>}
          </>
        )}
      </p>

      <h3>Changer le mot de passe</h3>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Ancien mot de passe"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Changer le mot de passe</button>
        {passwordMsg && <p>{passwordMsg}</p>}
      </form>

      <h3>Changer Email</h3>
      <form onSubmit={handleChangeEmail}>
        <input
          type="email"
          placeholder="Nouvel Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe actuel"
          value={emailPassword}
          onChange={(e) => setEmailPassword(e.target.value)}
          required
        />
        <button type="submit">Changer Email</button>
        {emailMsg && <p>{emailMsg}</p>}
      </form>
    </div>
  );
};

export default UserProfile;
