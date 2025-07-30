import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.css';

import { register } from '../../../api/auth';
import TextInput from '../../../components/forms/TextInput';
import PasswordInput from '../../../components/forms/PasswordInput';
import FormMessage from '../../../components/forms/FormMessage';
import SelectInput from '../../../components/forms/SelectInput';


const PACK_TYPES = [
  { label: "2eme info", value: "2eme info gratuit" },
  { label: "3eme info", value: "3eme info gratuit" },
  { label: "bac info", value: "Bac info gratuit" },
  { label: "bac scientifique", value: "Bac scientifique gratuit" }
];

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  packType: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('sofienne');
  const [lastName, setLastName] = useState('nabli');
  const [email, setEmail] = useState('sofiannabli1993@gmail.com');
  const [phone, setPhone] = useState('12345678');
  const [password, setPassword] = useState('TTuu1234');
  const [confirmPassword, setConfirmPassword] = useState('TTuu1234');
  const [packType, setPackType] = useState(PACK_TYPES[0].value);
  const [message, setMessage] = useState('');

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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;

    const payload: RegisterPayload = {
      firstName,
      lastName,
      email,
      phone,
      password,
      packType,
    };

    const response = await register(payload);

    if (response.success) {
      setMessage(response.data?.message || "Registration successful!");
      setTimeout(() => navigate("/profile"), 2000);
    } else {
      setMessage(response.error || "Registration failed.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form className={styles.registerForm} onSubmit={handleRegister}>
          <h2>Register</h2>

          <TextInput label="Prenom" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <TextInput label="Nom" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          <TextInput label="Téléphone (8 chiffres)" value={phone} onChange={e => setPhone(e.target.value)} required />

          <SelectInput label="Classe" value={packType} onChange={e => setPackType(e.target.value)} options={PACK_TYPES} required />

          <PasswordInput label="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
          <PasswordInput label="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

          <button type="submit">S'inscrire</button>

          <FormMessage message={message} />
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
