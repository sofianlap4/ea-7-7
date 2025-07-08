import React, { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddVideoForm from "./AddVideoForm";
import { fetchCourseById } from "../api/courses";
import { fetchProfile } from "../api/profile";
import { fetchVideosByCourse } from "../api/videos"; // <-- import here
import { fetchQuizzByCourseId, fetchQuestionsByQuizzId, submitQuizz } from "../api/quizz"; // Add these imports

const backendUrl = process.env.REACT_APP_BACKEND_URL;

interface Course {
  id: string | number;
  title: string;
  description?: string;
  pdfUrl?: string;
  pdfOriginalName?: string;
}

interface Video {
  id?: string | number;
  _id?: string | number;
  title: string;
  url: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [quizz, setQuizz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizzResult, setQuizzResult] = useState<any>(null);

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
          setVideos([]); // <-- always set to []
        } else if (Array.isArray(response?.data)) {
          setVideos(response?.data);
        } else if (Array.isArray(response?.data.videos)) {
          setVideos(response?.data.videos);
        } else {
          setVideos([]); // fallback
        }
      } else {
        console.error("Error fetching videos:", response.error);
        setVideos([]);
      }
    });

    // Fetch quizz and questions
    if (!id) return;
    fetchQuizzByCourseId(id).then((response) => {
      if (response.success) {
          if (response?.data && response?.data.id) {
            setQuizz(response?.data);
            fetchQuestionsByQuizzId(response?.data.id).then((qs: any) => {
              setQuestions(Array.isArray(qs) ? qs : []);
            });
          } else {
            setQuizz(null);
            setQuestions([]);
          }
      } else {
        console.error("Error fetching quizz:", response.error);
        setQuizz(null);
        setQuestions([]);
      }
    });
  }, [id]);

  const refreshVideos = () => {
    fetchVideosByCourse(id!).then(response => {
      if (response.success) {
        if (Array.isArray(response?.data)) {
          setVideos(response?.data);
        } else {
          setVideos([]); // fallback
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
      {course.pdfUrl && (
        <div>
          {/* <p>
            <a href={course.pdfUrl} target='_blank' rel='noopener noreferrer'>
              Download: {course.pdfOriginalName || "Course PDF"}
            </a>
          </p> */}
          <iframe
            src={backendUrl + course.pdfUrl}
            title={course.pdfOriginalName || "Course PDF"}
            width='100%'
            height='600px'
            style={{ border: "1px solid #ccc", marginTop: "1em" }}
          ></iframe>
        </div>
      )}

      <h3>Videos</h3>
      <ul>
        {(!Array.isArray(videos) || videos.length === 0) && <li>Pas de videos pour le moment.</li>}
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

      {/* ...inside your return, after the videos section... */}
      {quizz && questions.length > 0 && (
        <div style={{ marginTop: 32, border: "1px solid #ccc", padding: 16 }}>
          <h3>Quizz: {quizz.title}</h3>
          <p>Testez vos connaissances en répondant au quiz après avoir suivi le cours !</p>
          <ul>
            <li>Chaque réussite vous rapporte +5 points au classement.</li>
            <li>
              Vous pouvez le refaire autant de fois que vous le souhaitez, mais dès que vous
              réussissez, il ne sera plus accessible."
            </li>
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitQuizz();
            }}
          >
            {questions.map((q) => (
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
                        // Only allow one checkbox per question
                      />
                      {choice}
                    </label>
                  ))}
              </div>
            ))}
            <button type='submit'>Submit Quizz</button>
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
                      <li key={idx}>Question: {ia.question}</li>
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
