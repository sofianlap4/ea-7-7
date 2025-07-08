import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch all solutions for a ranked exercise, ordered by most liked
export const fetchExerciseSolutions = async (exerciseId: string) => {
  const res = await fetchWithAuth(`/api/solutions/ranked-exercises/id/${exerciseId}/solutions`);
  return await res.json();
};

// Like a solution
export const likeSolution = async (solutionId: string) => {
  const res = await fetchWithAuth(`/api/solutions/id/${solutionId}/like`, {
    method: 'POST',
  });
  return await res.json();
};

// Remove like from a solution
export const unlikeSolution = async (solutionId: string) => {
  const res = await fetchWithAuth(`/api/solutions/id/${solutionId}/like`, {
    method: 'DELETE',
  });
  return await res.json();
};

// Post a comment on a solution
export const commentOnSolution = async (solutionId: string, text: string) => {
  const res = await fetchWithAuth(`/api/solutions/id/${solutionId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return await res.json();
};

// Remove a comment from a solution
export const removeComment = async (solutionId: string, commentId: string) => {
  const res = await fetchWithAuth(`/api/solutions/id/${solutionId}/comment/id/${commentId}`, {
    method: 'DELETE',
  });
  return await res.json();
};

// Fetch all submitted solutions by user id
export const fetchUserSolutions = async (userId: string) => {
  const res = await fetchWithAuth(`/api/solutions/users/id/${userId}/solutions`);
  return await res.json();
};