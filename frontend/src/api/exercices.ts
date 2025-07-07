import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch all exercises (GET /api/exercices)
export const fetchExercices = async (token?: string) => {
  const res = await fetchWithAuth('/api/exercices', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Fetch an exercise by ID (GET /api/exercices/id/:id)
export const fetchExerciceById = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/exercices/id/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Create a new exercise (POST /api/exercices)
export const fetchCreateExercice = async (
  data: { title: string; description: string },
  token?: string
) => {
  const res = await fetchWithAuth('/api/exercices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Update an exercise (PUT /api/exercices/id/:id)
export const fetchUpdateExercice = async (
  id: string,
  data: { title?: string; description?: string },
  token?: string
) => {
  const res = await fetchWithAuth(`/api/exercices/id/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Delete an exercise (DELETE /api/exercices/id/:id)
export const fetchDeleteExercice = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/exercices/id/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};
