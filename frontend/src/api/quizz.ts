import fetchWithAuth from '../utils/fetchWithAuth';

export const fetchQuizzByCourseId = async (courseId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/id/${courseId}/quizz`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
}

export const fetchQuestionsByQuizzId = async (quizzId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/courses/quizz/id/${quizzId}/questions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// POST answers to /api/courses/:courseId/quizz/submit
export const submitQuizz = async (courseId: string, answers: Record<string, string>) => {
  const res = await fetchWithAuth(`/api/courses/id/${courseId}/quizz/submit`, {
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
  const res = await fetchWithAuth(`/api/courses/id/${courseId}/quizz`, {
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
  const res = await fetchWithAuth(`/api/courses/quizz/id/${quizzId}`, {
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
  const res = await fetchWithAuth(`/api/courses/quizz/id/${quizzId}`, {
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
  const res = await fetchWithAuth(`/api/courses/quizz/id/${quizzId}/question`, {
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
  const res = await fetchWithAuth(`/api/courses/quizz/question/id/${questionId}`, {
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
  const res = await fetchWithAuth(`/api/courses/quizz/question/id/${questionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};