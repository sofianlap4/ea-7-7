import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchExercices,
  fetchDeleteExercice,
} from "../api/exercices";

const AdminExercice: React.FC = () => {
  const [exercices, setExercices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    fetchExercices(token)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setExercices(res.data);
        } else {
          setError(res.error || "Failed to fetch exercices");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch exercices");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token") || "";
    if (window.confirm("Are you sure you want to delete this exercice?")) {
      const res = await fetchDeleteExercice(id, token);
      if (res.success) {
        setExercices(exercices.filter(e => e.id !== id));
      } else {
        alert(res.error || "Failed to delete exercice");
      }
    }
  };

  return (
    <div>
      <h2>Admin: Exercices</h2>
      <button onClick={() => navigate("/admin/exercices/new")}>Add New Exercice</button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%", marginTop: 16 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercices.map(ex => (
              <tr key={ex.id}>
                <td>
                  <span
                    style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                    onClick={() => navigate(`/admin/exercices/edit/${ex.id}`)}
                  >
                    {ex.title}
                  </span>
                </td>
                <td>{ex.description}</td>
                <td>
                  <button onClick={() => navigate(`/admin/exercices/edit/${ex.id}`)}>Edit</button>
                  <button onClick={() => handleDelete(ex.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


export default AdminExercice;