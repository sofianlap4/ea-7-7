import fetchWithAuth from '../utils/fetchWithAuth';

// Add a PDF to a course (POST /api/pdfs/course/id/:courseId)
export const addPdfToCourse = async (
  courseId: string,
  data: { title: string; fileUrl: string; type: string },
  token?: string
) => {
  const res = await fetchWithAuth(`/api/pdfs/course/id/${courseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Get all PDFs for a course (GET /api/pdfs/course/:courseId)
export const fetchPdfsByCourse = async (courseId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/pdfs/course/id/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};

// Edit a PDF of a course (PUT /api/pdfs/course/id/:pdfId)
export const editPdfOfCourse = async (
  pdfId: string,
  data: { title?: string; fileUrl?: string; type?: string },
  token?: string
) => {
  const res = await fetchWithAuth(`/api/pdfs/course/id/${pdfId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

// Delete a PDF by ID (DELETE /api/pdfs/course/id/:pdfId)
export const deletePdfOfCourse = async (pdfId: string, token?: string) => {
  const res = await fetchWithAuth(`/api/pdfs/course/id/${pdfId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return await res.json();
};