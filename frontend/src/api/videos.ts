import fetchWithAuth from '../utils/fetchWithAuth';

// Add a video to an exercice
export const addVideoToexercice = async (exerciceId: string | number, video: { title: string; url: string; free?: boolean }) => {
  const res = await fetchWithAuth(`/api/videos/exercice/id/${exerciceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(video)
  });
  return await res.json();
};

// Get all videos for an exercice
export const fetchVideosByexercice = async (exerciceId: string | number) => {
  const res = await fetchWithAuth(`/api/videos/exercice/id/${exerciceId}`);
  if (res.status === 403) return { accessDenied: true, videos: [] };
  return await res.json();
};

// Edit a video of an exercice
export const editVideoOfexercice = async (videoId: string | number, video: { title: string; url: string; free?: boolean }) => {
  const res = await fetchWithAuth(`/api/videos/exercice/id/${videoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(video)
  });
  return await res.json();
};

// Delete a video from an exercice
export const deleteVideoOfexercice = async (videoId: string | number, token?: string) => {
  const res = await fetchWithAuth(`/api/videos/exercice/id/${videoId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

export const addVideo = async (video: { title: string; url: string; courseId: string | number }) => {
  const res = await fetchWithAuth('/api/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(video)
  });
  return await res.json();
};

export const fetchVideosByCourse = async (courseId: string | number) => {
  const res = await fetchWithAuth(`/api/videos/course/id/${courseId}`);
  if (res.status === 403) return { accessDenied: true, videos: [] };
  return await res.json();
};

export const deleteVideo = async (videoId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/videos/id/${videoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};
