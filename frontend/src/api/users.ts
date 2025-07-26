import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch all users (optionally filter by role)
export const fetchUsers = async (role?: string, token?: string) => {
  const url = role ? `/api/users?role=${role}` : '/api/users';
  const res = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Fetch user by ID
export const fetchUserById = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/users/id/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Update user by ID
export const updateUserById = async (
  id: string,
  data: { firstName?: string; lastName?: string; email?: string; phone?: string; },
  token?: string
) => {
  const res = await fetchWithAuth(`/api/users/id/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Revoke all refresh tokens for a user
export const revokeUserRefreshTokens = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/users/id/${id}/revoke-refresh-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Archive (soft delete) a user
export const archiveUser = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/users/id/${id}/archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Check if the user has an active pack and if it is freeVersion or not
export const fetchUserActivePackStatus = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/users/id/${id}/active-pack-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};