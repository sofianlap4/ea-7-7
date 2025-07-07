import fetchWithAuth from '../utils/fetchWithAuth';

export const loginRequest = async (email: string, password: string) => {
  const res = await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
};

export const requestPasswordReset = async (email?: string, phone?: string) => {
  const res = await fetchWithAuth('/api/auth/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone }),
  });
  return await res.json();
};

export const register = async (user: {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gouvernorat: string;
  password: string;
  email?: string;
  classId?: string;
}) => {
  const res = await fetchWithAuth('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return await res.json();
};

export const verifyEmail = async (email: string, code: string) => {
  const res = await fetchWithAuth('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  return await res.json();
};

export const sendVerificationEmail = async (email: string) => {
  const res = await fetchWithAuth('/api/auth/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await res.json();
};

export const resetPassword = async (params: { token?: string; newPassword: string; email?: string; phone?: string }) => {
  // If token is provided, use token-based reset (default flow)
  if (params.token) {
    const res = await fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, newPassword: params.newPassword }),
    });
    return await res.json();
  }
  // If email or phone is provided (for security/recovery code flows), use a different backend endpoint
  // You must implement this logic in your backend!
  const res = await fetchWithAuth('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      phone: params.phone,
      newPassword: params.newPassword,
    }),
  });
  return await res.json();
};
