import React, { useEffect, useState } from "react";
import { updateCourse, deleteCourse, fetchCourses } from "../api/courses";
import { fetchQuizzByCourseId, fetchQuestionsByQuizzId } from "../api/quizz";
import { fetchVideosByCourse } from "../api/videos";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";
import { addPdfToCourse, fetchPdfsByCourse, deletePdfOfCourse, editPdfOfCourse } from "../api/pdf";

interface PDF {
  id?: string;
  title: string;
  fileUrl?: string;
  type: "course" | "question" | "solution";
  file?: File; // Only for new PDFs
  _toDelete?: boolean; // Mark for deletion
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
  // PDFs state: all PDFs (existing and new)
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  // For adding new PDF
  const [newPdfTitle, setNewPdfTitle] = useState("");
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [newPdfType, setNewPdfType] = useState<"course" | "question" | "solution">("question");

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

  // Load all related data for editing
  const startEdit = async (course: Course) => {
    setEditingId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditPackIds(course.packs ? course.packs.map((p: any) => p.id) : []);
    // Videos
    const responseVideos = await fetchVideosByCourse(course.id);
    setEditVideos(
      responseVideos.success && Array.isArray(responseVideos.data) ? responseVideos.data : []
    );
    // Quizz & questions
    const token = localStorage.getItem("token") || "";
    const responseQuizz = await fetchQuizzByCourseId(course.id, token);
    if (responseQuizz.success) {
      setEditQuizz(responseQuizz.data);
      if (responseQuizz.data && responseQuizz.data.id) {
        const resQuestions = await fetchQuestionsByQuizzId(responseQuizz.data.id, token);
        // Merge both arrays if admin (or just always show all for admin panel)
        let allQuestions: any[] = [];
        if (resQuestions.success && resQuestions.data) {
          if (Array.isArray(resQuestions.data)) {
            // fallback: old API, just use as is
            allQuestions = resQuestions.data;
          } else {
            // new API: merge answeredCorrectly and toAnswer
            allQuestions = [
              ...(resQuestions.data.answeredCorrectly || []),
              ...(resQuestions.data.toAnswer || []),
            ];
          }
        }
        setEditQuestions(allQuestions);
      } else {
        setEditQuestions([]);
      }
    } else {
      setEditQuizz(null);
      setEditQuestions([]);
    }
    // PDFs
    const resPdfs = await fetchPdfsByCourse(course.id);
    setPdfs(resPdfs.success && Array.isArray(resPdfs.data) ? resPdfs.data : []);
  };

  // Save all edits to backend
  const handleEditSave = async () => {
    if (!editingId) return;
    setLoading(true);

    // 1. Update course, videos, quizz, questions
    const response = await updateCourse(
      editingId,
      editTitle,
      editDescription,
      editPackIds,
      editVideos,
      editQuizz,
      editQuestions
    );

    // 2. PDFs: synchronize backend with local state
    const backendPdfsRes = await fetchPdfsByCourse(editingId);
    const backendPdfs: PDF[] = backendPdfsRes.success ? backendPdfsRes.data : [];

    // Find deleted PDFs
    const deletedPdfs = backendPdfs.filter(
      (bpdf) => !pdfs.some((p) => p.id === bpdf.id)
    );
    for (const pdf of deletedPdfs) {
      if (pdf.id) await deletePdfOfCourse(pdf.id);
    }

    // Add new PDFs (now using FormData and file)
    for (const pdf of pdfs) {
      if (pdf.file) {
        await addPdfToCourse(editingId, {
          title: pdf.title,
          file: pdf.file,
          type: pdf.type,
        });
      }
    }

    // Optionally, update changed PDFs (title/type)
    for (const pdf of pdfs) {
      if (pdf.id && !pdf.file) {
        const backendPdf = backendPdfs.find((b) => b.id === pdf.id);
        if (
          backendPdf &&
          (backendPdf.title !== pdf.title || backendPdf.type !== pdf.type)
        ) {
          await editPdfOfCourse(pdf.id, { title: pdf.title, type: pdf.type });
        }
      }
    }

    setLoading(false);
    if (response && response.success) {
      setMessage("Cours mis à jour avec succès.");
      setEditingId(null);
      loadCourses();
    } else {
      setMessage(response?.error || "Erreur lors de la mise à jour du cours.");
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

  // Local-only add/remove PDF
  const handleAddPdfLocal = () => {
    if (!newPdfFile || !newPdfTitle) {
      setMessage("Titre et fichier requis pour le PDF.");
      return;
    }
    setPdfs([
      ...pdfs,
      {
        title: newPdfTitle,
        type: newPdfType,
        file: newPdfFile,
      },
    ]);
    setNewPdfFile(null);
    setNewPdfTitle("");
    setNewPdfType("question");
  };
  const handleRemovePdfLocal = (idx: number) => {
    setPdfs(pdfs.filter((_, i) => i !== idx));
  };

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
                    {pdfs.map((pdf, idx) => (
                      <li key={pdf.id || idx}>
                        <b>
                          {pdf.type === "course"
                            ? "Cours"
                            : pdf.type === "question"
                            ? "Question"
                            : "Solution"}
                          :
                        </b>{" "}
                        {pdf.title}{" "}
                        {pdf.fileUrl && (
                          <a href={pdf.fileUrl} target='_blank' rel='noopener noreferrer'>
                            Ouvrir PDF
                          </a>
                        )}
                        <button
                          type='button'
                          style={{ marginLeft: 8, color: "red" }}
                          onClick={() => handleRemovePdfLocal(idx)}
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type='text'
                    placeholder='Titre du PDF'
                    value={newPdfTitle}
                    onChange={(e) => setNewPdfTitle(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <select
                    value={newPdfType}
                    onChange={(e) =>
                      setNewPdfType(e.target.value as "course" | "question" | "solution")
                    }
                    style={{ marginRight: 8 }}
                  >
                    <option value='course'>Cours</option>
                    <option value='question'>Question</option>
                    <option value='solution'>Solution</option>
                  </select>
                  <input
                    type='file'
                    accept='application/pdf'
                    onChange={(e) => setNewPdfFile(e.target.files?.[0] || null)}
                    style={{ marginRight: 8 }}
                  />
                  <button type='button' onClick={handleAddPdfLocal}>
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
