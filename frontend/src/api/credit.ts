import fetchWithAuth from '../utils/fetchWithAuth';

export const fetchMyCreditTransactions = async (token?: string) => {
    const res = await fetchWithAuth('/api/credit/user/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

export const fetchAllCreditTransactions = async () => {
  const res = await fetchWithAuth('/api/credit/all');
  return await res.json();
};

export const addCreditToStudent = async (studentId: string, amount: string, attachmentUrl: string) => {
  const res = await fetchWithAuth('/api/credit/admin/add', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, amount, attachmentUrl })
  });
  return await res.json();
};