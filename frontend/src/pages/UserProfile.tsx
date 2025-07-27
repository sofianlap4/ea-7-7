import React, { use, useEffect, useState } from "react";
import { fetchProfile, changePassword, changeProfileInfo } from "../api/profile";
import { sendVerificationEmail } from "../api/auth"; // adjust import
import { useNavigate } from "react-router-dom";

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isEmailVerified?: boolean;
  className?: string;
  phone?: string;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [editProfile, setEditProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [profileMsg, setProfileMsg] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile().then(response => {
      if (response.success) {
        setProfile(response.data);
        setEditProfile({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          phone: response.data.phone || "",
        });
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

  const handleChangeProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await changeProfileInfo(editProfile);
    if (res.success) {
      setProfileMsg(res?.message || res?.data?.message || "Profil mis à jour");
      setProfile((prev) => (prev ? { ...prev, ...editProfile } : prev));
    } else {
      setProfileMsg(res.error || "Erreur lors de la mise à jour du profil");
    }
  };

  const handleVerifyEmail = async () => {
    if (!profile) return;
    if (!profile.email) {
      setVerifyMsg("Email non disponible");
      return;
    }
    const res = await sendVerificationEmail(profile.email);
    if (!res.success) {
      setVerifyMsg(res.error || "Failed to send verification email");
      return;
    } else {
      setVerifyMsg(res?.data.message);
      if (profile.email) {
        navigate(`/verify-email?email=${encodeURIComponent(profile.email)}`);
      }
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Mon Profil</h2>
      <form onSubmit={handleChangeProfileInfo}>
        <div>
          <label>Prénom:</label>
          <input
            type="text"
            value={editProfile.firstName}
            onChange={e => setEditProfile(p => ({ ...p, firstName: e.target.value }))}
            placeholder="Prénom"
          />
        </div>
        <div>
          <label>Nom:</label>
          <input
            type="text"
            value={editProfile.lastName}
            onChange={e => setEditProfile(p => ({ ...p, lastName: e.target.value }))}
            placeholder="Nom"
          />
        </div>
        <div>
          <label>Téléphone:</label>
          <input
            type="text"
            value={editProfile.phone}
            onChange={e => setEditProfile(p => ({ ...p, phone: e.target.value }))}
            placeholder="Téléphone"
          />
        </div>
        <button type="submit">Mettre à jour le profil</button>
        {profileMsg && <p>{profileMsg}</p>}
      </form>
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
    </div>
  );
};

export default UserProfile;
