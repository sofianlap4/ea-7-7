/*i
mport React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPhone } from '../api/auth';

const PhoneVerificationForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || '';
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await verifyPhone(phone, code);
    if (res.success) {
      setSuccess(true);
      setMessage('Phone verified! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setMessage(res.error || 'Verification failed.');
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>Verify Your Phone</h2>
      <p>Enter the code sent to your phone number: <strong>{phone}</strong></p>
      <input
        type="text"
        placeholder="Verification code"
        value={code}
        onChange={e => setCode(e.target.value)}
        required
      />
      <button type="submit" disabled={success}>Verify</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default PhoneVerificationForm;
*/