import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddVideoForm from "./AddVideoForm";
import { fetchCourseById } from "../api/courses";
import { fetchProfile } from "../api/profile";
import { fetchVideosByCourse } from "../api/videos";
import { fetchPdfsByCourse } from "../api/pdf";
import { fetchQuizzByCourseId, fetchQuestionsByQuizzId, submitQuizz } from "../api/quizz";
import { rankPoints } from "../utils/rankPoints";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

interface Course {
  id: string | number;
  title: string;
  description?: string;
}

interface Video {
  id?: string | number;
  _id?: string | number;
  title: string;
  url: string;
}

interface PDF {
  id?: string;
  title: string;
  fileUrl: string;
  type: "course" | "question" | "solution";
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [quizz, setQuizz] = useState<any>(null);
  const [questions, setQuestions] = useState<{
    toAnswer: any[];
    answeredCorrectly: any[];
  }>({
    toAnswer: [],
    answeredCorrectly: [],
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizzResult, setQuizzResult] = useState<any>(null);
  const [openPdfId, setOpenPdfId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile().then((response) => {
      if (response.success) {
        setRole(response.data?.role || null);
      } else {
        console.error("Error fetching profile:", response.error);
      }
    });

    fetchCourseById(id!).then((response) => {
      if (response.success) {
        if (response?.data.accessDenied) {
          setAccessDenied(true);
        } else if (response?.data) {
          setCourse(response?.data);
        }
      } else {
        console.error("Error fetching course:", response.error);
        setCourse(null);
      }
    });

    fetchVideosByCourse(id!).then((response) => {
      if (response.success) {
        if (response?.data.accessDenied) {
          setAccessDenied(true);
          setVideos([]);
        } else if (Array.isArray(response?.data)) {
          setVideos(response?.data);
        } else if (Array.isArray(response?.data.videos)) {
          setVideos(response?.data.videos);
        } else {
          setVideos([]);
        }
      } else {
        console.error("Error fetching videos:", response.error);
        setVideos([]);
      }
    });

    fetchPdfsByCourse(id!).then((response) => {
      if (response.success && Array.isArray(response.data)) {
        setPdfs(response.data);
      } else {
        setPdfs([]);
      }
    });

    // Fetch quizz and questions
    if (!id) return;
    fetchQuizzByCourseId(id).then((response) => {
      if (response.success) {
        if (response?.data && response?.data.id) {
          setQuizz(response?.data);
          fetchQuestionsByQuizzId(response?.data.id).then((qs: any) => {
            setQuestions({ toAnswer: Array.isArray(qs.data.toAnswer) ? qs.data.toAnswer : [], answeredCorrectly: Array.isArray(qs.data.answeredCorrectly) ? qs.data.answeredCorrectly : [] });
          });
        } else {
          setQuizz(null);
          setQuestions({ toAnswer: [], answeredCorrectly: [] });
        }
      } else {
        console.error("Error fetching quizz:", response.error);
        setQuizz(null);
        setQuestions({ toAnswer: [], answeredCorrectly: [] });
      }
    });
  }, [id]);

