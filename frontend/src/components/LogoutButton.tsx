import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

interface LogoutButtonProps {
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('token');
      if (onLogout) onLogout();
      navigate('/login');
    } catch (err) {
      localStorage.removeItem('token');
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;