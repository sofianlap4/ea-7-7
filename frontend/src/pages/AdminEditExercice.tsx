import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExerciceById, fetchUpdateExercice } from "../api/exercices";

const AdminEditExercice: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    const token = localStorage.getItem("token") || "";
    const res = await fetchUpdateExercice(exerciseId!, formData, token);
    if (res.success) {
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
        <button type="submit">Update Exercice</button>
        <button type="button" onClick={() => navigate("/admin/exercices")}>Cancel</button>
      </form>
    </div>
  );
};

export default AdminEditExercice;
