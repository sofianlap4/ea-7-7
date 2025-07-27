import fetchWithAuth from "../utils/fetchWithAuth";

export async function submitPracticalexercice(exerciceId: string, code: string, token: string | null) {
  const res = await fetchWithAuth(`/api/practical-exercices/id/${exerciceId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });
  return await res.json();
}

export async function practicalexerciceRun(
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

export async function fetchexerciceApi(exerciceId: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercices/id/${exerciceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function updatePracticalexercice(editingId: string, formData: any, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercices/id/${editingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  return await res.json();
}

export async function deletePracticalexercice(id: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercices/id/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function createPracticalexercice(formData: any, token: string) {
  const response = await fetchWithAuth('/api/practical-exercices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  return await response.json();
}

export async function fetchAllPracticalexercices(token: string) {
  const res = await fetchWithAuth('/api/practical-exercices', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function createPracticalexerciceAttempt(exerciceId: string, token: string) {
  const res = await fetchWithAuth(`/api/practical-exercices/id/${exerciceId}/attempt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await res.json();
}

export async function fetchRandomPracticalexercice(
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

  const res = await fetchWithAuth(`/api/practical-exercices/random?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

// Fetch the count of practical exercices for the user's active pack and paidVersionId pack
export async function fetchPracticalexerciceCountForUserPack(token: string) {
  const res = await fetchWithAuth('/api/practical-exercices/count/for-user-pack', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}