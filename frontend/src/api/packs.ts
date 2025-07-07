import fetchWithAuth from '../utils/fetchWithAuth';


export const fetchAllPacksStudent = async () => {
  const res = await fetchWithAuth('/api/packs/public/all');
  return await res.json();
};

export const fetchAllPacksAdmin = async () => {
  const res = await fetchWithAuth('/api/packs');
  return await res.json();
};

export const fetchPackById = async (id: string | number) => {
  const res = await fetchWithAuth(`/api/packs/${id}`);
  return await res.json();
};

// Create a new pack
export const createPack = async (data: {
  name: string;
  description?: string;
  type: string;
  courseIds?: (string | number)[];
  offers?: { durationMonths: number; price: number }[];
}) => {
  const res = await fetchWithAuth('/api/packs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Update an offer (admin)
// Update a pack
export const updatePack = async (
  id: string | number,
  data: {
    name?: string;
    description?: string;
    type?: string;
    courseIds?: (string | number)[];
    offers?: { id?: string; durationMonths: number; price: number }[];
  }
) => {
  const res = await fetchWithAuth(`/api/packs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Add a new offer to a pack (admin)
export const createPackOffer = async (
  packId: string,
  data: { durationMonths: number; price: number }
) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Update an offer (admin)
export const updatePackOffer = async (
  offerId: string,
  data: { durationMonths: number; price: number }
) => {
  const res = await fetchWithAuth(`/api/packs/offers/${offerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Delete an offer (admin)
export const deletePackOffer = async (offerId: string) => {
  const res = await fetchWithAuth(`/api/packs/offers/${offerId}`, { method: 'DELETE' });
  return await res.json();
};

export const deletePack = async (id: string | number) => {
  const res = await fetchWithAuth(`/api/packs/${id}`, { method: 'DELETE' });
  return await res.json();
};

export const addStudentToPack = async (packId: string | number, studentId: string | number) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  return await res.json();
};

export const removeStudentFromPack = async (packId: string | number, studentId: string | number) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/students/${studentId}`, { method: 'DELETE' });
  return await res.json();
};

// Subscribe to a pack with offer and optional reduction code
export const subscribeToPack = async (
  packId: string,
  offerId: string,
  reductionCode?: string,
  force = false
) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, reductionCode, force }),
  });
  return await res.json();
};

export const fetchMyPack = async () => {
  const res = await fetchWithAuth('/api/packs/mypack');
  return await res.json();
};

export const fetchPackRequests = async (packId: string) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/requests`);
  return await res.json();
};

export const rejectPackRequest = async (packId: string, requestId: string) => {
  const res = await fetchWithAuth(`/api/packs/${packId}/requests/${requestId}/reject`, { method: 'POST' });
  return await res.json();
};

export const fetchMyUsage = async () => {
  const res = await fetchWithAuth('/api/packs/me/usage');
  return await res.json();
};

export const fetchUserPackReductions = async () => {
  // Fetch all user pack reductions
  // This endpoint should return an array of UserPackReduction objects
  // Each object should include user, pack, offer, and reductionCode details
  const res = await fetchWithAuth("/api/user-pack-reductions");
  return await res.json();
};
