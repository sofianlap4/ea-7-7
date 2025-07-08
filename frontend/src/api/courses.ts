import fetchWithAuth from '../utils/fetchWithAuth';

// Fetch all courses (GET /api/courses)
export const fetchCourses = async (token?: string) => {
  const res = await fetchWithAuth('/api/courses', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Fetch a course by ID (GET /api/courses/:id)
export const fetchCourseById = async (id: string | number) => {
  const res = await fetchWithAuth(`/api/courses/id/${id}`);
  return await res.json();
};

// Create a new course (POST /api/courses)
export const fetchCreateCourse = async (data: {
  title: string;
  description: string;
  packIds: string[];
  videos?: { title: string; url: string }[];
}) => {
  const body: any = {
    title: data.title,
    description: data.description,
    packIds: data.packIds,
  };
  if (data.videos) body.videos = JSON.stringify(data.videos);

  const res = await fetchWithAuth('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await res.json();
};

// Fetch courses for the logged-in student (GET /api/courses/my)
export const fetchStudentCourses = async () => {
  const res = await fetchWithAuth('/api/courses/my');
  return await res.json();
};

// Update a course by ID (PUT /api/courses/:id)
export const updateCourse = async (
  editingId: string | number,
  editTitle: string,
  editDescription: string,
  packIds: string[],
  videos: { title: string; url: string }[],
  quizz?: { title: string },
  questions?: { question: string; correctAnswer: string; choices: string[] }[]
) => {
  const body: any = {
    title: editTitle,
    description: editDescription,
    packIds,
    videos: JSON.stringify(videos),
  };
  if (quizz) body.quizz = JSON.stringify(quizz);
  if (questions) body.questions = JSON.stringify(questions);

  const res = await fetchWithAuth(`/api/courses/id/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
};

// Delete a course by ID (DELETE /api/courses/:id)
export const deleteCourse = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/id/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};



// Delete PDF file for a course
export const deleteCoursePdf = async (courseId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/id/${courseId}/pdf`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

