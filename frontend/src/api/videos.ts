import fetchWithAuth from '../utils/fetchWithAuth';

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
  const res = await fetchWithAuth(`/api/videos/course/${courseId}`);
  if (res.status === 403) return { accessDenied: true, videos: [] };
  return await res.json();
};

export const deleteVideo = async (videoId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/videos/${videoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};
