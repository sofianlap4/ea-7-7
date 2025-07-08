import React, { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { fetchCreateCourse } from "../api/courses";
import { createQuizz, addQuizzQuestion } from "../api/quizz";
import { fetchAllPacksAdmin } from "../api/packs";

// Helper for uploading a PDF to a course
const uploadPdfToCourse = async (
  courseId: string,
  pdf: File,
  title: string,
  type: "course" | "question" | "solution"
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

const CreateCourseForm: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [videos, setVideos] = useState<{ title: string; url: string }[]>([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [quizzTitle, setQuizzTitle] = useState<string>("");
  const [questions, setQuestions] = useState<
    { question: string; choices: string[]; correctAnswer: string }[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentChoices, setCurrentChoices] = useState<string[]>(["", "", "", ""]);
  const [currentCorrect, setCurrentCorrect] = useState<string>("");
  const [packIds, setPackIds] = useState<string[]>([]);
  const [packs, setPacks] = useState<any[]>([]);

  // PDF state for questions and solutions
  const [coursPdfs, setCoursPdfs] = useState<{ file: File; title: string }[]>([]);

  const [questionPdfs, setQuestionPdfs] = useState<{ file: File; title: string }[]>([]);
  const [solutionPdfs, setSolutionPdfs] = useState<{ file: File; title: string }[]>([]);

  useEffect(() => {
    fetchAllPacksAdmin().then((response) => {
      if (response.success) {
        setPacks(Array.isArray(response.data) ? response.data : []);
      } else {
        console?.error(response.error || "Error fetching packs");
      }
    });
  }, []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Create the course
    const response1 = await fetchCreateCourse({
      title,
      description,
      packIds,
      videos,
    });

    if (response1.success) {
      setMessage("Cours créé !");
      setTitle("");
      setDescription("");
      setVideos([]);
      setPackIds([]);

            // 2. Upload PDFs for courses
      for (const { file, title: pdfTitle } of coursPdfs) {
        await uploadPdfToCourse(response1.data.id, file, pdfTitle, "course");
      }

      // 2. Upload PDFs for questions
      for (const { file, title: pdfTitle } of questionPdfs) {
        await uploadPdfToCourse(response1.data.id, file, pdfTitle, "question");
      }
      // 3. Upload PDFs for solutions
      for (const { file, title: pdfTitle } of solutionPdfs) {
        await uploadPdfToCourse(response1.data.id, file, pdfTitle, "solution");
      }

      setCoursPdfs([]);
      setQuestionPdfs([]);
      setSolutionPdfs([]);

      // 4. Create quizz and questions if provided
      if (quizzTitle) {
        const response = await createQuizz(response1?.data?.id, quizzTitle);
        if (response?.success) {
          for (const q of questions) {
            await addQuizzQuestion(response?.data.id, q.question, q.correctAnswer, q.choices);
          }
          setMessage("Cours, PDFs, quizz et questions créés !");
        } else {
          setMessage("Cours et PDFs créés, mais échec de la création du quizz : " + response.error);
        }
      }
      setQuizzTitle("");
      setQuestions([]);
      setCurrentQuestion("");
      setCurrentChoices(["", "", "", ""]);
      setCurrentCorrect("");
    } else {
      setMessage("Erreur lors de la création du cours");
    }
  };

  const handleAddCoursePdf = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = e.target.files;
    if (files && files[0]) {
      const newArr = [...coursPdfs];
      newArr[idx] = { ...newArr[idx], file: files[0] };
      setCoursPdfs(newArr);
    }
  };

  const handleAddQuestionPdf = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = e.target.files;
    if (files && files[0]) {
      const newArr = [...questionPdfs];
      newArr[idx] = { ...newArr[idx], file: files[0] };
      setQuestionPdfs(newArr);
    }
  };

  const handleAddSolutionPdf = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const files = e.target.files;
    if (files && files[0]) {
      const newArr = [...solutionPdfs];
      newArr[idx] = { ...newArr[idx], file: files[0] };
      setSolutionPdfs(newArr);
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <h2>Créer un cours</h2>
      <label htmlFor='courseTitle'>Titre du cours:</label>
      <input
        type='text'
        placeholder='Titre du cours'
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
      />
      <br />
      <label htmlFor='courseDescription'>Description du cours:</label>
      <textarea
        placeholder='Description du cours'
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        required
      />
      <br />

      <h4>Ajouter des PDFs de cours</h4>
      {coursPdfs.map((pdf, idx) => (
        <div key={idx}>
          <input
            type='text'
            placeholder='Titre du PDF de cours'
            value={pdf.title}
            onChange={(e) => {
              const arr = [...coursPdfs];
              arr[idx].title = e.target.value;
              setCoursPdfs(arr);
            }}
            required
          />
          <input
            type='file'
            accept='application/pdf'
            onChange={(e) => handleAddCoursePdf(e, idx)}
            required
          />
          <button
            type='button'
            onClick={() => setCoursPdfs(coursPdfs.filter((_, i) => i !== idx))}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={() => setCoursPdfs([...coursPdfs, { file: undefined as any, title: "" }])}
      >
        Ajouter un PDF de cours
      </button>

      <h4>Ajouter des PDFs de questions</h4>
      {questionPdfs.map((pdf, idx) => (
        <div key={idx}>
          <input
            type='text'
            placeholder='Titre du PDF de question'
            value={pdf.title}
            onChange={(e) => {
              const arr = [...questionPdfs];
              arr[idx].title = e.target.value;
              setQuestionPdfs(arr);
            }}
            required
          />
          <input
            type='file'
            accept='application/pdf'
            onChange={(e) => handleAddQuestionPdf(e, idx)}
            required
          />
          <button
            type='button'
            onClick={() => setQuestionPdfs(questionPdfs.filter((_, i) => i !== idx))}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={() => setQuestionPdfs([...questionPdfs, { file: undefined as any, title: "" }])}
      >
        Ajouter un PDF de question
      </button>
      <br />

      <h4>Ajouter des PDFs de solutions</h4>
      {solutionPdfs.map((pdf, idx) => (
        <div key={idx}>
          <input
            type='text'
            placeholder='Titre du PDF de solution'
            value={pdf.title}
            onChange={(e) => {
              const arr = [...solutionPdfs];
              arr[idx].title = e.target.value;
              setSolutionPdfs(arr);
            }}
            required
          />
          <input
            type='file'
            accept='application/pdf'
            onChange={(e) => handleAddSolutionPdf(e, idx)}
            required
          />
          <button
            type='button'
            onClick={() => setSolutionPdfs(solutionPdfs.filter((_, i) => i !== idx))}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={() => setSolutionPdfs([...solutionPdfs, { file: undefined as any, title: "" }])}
      >
        Ajouter un PDF de solution
      </button>
      <br />

      <h4>Ajouter des vidéos</h4>
      <input
        type='text'
        placeholder='Titre de la vidéo'
        value={videoTitle}
        onChange={(e) => setVideoTitle(e.target.value)}
      />
      <input
        type='text'
        placeholder='URL de la vidéo'
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <button
        type='button'
        onClick={() => {
          if (videoTitle && videoUrl) {
            setVideos([...videos, { title: videoTitle, url: videoUrl }]);
            setVideoTitle("");
            setVideoUrl("");
          }
        }}
      >
        Ajouter une vidéo
      </button>
      <ul>
        {videos.map((v, i) => (
          <li key={i}>
            {v.title} - {v.url}
          </li>
        ))}
      </ul>
      <br />
      <input
        type='text'
        placeholder='Titre du quizz (optionnel)'
        value={quizzTitle}
        onChange={(e) => setQuizzTitle(e.target.value)}
      />
      {quizzTitle && (
        <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
          <h4>Ajouter des questions au quizz</h4>
          <input
            type='text'
            placeholder='Question'
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
          />
          <br />
          {currentChoices.map((choice, idx) => (
            <input
              key={idx}
              type='text'
              placeholder={`Choix ${idx + 1}`}
              value={choice}
              onChange={(e) => {
                const newChoices = [...currentChoices];
                newChoices[idx] = e.target.value;
                setCurrentChoices(newChoices);
              }}
              style={{ marginRight: 5 }}
            />
          ))}
          <br />
          <input
            type='text'
            placeholder="Réponse correcte (doit correspondre à l'un des choix)"
            value={currentCorrect}
            onChange={(e) => setCurrentCorrect(e.target.value)}
          />
          <button
            type='button'
            onClick={() => {
              if (
                currentQuestion &&
                currentChoices.every((c) => c) &&
                currentCorrect &&
                currentChoices.includes(currentCorrect)
              ) {
                setQuestions([
                  ...questions,
                  {
                    question: currentQuestion,
                    choices: currentChoices,
                    correctAnswer: currentCorrect,
                  },
                ]);
                setCurrentQuestion("");
                setCurrentChoices(["", "", "", ""]);
                setCurrentCorrect("");
              }
            }}
            style={{ marginLeft: 10 }}
          >
            Ajouter une question
          </button>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>
                <b>{q.question}</b>
                <ul>
                  {q.choices.map((c, j) => (
                    <li key={j} style={{ color: c === q.correctAnswer ? "green" : undefined }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <br />
      <label>Sélectionner un ou plusieurs packs :</label>
      <select
        multiple
        value={packIds}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (option) => option.value);
          setPackIds(selected);
        }}
        required
        style={{ width: "100%", minHeight: 80 }}
      >
        {packs.map((pack) => (
          <option key={pack.id} value={pack.id}>
            {pack.name}
          </option>
        ))}
      </select>
      <br />
      <button type='submit'>Créer</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default CreateCourseForm;
