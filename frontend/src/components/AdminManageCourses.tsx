import React, { useEffect, useState } from "react";
import {
  updateCourse,
  deleteCourse,
  fetchCourses,
  fetchQuizzByCourseId,
  fetchQuestionsByQuizzId,
} from "../api/courses";
import { fetchVideosByCourse, deleteVideo } from "../api/videos";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

// Helper API for PDFs
const fetchCoursePdfs = async (courseId: string) => {
  const res = await fetch(`/api/pdfs/course/${courseId}`, { method: "GET" });
  return await res.json();
};
const uploadPdfToCourse = async (
  courseId: string,
  pdf: File,
  title: string,
  type: "question" | "solution"
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", pdf);
  formData.append("type", type);
  const res = await fetch(`/api/pdfs/course/${courseId}`, {
    method: "POST",
    body: formData,
  });
  return await res.json();
};
const deletePdf = async (pdfId: string) => {
  const res = await fetch(`/api/pdfs/course/id/${pdfId}`, { method: "DELETE" });
  return await res.json();
};

interface PDF {
  id: string;
  title: string;
  fileUrl: string;
  type: "question" | "solution";
}

interface Course {
  id: string;
  title: string;
  description: string;
  packs?: { id: string; name: string }[];
  videos?: { id?: string; title: string; url: string }[];
}

const AdminManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVideos, setEditVideos] = useState<{ id?: string; title: string; url: string }[]>([]);
  const [editQuizz, setEditQuizz] = useState<any>(null);
  const [editQuestions, setEditQuestions] = useState<any[]>([]);
  const [editPackIds, setEditPackIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [allPacks, setAllPacks] = useState<{ id: string; name: string }[]>([]);
  // PDF state
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [newPdfTitle, setNewPdfTitle] = useState("");
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [newPdfType, setNewPdfType] = useState<"question" | "solution">("question");

  // For adding video/question
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newChoices, setNewChoices] = useState<string[]>(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("");
  const [newQuizzTitle, setNewQuizzTitle] = useState("");

  const loadCourses = async () => {
    const token = localStorage.getItem("token") || "";
    const response = await fetchCourses(token);
    if (response.success) {
      setCourses(Array.isArray(response.data) ? response.data : []);
    } else {
      console.error("Error fetching courses:", response.error);
      setCourses([]);
    }

    const fetchPacks = async () => {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/packs", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAllPacks(data.data);
    };
    fetchPacks();
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Load PDFs for the course being edited
  useEffect(() => {
    if (editingId) {
      fetchCoursePdfs(editingId).then((res) => {
        if (res.success) setPdfs(res.data);
        else setPdfs([]);
      });
    } else {
      setPdfs([]);
    }
  }, [editingId]);

  // Delete course
  const handleDelete = async (id: string) => {
    if (!window.confirm(RESPONSE_MESSAGES.CONFIRM_DELETE_COURSE)) return;
    setLoading(true);
    const token = localStorage.getItem("token") || "";
    const response = await deleteCourse(id, token);
    setLoading(false);
    if (response && response.success) {
      setMessage("Cours supprimé avec succès.");
      await loadCourses();
    } else {
      setMessage(response?.error || "Erreur lors de la suppression du cours.");
    }
  };

  const startEdit = async (course: Course) => {
    setEditingId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditPackIds(course.packs ? course.packs.map((p: any) => p.id) : []);
    const token = localStorage.getItem("token") || "";
    const responseVideos = await fetchVideosByCourse(course.id);
    if (responseVideos.success) {
      setEditVideos(Array.isArray(responseVideos?.data) ? responseVideos?.data : []);
    } else {
      setEditVideos([]);
    }
    const responseQuizz = await fetchQuizzByCourseId(course.id, token);
    if (responseQuizz.success) {
      setEditQuizz(responseQuizz?.data);
      if (responseQuizz?.data && responseQuizz?.data.id) {
        const resQuestions = await fetchQuestionsByQuizzId(responseQuizz?.data?.id, token);
        if (resQuestions.success) {
          setEditQuestions(Array.isArray(resQuestions?.data) ? resQuestions?.data : []);
        } else {
          setEditQuestions([]);
        }
      } else {
        setEditQuestions([]);
      }
    } else {
      setEditQuizz(null);
      setEditQuestions([]);
    }
    // PDFs loaded by useEffect
  };

  // Save all edits to backend
  const handleEditSave = async () => {
    if (!editingId) return;
    setLoading(true);
    const response = await updateCourse(
      editingId,
      editTitle,
      editDescription,
      editPackIds,
      editVideos,
      editQuizz,
      editQuestions
    );
    setLoading(false);
    if (response && response.success) {
      setMessage("Cours mis à jour avec succès.");
      setEditingId(null);
      loadCourses();
    } else {
      setMessage(response?.error || "Erreur lors de la mise à jour du cours.");
    }
  };

  // Add new PDF to course
  const handleAddPdf = async () => {
    if (!editingId || !newPdfFile || !newPdfTitle) {
      setMessage("Titre et fichier requis pour le PDF.");
      return;
    }
    setLoading(true);
    const res = await uploadPdfToCourse(editingId, newPdfFile, newPdfTitle, newPdfType);
    setLoading(false);
    if (res.success) {
      setMessage("PDF ajouté !");
      setNewPdfFile(null);
      setNewPdfTitle("");
      setNewPdfType("question");
      // Reload PDFs
      fetchCoursePdfs(editingId).then((res) => {
        if (res.success) setPdfs(res.data);
      });
    } else {
      setMessage(res.error || "Erreur lors de l'ajout du PDF.");
    }
  };

  // Delete PDF from course
  const handleDeletePdf = async (pdfId: string) => {
    if (!editingId) return;
    setLoading(true);
    const res = await deletePdf(pdfId);
    setLoading(false);
    if (res.success) {
      setMessage("PDF supprimé !");
      setPdfs(pdfs.filter((p) => p.id !== pdfId));
    } else {
      setMessage(res.error || "Erreur lors de la suppression du PDF.");
    }
  };

  // Local-only add/remove video
  const handleAddVideo = () => {
    if (!newVideoTitle || !newVideoUrl) {
      setMessage("Titre et URL requis pour la vidéo.");
      return;
    }
    setEditVideos([...editVideos, { title: newVideoTitle, url: newVideoUrl }]);
    setNewVideoTitle("");
    setNewVideoUrl("");
  };
  const handleRemoveVideo = (idx: number) => {
    setEditVideos(editVideos.filter((_, i) => i !== idx));
  };

  // Local-only add/remove question
  const handleAddQuestion = () => {
    if (!newQuestion || newChoices.some((c) => !c) || !newCorrectAnswer) {
      setMessage("Tous les champs de la question sont requis.");
      return;
    }
    setEditQuestions([
      ...editQuestions,
      {
        question: newQuestion,
        correctAnswer: newCorrectAnswer,
        choices: [...newChoices],
      },
    ]);
    setNewQuestion("");
    setNewChoices(["", "", "", ""]);
    setNewCorrectAnswer("");
  };
  const handleRemoveQuestion = (idx: number) => {
    setEditQuestions(editQuestions.filter((_, i) => i !== idx));
  };

  // Local-only add quizz
  const handleAddQuizz = () => {
    if (!newQuizzTitle) {
      setMessage("Titre du quizz requis.");
      return;
    }
    setEditQuizz({ title: newQuizzTitle });
    setNewQuizzTitle("");
  };

  // Remove quizz (and all questions)
  const handleRemoveQuizz = () => {
    setEditQuizz(null);
    setEditQuestions([]);
  };

  return (
    <div>
      <h2>Gestion Cours</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {courses.length === 0 && <p>Aucun cours trouvé.</p>}
      <ul>
        {courses.map((course) => (
          <li key={course.id} style={{ marginBottom: 16 }}>
            {editingId === course.id ? (
              <div>
                <label htmlFor='editTitle'>Titre</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder='Titre'
                />
                <br />
                <label htmlFor='editDescription'>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder='Description'
                  rows={3}
                  style={{ width: "100%" }}
                />
                <br />
                <h4>Vidéos</h4>
                {editVideos.length === 0 && <p>Aucune vidéo pour ce cours.</p>}
                <ul>
                  {editVideos.map((v: any, i) => (
                    <li key={i}>
                      <b>{v.title}</b>:{" "}
                      <a href={v.url} target='_blank' rel='noopener noreferrer'>
                        {v.url}
                      </a>
                      <button
                        type='button'
                        style={{ marginLeft: 8, color: "red" }}
                        onClick={() => handleRemoveVideo(i)}
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  placeholder='Titre de la vidéo'
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <input
                  placeholder='URL de la vidéo'
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type='button' onClick={handleAddVideo}>
                  Ajouter la vidéo
                </button>
                <h4>Quizz</h4>
                {!editQuizz && (
                  <div>
                    <p>Aucun quizz pour ce cours.</p>
                    <input
                      placeholder='Titre du quizz'
                      value={newQuizzTitle}
                      onChange={(e) => setNewQuizzTitle(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    <button type='button' onClick={handleAddQuizz}>
                      Ajouter le quizz
                    </button>
                  </div>
                )}
                {editQuizz && (
                  <div>
                    <h4>Questions : {editQuizz.title}</h4>
                    {editQuestions.length === 0 && <p>Aucune question pour ce quizz.</p>}
                    <ul>
                      {editQuestions.map((q, i) => (
                        <li key={i}>
                          <b>{q.question}</b>
                          <button
                            style={{ marginLeft: 8, color: "red" }}
                            onClick={() => handleRemoveQuestion(i)}
                          >
                            Supprimer
                          </button>
                          <ul>
                            {q.choices.map((c: string, j: number) => (
                              <li
                                key={j}
                                style={{ color: c === q.correctAnswer ? "green" : undefined }}
                              >
                                {c}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    <input
                      placeholder='Question'
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    {newChoices.map((choice, idx) => (
                      <input
                        key={idx}
                        placeholder={`Choix ${idx + 1}`}
                        value={choice}
                        onChange={(e) => {
                          const updated = [...newChoices];
                          updated[idx] = e.target.value;
                          setNewChoices(updated);
                        }}
                        style={{ marginRight: 8, marginTop: 4 }}
                      />
                    ))}
                    <input
                      placeholder='Bonne réponse'
                      value={newCorrectAnswer}
                      onChange={(e) => setNewCorrectAnswer(e.target.value)}
                      style={{ marginRight: 8, marginTop: 4 }}
                    />
                    <button type='button' onClick={handleAddQuestion}>
                      Ajouter la question
                    </button>
                    <button
                      type='button'
                      style={{ color: "red", marginLeft: 8 }}
                      onClick={handleRemoveQuizz}
                    >
                      Supprimer le quizz
                    </button>
                  </div>
                )}
                <h4>PDFs</h4>
                <div>
                  <ul>
                    {pdfs.map((pdf) => (
                      <li key={pdf.id}>
                        <b>{pdf.type === "question" ? "Question" : "Solution"}:</b> {pdf.title}{" "}
                        <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer">
                          Ouvrir PDF
                        </a>
                        <button
                          type="button"
                          style={{ marginLeft: 8, color: "red" }}
                          onClick={() => handleDeletePdf(pdf.id)}
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    placeholder="Titre du PDF"
                    value={newPdfTitle}
                    onChange={(e) => setNewPdfTitle(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <select
                    value={newPdfType}
                    onChange={(e) => setNewPdfType(e.target.value as "question" | "solution")}
                    style={{ marginRight: 8 }}
                  >
                    <option value="question">Question</option>
                    <option value="solution">Solution</option>
                  </select>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setNewPdfFile(e.target.files?.[0] || null)}
                    style={{ marginRight: 8 }}
                  />
                  <button type="button" onClick={handleAddPdf}>
                    Ajouter PDF
                  </button>
                </div>
                <h4>Packs associés</h4>
                <select
                  multiple
                  value={editPackIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setEditPackIds(selected);
                  }}
                  style={{ width: "100%", minHeight: 80, marginBottom: 8 }}
                >
                  {allPacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleEditSave} disabled={loading}>
                  Enregistrer
                </button>
                <button onClick={() => setEditingId(null)} disabled={loading}>
                  Annuler
                </button>
              </div>
            ) : (
              <div>
                <strong>{course.title}</strong>
                <p>{course.description}</p>
                {course.packs && course.packs.length > 0 && (
                  <div>
                    <strong>Packs associés :</strong>
                    <ul>
                      {course.packs.map((pack: any) => (
                        <li key={pack.id}>{pack.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <br />
                <button onClick={() => startEdit(course)} disabled={loading}>
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  style={{ marginLeft: 8 }}
                  disabled={loading}
                >
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminManageCourses;
