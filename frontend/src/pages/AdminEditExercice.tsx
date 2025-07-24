import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExerciceById, fetchUpdateExercice } from "../api/exercices";
import { fetchPdfsByExercise, addPdfToExercise, editPdfOfExercise, deletePdfOfExercise } from "../api/pdf";
import { fetchVideosByExercise, addVideoToExercise, editVideoOfExercise, deleteVideoOfExercise } from "../api/videos";

const AdminEditExercice: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);
  const [newVideoLinks, setNewVideoLinks] = useState<string[]>([]);
  const [pdfsToDelete, setPdfsToDelete] = useState<string[]>([]);
  const [videosToDelete, setVideosToDelete] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    fetchExerciceById(exerciseId!, token)
      .then(res => {
        if (res.success && res.data) {
          setFormData({
            title: res.data.title || "",
            description: res.data.description || "",
          });
        } else {
          setError(res.error || "Failed to fetch exercice");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch exercice");
        setLoading(false);
      });
  }, [exerciseId]);

  useEffect(() => {
    if (exerciseId) {
      fetchPdfsByExercise(exerciseId).then(res => {
        if (res && Array.isArray(res.data)) setPdfs(res.data || []);
      });
      fetchVideosByExercise(exerciseId).then(res => {
        if (res && Array.isArray(res.data)) setVideos(res.data || []);
      });
    }
  }, [exerciseId]);

  const handleAddPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPdfFiles(Array.from(e.target.files));
    }
  };

  const handleAddVideo = () => {
    setNewVideoLinks([...newVideoLinks, ""]);
  };

  const handleVideoChange = (idx: number, value: string) => {
    const updated = [...newVideoLinks];
    updated[idx] = value;
    setNewVideoLinks(updated);
  };

  const handleRemoveNewVideo = (idx: number) => {
    setNewVideoLinks(newVideoLinks.filter((_, i) => i !== idx));
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfsToDelete([...pdfsToDelete, pdfId]);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideosToDelete([...videosToDelete, videoId]);
  };

  const handleEditPdf = (pdfId: string, title: string) => {
    setPdfs(pdfs.map(pdf => pdf.id === pdfId ? { ...pdf, title } : pdf));
  };

  const handleEditVideo = (videoId: string, title: string, url: string) => {
    setVideos(videos.map(video => video.id === videoId ? { ...video, title, url } : video));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    const token = localStorage.getItem("token") || "";
    // Update exercise
    const res = await fetchUpdateExercice(exerciseId!, formData, token);
    let success = res.success;
    // Delete marked PDFs
    for (const pdfId of pdfsToDelete) {
      await deletePdfOfExercise(pdfId, token);
    }
    // Delete marked Videos
    for (const videoId of videosToDelete) {
      await deleteVideoOfExercise(videoId, token);
    }
    // Edit PDFs
    for (const pdf of pdfs) {
      if (pdf.edited) {
        await editPdfOfExercise(pdf.id, { title: pdf.title }, token);
      }
    }
    // Edit Videos
    for (const video of videos) {
      if (video.edited) {
        await editVideoOfExercise(video.id, { title: video.title, url: video.url });
      }
    }
    // Add new PDFs
    for (const pdf of newPdfFiles) {
      await addPdfToExercise(exerciseId!, { title: pdf.name, file: pdf, type: "question" }, token);
    }
    // Add new Videos
    for (const link of newVideoLinks) {
      if (link) await addVideoToExercise(exerciseId!, { title: link, url: link, free: false });
    }
    if (success) {
      alert("Exercice updated successfully");
      navigate("/admin/exercices");
    } else {
      alert(res.error || "Failed to update exercice");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!formData) return null;

  return (
    <div>
      <h2>Edit Exercice</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Current PDFs:</label>
          <ul>
            {pdfs.map(pdf => (
              <li key={pdf.id}>
                <input
                  type="text"
                  value={pdf.title}
                  onChange={e => { handleEditPdf(pdf.id, e.target.value); pdf.edited = true; }}
                />
                <button type="button" onClick={() => handleDeletePdf(pdf.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label>Add New PDFs:</label>
          <input type="file" multiple accept="application/pdf" onChange={handleAddPdf} />
          <ul>
            {newPdfFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <label>Current Videos:</label>
          <ul>
            {videos.map(video => (
              <li key={video.id}>
                <input
                  type="text"
                  value={video.title}
                  onChange={e => { handleEditVideo(video.id, e.target.value, video.url); video.edited = true; }}
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={video.url}
                  onChange={e => { handleEditVideo(video.id, video.title, e.target.value); video.edited = true; }}
                  placeholder="URL"
                />
                <button type="button" onClick={() => handleDeleteVideo(video.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label>Add New Videos:</label>
          {newVideoLinks.map((link, idx) => (
            <div key={idx}>
              <input
                type="text"
                value={link}
                onChange={e => handleVideoChange(idx, e.target.value)}
                placeholder="Paste video URL"
                style={{ width: 300 }}
              />
              <button type="button" onClick={() => handleRemoveNewVideo(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={handleAddVideo}>Add Video</button>
        </div>
        <button type="submit">Update Exercice</button>
        <button type="button" onClick={() => navigate("/admin/exercices")}>Cancel</button>
      </form>
    </div>
  );
};

export default AdminEditExercice;
