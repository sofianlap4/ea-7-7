// API functions for fetching associated theme and pack IDs for a practical exercice
import axios from "axios";

export async function fetchPracticalexerciceThemeIds(exerciceId: string, token: string) {
  try {
    const res = await axios.get(`/api/practical-exercices/${exerciceId}/themes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Expecting: { success: true, data: ["themeId1", "themeId2", ...] }
    return res.data;
  } catch (err: any) {
    return { success: false, error: err?.response?.data?.error || "Failed to fetch theme IDs" };
  }
}

export async function fetchPracticalexercicePackIds(exerciceId: string, token: string) {
  try {
    const res = await axios.get(`/api/practical-exercices/${exerciceId}/packs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Expecting: { success: true, data: ["packId1", "packId2", ...] }
    return res.data;
  } catch (err: any) {
    return { success: false, error: err?.response?.data?.error || "Failed to fetch pack IDs" };
  }
}
