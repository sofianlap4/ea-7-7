import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch top 10 users in a specific division (rank)
export const fetchDivisionLeaderboard = async (rank: string) => {
  const res = await fetchWithAuth(`/api/leaderboard/division/${encodeURIComponent(rank)}`);
  return await res.json();
};

// Fetch top 10 users globally
export const fetchGlobalLeaderboard = async () => {
  const res = await fetchWithAuth('/api/leaderboard/global');
  return await res.json();
};

// Fetch current user's ranking in their division
export const fetchMyDivisionRanking = async () => {
  const res = await fetchWithAuth('/api/leaderboard/me/division');
  return await res.json();
};

// Fetch current user's global ranking
export const fetchMyGlobalRanking = async () => {
  const res = await fetchWithAuth('/api/leaderboard/me/global');
  return await res.json();
};

// Fetch all student rankings (admin only)
export const fetchAllRankings = async (token: string) => {
  const res = await fetchWithAuth('/api/leaderboard/all', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};

// Update a student's ranking points (admin only)
export const updateStudentRankingPoints = async (userId: string, points: number, token: string) => {
  const res = await fetchWithAuth(`/api/leaderboard/studentRank/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ points }),
  });
  return await res.json();
};