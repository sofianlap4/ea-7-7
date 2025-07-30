import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchexerciceApi,
  updatePracticalexercice,
} from "../../api/practicalExercices";
import { fetchAllPacksAdmin } from "../../api/packs";
import { fetchAllThemes } from "../../api/theme";
import { fetchPracticalexercicePackIds, fetchPracticalexerciceThemeIds } from "../../api/practicalExercicesAssociations";

interface Practicalexercice {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  language: "python" | "javascript" | "sql";
  starterCode: string;
  solution: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
  packIds?: string[];
  themeIds?: string[];
  hidden: boolean;
}

const AdminEditPracticalExercice: React.FC = () => {
  const { exerciceId } = useParams<{ exerciceId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Practicalexercice | null>(null);
  const [allPacks, setAllPacks] = useState<{ id: string; name: string }[]>([]);
  const [allThemes, setAllThemes] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    setError(null);

    Promise.all([
      fetchexerciceApi(exerciceId!, token),
      fetchAllPacksAdmin(),
      fetchAllThemes(),
      fetchPracticalexerciceThemeIds(exerciceId!, token), // new API call
      fetchPracticalexercicePackIds(exerciceId!, token),  // new API call
    ])
      .then(([exerciceRes, packsRes, themesRes, themeIdsRes, packIdsRes]) => {
        if (exerciceRes?.success && exerciceRes.data) {
          setFormData({
            ...exerciceRes.data,
            packIds: packIdsRes?.data || [],
            themeIds: themeIdsRes?.data || [],
            hidden: !!exerciceRes.data.hidden,
          });
        } else {
          setError("Failed to load exercice");
        }
        if (packsRes?.success) {
          setAllPacks(Array.isArray(packsRes?.data) ? packsRes?.data : []);
        }
        if (themesRes?.success) {
          setAllThemes(Array.isArray(themesRes?.data) ? themesRes?.data : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [exerciceId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      const token = localStorage.getItem("token") || "";
      const response = await updatePracticalexercice(exerciceId!, formData, token);
      if (response?.success && response.data) {
        alert("exercice updated successfully");
        navigate("/admin/practical-exercices");
      } else {
        alert(response?.error || "Failed to update exercice");
      }
    } catch (err) {
      alert("Failed to update exercice");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!formData) return null;

  return (
    <div className="admin-dashboard">
      <h2>Edit Practical exercice</h2>
      <form onSubmit={handleUpdate} className="exercice-form">
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
          <label>Difficulty:</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label>Language:</label>
          <select
            value={formData.language}
            onChange={e => setFormData({ ...formData, language: e.target.value as "python" | "javascript" | "sql" })}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.hidden}
              onChange={e => setFormData({ ...formData, hidden: e.target.checked })}
            />
            Hidden
          </label>
        </div>
        <div>
          <label>Packs associés :</label>
          <select
            multiple
            value={formData.packIds}
            onChange={e => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, packIds: selected });
            }}
            style={{ width: "100%", minHeight: 60 }}
          >
            {allPacks.map(pack => (
              <option key={pack.id} value={pack.id}>
                {pack.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Thèmes associés :</label>
          <select
            multiple
            value={formData.themeIds}
            onChange={e => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, themeIds: selected });
            }}
            style={{ width: "100%", minHeight: 60 }}
          >
            {allThemes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Starter Code:</label>
          <textarea
            value={formData.starterCode}
            onChange={e => setFormData({ ...formData, starterCode: e.target.value })}
            required
            rows={10}
            cols={50}
          />
        </div>
        <div>
          <label>Solution:</label>
          <textarea
            value={formData.solution}
            onChange={e => setFormData({ ...formData, solution: e.target.value })}
            required
            rows={10}
            cols={50}
          />
        </div>
        <div>
          <label>Test Cases:</label>
          {formData.testCases.map((testCase, index) => (
            <div key={index} className="test-case">
              <div>
                <label>Input:</label>
                <input
                  type="text"
                  value={testCase.input}
                  onChange={e => {
                    const newTestCases = [...formData.testCases];
                    newTestCases[index].input = e.target.value;
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  required
                />
              </div>
              <div>
                <label>Expected Output:</label>
                <input
                  type="text"
                  value={testCase.expectedOutput}
                  onChange={e => {
                    const newTestCases = [...formData.testCases];
                    newTestCases[index].expectedOutput = e.target.value;
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newTestCases = formData.testCases.filter((_, i) => i !== index);
                  setFormData({ ...formData, testCases: newTestCases });
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                testCases: [...formData.testCases, { input: "", expectedOutput: "" }],
              });
            }}
          >
            Add Test Case
          </button>
        </div>
        <button type="submit">Update exercice</button>
        <button type="button" onClick={() => navigate("/admin/practical-exercices")}>Cancel</button>
      </form>
    </div>
  );
};

export default AdminEditPracticalExercice;