  const refreshVideos = () => {
    fetchVideosByCourse(id!).then((response) => {
      if (response.success) {
        if (Array.isArray(response?.data)) {
          setVideos(response?.data);
        } else {
          setVideos([]);
        }
      } else {
        console.error("Error fetching videos:", response.error);
        setVideos([]);
      }
    });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuizz = async () => {
    const response = await submitQuizz(id!, answers);

    if (response.success) {
      setQuizzResult(response?.data);
    } else {
      console.error("Error submitting quizz:", response.error);
      setQuizzResult({ success: false, error: response.error });
    }
  };

  if (accessDenied && role && role === "student") {
    return <div>You must be enrolled to view this course content.</div>;
  }

  if (!course) return <div>Loading...</div>;

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      {/* PDFs */}
      <h3>PDFs</h3>
      {pdfs.length === 0 && <p>Pas de PDFs pour ce cours.</p>}
      <ul>
        {pdfs.map((pdf) => (
          <li key={pdf.id}>
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
              <>
                <button
                  type="button"
                  onClick={() => setOpenPdfId(openPdfId === pdf.id ? null : pdf.id as string)}
                  style={{ marginLeft: 8 }}
                >
                  See PDF
                </button>
                {openPdfId === pdf.id && (
                  <div style={{ marginTop: 8 }}>
                    <iframe
                      src={pdf.fileUrl.startsWith("http") ? pdf.fileUrl : backendUrl + pdf.fileUrl}
                      width="100%"
                      height="600px"
                      style={{ border: "1px solid #ccc" }}
                      title={pdf.title}
                    />
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Videos */}
      <h3>Vidéos</h3>
      <ul>
        {(!Array.isArray(videos) || videos.length === 0) && <li>Pas de vidéos pour le moment.</li>}
        {Array.isArray(videos) &&
          videos.map((video) => (
            <li key={video._id ?? video.id}>
              <div>
                <strong>{video.title}</strong>
                <br />
                {video.url.includes("vimeo.com") ? (
                  <iframe
                    id={`vimeo-player-${video.url.split("/").pop()}`}
                    src={`https://player.vimeo.com/video/${video.url.split("/").pop()}`}
                    width='320'
                    height='180'
                    frameBorder='0'
                    allow='autoplay; fullscreen'
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                ) : (
                  <a href={video.url} target='_blank' rel='noopener noreferrer'>
                    {video.url}
                  </a>
                )}
              </div>
            </li>
          ))}
      </ul>
      {role !== "student" && <AddVideoForm courseId={id!} onAdd={refreshVideos} />}

      {/* Quizz and Questions */}
      {quizz && questions && (questions.toAnswer || questions.answeredCorrectly) && (
        <div style={{ marginTop: 32, border: "1px solid #ccc", padding: 16 }}>
          <h3>Quizz: {quizz.title}</h3>
          <p>Testez vos connaissances en répondant au quiz après avoir suivi le cours !</p>
          <ul>
            <li>
              Chaque réussite vous rapporte +{rankPoints.QuizzQuestionPassed} points au classement.
            </li>
            <li>
              Vous pouvez le refaire autant de fois que vous le souhaitez, mais vous ne gagnerez des
              points qu'une seule fois par question.
            </li>
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitQuizz();
            }}
          >
            {/* Questions to answer */}
            {questions.toAnswer &&
              questions.toAnswer.map((q: any) => (
                <div key={q.id} style={{ marginBottom: 16 }}>
                  <div>
                    <b>{q.question}</b>
                  </div>
                  {Array.isArray(q.choices) &&
                    q.choices.map((choice: string, idx: number) => (
                      <label key={idx} style={{ display: "block", marginLeft: 16 }}>
                        <input
                          type='checkbox'
                          checked={answers[q.id] === choice}
                          onChange={() => handleAnswerChange(q.id, choice)}
                        />
                        {choice}
                      </label>
                    ))}
                </div>
              ))}

            {/* Questions already answered correctly */}
            {questions.answeredCorrectly &&
              questions.answeredCorrectly.map((q: any) => (
                <div key={q.id} style={{ marginBottom: 16, color: "green", opacity: 0.7 }}>
                  <div>
                    <b>{q.question}</b> <span style={{ fontStyle: "italic" }}>(déjà réussi)</span>
                  </div>
                  {Array.isArray(q.choices) &&
                    q.choices.map((choice: string, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          marginLeft: 16,
                          fontWeight: choice === q.correctAnswer ? "bold" : undefined,
                        }}
                      >
                        {choice}
                        {choice === q.correctAnswer && " ✔"}
                      </div>
                    ))}
                </div>
              ))}

            {questions.toAnswer && questions.toAnswer.length > 0 && (
              <button type='submit'>Submit Quizz</button>
            )}
          </form>
          {quizzResult && (
            <div style={{ marginTop: 16 }}>
              {quizzResult.success ? (
                <span style={{ color: "green" }}>{quizzResult.message}</span>
              ) : quizzResult.error ? (
                <span style={{ color: "red" }}>{quizzResult.error}</span>
              ) : (
                <div style={{ color: "red" }}>
                  Incorrect answers:
                  <ul>
                    {quizzResult.incorrectAnswers?.map((ia: any, idx: number) => (
                      <li key={idx}> Question: {ia.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
