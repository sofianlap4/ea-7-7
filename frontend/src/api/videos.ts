import fetchWithAuth from '../utils/fetchWithAuth';

// Add a video to an exercise
export const addVideoToExercise = async (exerciseId: string | number, video: { title: string; url: string; free?: boolean }) => {
  const res = await fetchWithAuth(`/api/videos/exercise/id/${exerciseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(video)
  });
  return await res.json();
};

// Get all videos for an exercise
export const fetchVideosByExercise = async (exerciseId: string | number) => {
  const res = await fetchWithAuth(`/api/videos/exercise/id/${exerciseId}`);
  if (res.status === 403) return { accessDenied: true, videos: [] };
  return await res.json();
};

// Edit a video of an exercise
export const editVideoOfExercise = async (videoId: string | number, video: { title: string; url: string; free?: boolean }) => {
  const res = await fetchWithAuth(`/api/videos/exercise/id/${videoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(video)
  });
  return await res.json();
};

// Delete a video from an exercise
export const deleteVideoOfExercise = async (videoId: string | number, token?: string) => {
  const res = await fetchWithAuth(`/api/videos/exercise/id/${videoId}`, {
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
