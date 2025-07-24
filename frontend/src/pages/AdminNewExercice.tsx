import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCreateExercice } from "../api/exercices";
import { addPdfToExercise } from "../api/pdf";
import { addVideoToExercise } from "../api/videos";

const AdminNewExercice: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [pdfInputs, setPdfInputs] = useState<{ file: File; title: string; type: string }[]>([]);
  const [videoInputs, setVideoInputs] = useState<{ url: string; title: string }[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAddVideo = () => {
    setVideoInputs([...videoInputs, { url: "", title: "" }]);
  };

  const handleVideoInputChange = (idx: number, field: "url" | "title", value: string) => {
    setVideoInputs(videoInputs.map((video, i) => i === idx ? { ...video, [field]: value } : video));
  };

  const handleRemoveVideo = (idx: number) => {
    setVideoInputs(videoInputs.filter((_, i) => i !== idx));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPdfInputs(files.map(file => ({ file, title: file.name, type: "question" })));
    }
  };

  const handlePdfInputChange = (idx: number, field: "title" | "type", value: string) => {
    setPdfInputs(pdfInputs.map((pdf, i) => i === idx ? { ...pdf, [field]: value } : pdf));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("token") || "";
    // 1. Create the exercise
    const res = await fetchCreateExercice(formData, token);
    if (res.success && res.data && res.data.id) {
      const exerciseId = res.data.id;
      for (const pdf of pdfInputs) {
        await addPdfToExercise(exerciseId, {
          title: pdf.title,
          file: pdf.file,
          type: pdf.type
        }, token);
      }
      for (const video of videoInputs) {
        if (video.url) await addVideoToExercise(exerciseId, {
          title: video.title,
          url: video.url,
          free: false
        });
      }
      setMessage("Exercice created successfully!");
      setTimeout(() => navigate("/admin/exercices"), 1000);
    } else {
      setMessage(res.error || "Failed to create exercice");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Add New Exercice</h2>
      <form onSubmit={handleSubmit}>
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
          <label>Upload PDFs (question/solution):</label>
          <input type="file" multiple accept="application/pdf" onChange={handlePdfChange} />
          <ul>
            {pdfInputs.map((pdf, idx) => (
              <li key={idx}>
                <input
                  type="text"
                  value={pdf.title}
                  onChange={e => handlePdfInputChange(idx, "title", e.target.value)}
                  placeholder="PDF Title"
                  required
                />
                <select value={pdf.type} onChange={e => handlePdfInputChange(idx, "type", e.target.value)}>
                  <option value="question">Question</option>
                  <option value="solution">Solution</option>
                </select>
                {pdf.file.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label>Video Links:</label>
          {videoInputs.map((video, idx) => (
            <div key={idx}>
              <input
                type="text"
                value={video.url}
                onChange={e => handleVideoInputChange(idx, "url", e.target.value)}
                placeholder="Paste video URL"
                style={{ width: 300 }}
                required
              />
              <input
                type="text"
                value={video.title}
                onChange={e => handleVideoInputChange(idx, "title", e.target.value)}
                placeholder="Video Title"
                style={{ width: 200, marginLeft: 8 }}
                required
              />
              <button type="button" onClick={() => handleRemoveVideo(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={handleAddVideo}>Add Video</button>
        </div>
        <button type="submit" disabled={loading}>Create Exercice</button>
        <button type="button" onClick={() => navigate("/admin/exercices")}>Cancel</button>
      </form>
      {message && <div style={{ color: message.includes("success") ? "green" : "red" }}>{message}</div>}
    </div>
  );
};

export default AdminNewExercice;
