import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStudentExerciceById } from "../api/exercices";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ExercisesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPdfId, setOpenPdfId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    fetchStudentExerciceById(id!, token)
      .then((response) => {
        if (response.success && response.data) {
          setExercise(response.data);
        } else {
          setError(response.error || "Failed to fetch exercise");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch exercise");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!exercise) return <div>No exercise found.</div>;

  const pdfs = Array.isArray(exercise.pdfs) ? exercise.pdfs : [];
  const videos = Array.isArray(exercise.videos) ? exercise.videos : [];

  return (
    <div>
      <h2>Exercise Details</h2>
      <h3>Title : {exercise.title}</h3>
      <p>description: {exercise.description}</p>
      {/* PDFs */}
      <h3>PDFs</h3>
      {pdfs.length === 0 && <p>No PDFs for this exercise.</p>}
      <ul>
        {pdfs.map((pdf: any) => (
          <li key={pdf.id}>
            <b>
              {pdf.type === "question"
                ? "Question"
                : pdf.type === "solution"
                ? "Solution"
                : "Other"}
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
      <h3>Videos</h3>
      <ul>
        {videos.length === 0 && <li>No videos for this exercise.</li>}
        {videos.map((video: any) => (
          <li key={video.id}>
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
    </div>
  );
};

export default ExercisesDetailPage;
