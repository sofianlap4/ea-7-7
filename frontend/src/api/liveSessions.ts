import fetchWithAuth from "../utils/fetchWithAuth";

export async function fetchAllLiveSessions(token: string) {
  const res = await fetchWithAuth("/api/live-sessions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

export async function createLiveSession(
  form: { title: string; description: string; date: string; meetLink: string; packId: string },
  token: string
) {
  const res = await fetchWithAuth("/api/live-sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: form.title,
      description: form.description,
      date: form.date,
      meetLink: form.meetLink,
      packId: form.packId,
    }),
  });
  return await res.json();
}

export async function updateLiveSession(id: string, form: any, token: string) {
  const res = await fetchWithAuth(`/api/live-sessions/id/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });
  return await res.json();
}

export async function deleteLiveSession(id: string, token: string) {
  const res = await fetchWithAuth(`/api/live-sessions/id/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

export async function joinLiveSession(id: string, token: string) {
  const res = await fetchWithAuth(`/api/live-sessions/id/${id}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

export async function fetchLiveSessionLog(sessionId: string, token: string) {
  const res = await fetchWithAuth(`/api/live-sessions/id/${sessionId}/log`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

export async function fetchLiveSession(id: string, token: string) {
  const res = await fetchWithAuth(`/api/live-sessions/id/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

export async function fetchAllStudentLiveSesssionsByPack(token: string) {
  const res = await fetchWithAuth("/api/live-sessions/my-live-sessions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}