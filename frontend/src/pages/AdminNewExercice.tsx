import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCreateExercice } from "../api/exercices";
import { addPdfToExercise } from "../api/pdf";
import { addVideoToExercise } from "../api/videos";

const AdminNewExercice: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAddVideo = () => {
    setVideoLinks([...videoLinks, ""]);
  };

  const handleVideoChange = (index: number, value: string) => {
    const updated = [...videoLinks];
    updated[index] = value;
    setVideoLinks(updated);
  };

  const handleRemoveVideo = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFiles(Array.from(e.target.files));
    }
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
      for (const pdf of pdfFiles) {
        await addPdfToExercise(exerciseId, {
          title: pdf.name,
          file: pdf,
          type: "question"
        }, token);
      }
      for (const link of videoLinks) {
        if (link) await addVideoToExercise(exerciseId, {
          title: link,
          url: link,
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
            {pdfFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <label>Video Links:</label>
          {videoLinks.map((link, idx) => (
            <div key={idx}>
              <input
                type="text"
                value={link}
                onChange={e => handleVideoChange(idx, e.target.value)}
                placeholder="Paste video URL"
                style={{ width: 300 }}
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
