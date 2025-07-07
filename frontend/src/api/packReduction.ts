import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch all reduction codes (admin)
export const fetchReductionCodes = async () => {
  const res = await fetchWithAuth('/api/user-pack-reductions/reduction-codes/');
  return await res.json();
};

// Create a reduction code (admin)
export const createReductionCode = async (data: {
  code: string;
  description?: string;
  percentage: number;
  isActive?: boolean;
  packIds?: string[];
}) => {
  const res = await fetchWithAuth('/api/user-pack-reductions/reduction-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Update a reduction code (admin)
export const updateReductionCode = async (
  id: string,
  data: {
    code?: string;
    description?: string;
    percentage?: number;
    isActive?: boolean;
    packIds?: string[];
  }
) => {
  const res = await fetchWithAuth(`/api/user-pack-reductions/reduction-codes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Delete a reduction code (admin)
export const deleteReductionCode = async (id: string) => {
  const res = await fetchWithAuth(`/api/user-pack-reductions/reduction-codes/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
};

// Fetch all user pack reductions (admin)
export const fetchUserPackReductions = async () => {
  const res = await fetchWithAuth("/api/user-pack-reductions/reductions-sells");
  return await res.json();
};
