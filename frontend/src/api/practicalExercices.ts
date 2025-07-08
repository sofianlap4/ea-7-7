import fetchWithAuth from "../utils/fetchWithAuth";

export async function submitPracticalExercise(exerciseId: string, code: string, token: string | null) {
  const res = await fetchWithAuth(`/api/practical-exercises/id/${exerciseId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  return await res.json();
}

export async function practicalExerciseRun(
  code: string,
  language: string,
  testCases: any,
  token: string
) {
  let endpoint = "";
  if (language === "javascript") {
    endpoint = "/api/javascript/run-code";
  } else if (language === "python") {
    endpoint = "/api/python/run-code";
  } else if (language === "sql") {
    endpoint = "/api/sql/run-code";
  } else {
    return { status: false, message: "Unsupported language." };
  }

  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code,
      testCases,
      language,
    }),
  });

  const data = await response.json();
  return data;
}

export async function fetchExerciseApi(exerciseId: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercises/id/${exerciseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function updatePracticalExercise(editingId: string, formData: any, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercises/id/${editingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  return await res.json();
}

export async function deletePracticalExercise(id: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercises/id/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function createPracticalExercise(formData: any, token: string) {
  const response = await fetchWithAuth('/api/practical-exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  return await response.json();
}

export async function fetchAllPracticalExercises(token: string) {
  const res = await fetchWithAuth('/api/practical-exercises', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function createPracticalExerciseAttempt(exerciseId: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercises/id/${exerciseId}/attempt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function fetchRandomPracticalExercise(
  difficulty: string,
  language: string,
  themeIds: string[],
  token: string
) {
  const params = new URLSearchParams();
  if (difficulty) params.append("difficulty", difficulty);
  if (language) params.append("language", language);
  if (themeIds && themeIds.length > 0) {
    themeIds.forEach((id) => params.append("themeIds", id));
  }

  const res = await fetchWithAuth(`/api/practical-exercises/random?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}