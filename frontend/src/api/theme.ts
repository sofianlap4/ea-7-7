import fetchWithAuth from '../utils/fetchWithAuth';

export const fetchAllThemes = async () => {
  const res = await fetchWithAuth('/api/themes');
  return await res.json();
};

export const fetchThemeById = async (id: string | number) => {
  const res = await fetchWithAuth(`/api/themes/id/${id}`);
  return await res.json();
};

// Accepts: { title: string, packIds?: string[] }
export const createTheme = async (data: { title: string; packIds?: string[] }) => {
  const res = await fetchWithAuth('/api/themes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Accepts: { title?: string, packIds?: string[] }
export const updateTheme = async (
  id: string | number,
  data: { title?: string; packIds?: string[] }
) => {
  const res = await fetchWithAuth(`/api/themes/id/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const deleteTheme = async (id: string | number) => {
  const res = await fetchWithAuth(`/api/themes/id/${id}`, { method: 'DELETE' });
  return await res.json();
};

export const fetchThemesByPackId = async (packId: string | number) => {
  const res = await fetchWithAuth(`/api/themes/by-pack/${packId}`);
  return await res.json();
};