import React, { useState, FormEvent, ChangeEvent } from 'react';
import { register } from '../api/auth';
  
import { useNavigate } from 'react-router-dom';

const GOUVERNORATS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Mednine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
];

const PACK_TYPES = [
  "2eme info gratuit",
  "3eme info gratuit",
  "Bac info gratuit",
  "Bac scientifique gratuit"
];

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gouvernorat: string;
  password: string;
  packType: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gouvernorat, setGouvernorat] = useState<string>(GOUVERNORATS[0]);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [packType, setPackType] = useState<string>(PACK_TYPES[0]);

  // Client-side validation
  const validate = (): boolean => {
    if (!/^\d{8}$/.test(phone)) {
      setMessage('Le numéro de téléphone doit comporter exactement 8 chiffres.');
      return false;
    }
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setMessage('Le mot de passe doit comporter au moins 8 caractères, dont 1 minuscule, 1 majuscule et 1 chiffre.');
      return false;
    }
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return false;
    }
    if (!packType) {
      setMessage('Veuillez sélectionner un pack.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;
    const payload: RegisterPayload = {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gouvernorat,
      password,
      packType,
    };
    const response = await register(payload);

    if (response.success) {
      console.log("resssssssssssss", response.data?.message)
      setMessage(response.data?.message || "Registration successful!");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } else {
      setMessage(response.error || "Registration failed.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <label>
        Prenom
        <input
          type="text"
          placeholder="Prenom"
          value={firstName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          required
        />
      </label>
      <label>
        Nom
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Téléphone (8 chiffres)
        <input
          type="text"
          placeholder="Téléphone (8 chiffres)"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          required
        />
      </label>
      <label>
        Date de naissance
        <input
          type="date"
          placeholder="Date de naissance"
          value={dateOfBirth}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDateOfBirth(e.target.value)}
          required
        />
      </label>
      <label>
        Gouvernorat
        <select value={gouvernorat} onChange={(e: ChangeEvent<HTMLSelectElement>) => setGouvernorat(e.target.value)} required>
          {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </label>
      <label>
        Pack gratuit
        <select value={packType} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPackType(e.target.value)} required>
          {PACK_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
        </select>
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Confirmer le mot de passe
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit">S'inscrire</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default RegisterForm;
