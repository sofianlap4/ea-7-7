import fetchWithAuth from '../utils/fetchWithAuth';

export const fetchProfile = async () => {
  const res = await fetchWithAuth('/api/profile/me');
  return await res.json();
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const res = await fetchWithAuth('/api/profile/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return await res.json();
};

export const changeEmail = async (newEmail: string, password: string) => {
  const res = await fetchWithAuth('/api/profile/change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmail, password }),
  });
  return await res.json();
};

export const fetchCredit = async () => {
  const res = await fetchWithAuth('/api/profile/me/credit');
  return await res.json();
};

export async function fetchMyPackTransactions() {
  const res = await fetch('/api/profile/my-pack-transactions', {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return await res.json();
}

export const fetchUserSolutions = async (userId: string) => {
  const res = await fetchWithAuth(`/api/solutions/users/${userId}/solutions`);
  return await res.json();
};

export const fetchMyRank = async () => {
  const res = await fetchWithAuth('/api/profile/me/rank');
  return await res.json();
};