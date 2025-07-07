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
  const res = await fetchWithAuth(`/api/courses/${id}`);
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

  const res = await fetchWithAuth(`/api/courses/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
};

// Delete a course by ID (DELETE /api/courses/:id)
export const deleteCourse = async (id: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// POST answers to /api/courses/:courseId/quizz/submit
export const submitQuizz = async (courseId: string, answers: Record<string, string>) => {
  const res = await fetchWithAuth(`/api/courses/${courseId}/quizz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return await res.json();
};

// Create a quizz for a course
export const createQuizz = async (
  courseId: string,
  title: string,
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/${courseId}/quizz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title }),
  });
  return await res.json();
};

// Edit a quizz
export const editQuizz = async (
  quizzId: string,
  title: string,
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/quizz/${quizzId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title }),
  });
  return await res.json();
};

// Delete a quizz
export const deleteAllQuizz = async (
  quizzId: string,
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/quizz/${quizzId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Add a question to a quizz
export const addQuizzQuestion = async (
  quizzId: string,
  question: string,
  correctAnswer: string,
  choices: string[],
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/quizz/${quizzId}/question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, correctAnswer, choices }),
  });
  return await res.json();
};

// Edit a question
export const editQuizzQuestion = async (
  questionId: string,
  question: string,
  correctAnswer: string,
  choices: string[],
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/quizz/question/${questionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question, correctAnswer, choices }),
  });
  return await res.json();
};

// Delete a question
export const deleteQuizzQuestion = async (
  questionId: string,
  token?: string
) => {
  const res = await fetchWithAuth(`/api/courses/quizz/question/${questionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Delete PDF file for a course
export const deleteCoursePdf = async (courseId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/${courseId}/pdf`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

export const fetchQuizzByCourseId = async (courseId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/${courseId}/quizz`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
}

export const fetchQuestionsByQuizzId = async (quizzId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/quizz/${quizzId}/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};