import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllPracticalexercices,
  deletePracticalexercice,
  updatePracticalexercice,
  createPracticalexercice,
} from "../../api/practicalExercices";
import { fetchAllPacksAdmin } from "../../api/packs";
import { fetchAllThemes } from "../../api/theme";

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

const AdminPracticalexercices: React.FC = () => {
  const [allPacks, setAllPacks] = useState<{ id: string; name: string }[]>([]);
  const [allThemes, setAllThemes] = useState<{ id: string; title: string }[]>([]);
  const [exercices, setExercices] = useState<Practicalexercice[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    language: "python" | "javascript" | "sql";
    starterCode: string;
    solution: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
    packIds: string[];
    themeIds: string[];
    hidden: boolean;
  }>({
    title: "",
    description: "",
    difficulty: "easy",
    language: "python",
    starterCode: "",
    solution: "",
    testCases: [{ input: "", expectedOutput: "" }],
    packIds: [],
    themeIds: [],
    hidden: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetchAllPracticalexercices(token)
      .then((reponse) => {
        if (reponse?.success) {
          setExercices(reponse?.data);
        } else {
          console.error("Failed to load exercices:", reponse?.error || "Unknown error");
          setExercices([]);
        }
      })
      .catch(() => setExercices([]));

    fetchAllPacksAdmin()
      .then((response) => {
        if (response?.success) {
          setAllPacks(Array.isArray(response?.data) ? response?.data : []);
        } else {
          console.error("Failed to load packs:", response?.error || "Unknown error");
          setAllPacks([]);
        }
      })
      .catch(() => setAllPacks([]));

    fetchAllThemes()
      .then((response) => {
        if (response?.success) {
          setAllThemes(Array.isArray(response?.data) ? response?.data : []);
        } else {
          console.error("Failed to load themes:", response?.error || "Unknown error");
          setAllThemes([]);
        }
      })
      .catch(() => setAllThemes([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "";
      const response = await createPracticalexercice(formData, token);
      if (response.data && (response.success || response?.data?.id)) {
        setExercices([...exercices, response?.data]);
        setFormData({
          title: "",
          description: "",
          difficulty: "easy",
          language: "python",
          starterCode: "",
          solution: "",
          testCases: [{ input: "", expectedOutput: "" }],
          packIds: [],
          themeIds: [],
          hidden: false,
        });
      } else {
        alert(response?.error || "Failed to add exercice");
      }
    } catch (error) {
      console.error("Error adding exercice:", error);
      alert("Failed to add exercice");
    }
  };

  const navigate = useNavigate();
  const handleEdit = (exercice: Practicalexercice) => {
    navigate(`/admin/practical-exercices/edit/${exercice.id}`);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const updated = await updatePracticalexercice(
        editingId.toString(),
        formData,
        localStorage.getItem("token") || ""
      );
      if (!updated?.data || !(updated.success || updated?.data?.id)) {
        console.error(updated?.error || "Failed to update exercice");
        return;
      }
      setExercices(exercices.map((e) => (e.id === editingId ? updated?.data : e)));
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        difficulty: "easy",
        language: "python",
        starterCode: "",
        solution: "",
        testCases: [{ input: "", expectedOutput: "" }],
        packIds: [],
        themeIds: [],
        hidden: false,
      });
    } catch (err) {
      alert("Failed to update exercice");
    }
  };

  const handleToggleHide = async (exercice: Practicalexercice) => {
    try {
      const updated = await updatePracticalexercice(
        exercice.id.toString(),
        { ...exercice, hidden: !exercice.hidden },
        localStorage.getItem("token") || ""
      );
      if (updated?.success && updated.data) {
        setExercices(exercices.map((e) => (e.id === exercice.id ? updated.data : e)));
      } else {
        alert(updated?.error || "Failed to update exercice visibility");
      }
    } catch (err) {
      alert("Failed to update exercice visibility");
    }
  };

  return (
    <div className='admin-dashboard'>
      <h2>Gestion des Exercices Pratiques</h2>

      <form onSubmit={editingId ? handleUpdate : handleSubmit} className='exercice-form'>
        <div>
          <label>Title:</label>
          <input
            type='text'
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Difficulty:</label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })
            }
          >
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </select>
        </div>

        <div>
          <label>Language:</label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({
                ...formData,
                language: e.target.value as "python" | "javascript" | "sql",
              })
            }
          >
            <option value='python'>Python</option>
            <option value='javascript'>JavaScript</option>
            <option value='sql'>SQL</option>
          </select>
        </div>

        <div>
          <label>
            <input
              type='checkbox'
              checked={formData.hidden}
              onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
            />
            Hidden
          </label>
        </div>

        <div>
          <label>Packs associés :</label>
          <select
            multiple
            value={formData.packIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setFormData({ ...formData, packIds: selected });
            }}
            style={{ width: "100%", minHeight: 60 }}
          >
            {allPacks.map((pack) => (
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
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setFormData({ ...formData, themeIds: selected });
            }}
            style={{ width: "100%", minHeight: 60 }}
          >
            {allThemes.map((theme) => (
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
            onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
            required
            rows={20}
            cols={50}
          />
        </div>

        <div>
          <label>Solution:</label>
          <textarea
            value={formData.solution}
            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
            required
            rows={20}
            cols={50}
          />
        </div>

        <div>
          <label>Test Cases:</label>
          {formData.testCases.map((testCase, index) => (
            <div key={index} className='test-case'>
              <div>
                <label>Input:</label>
                <input
                  type='text'
                  value={testCase.input}
                  onChange={(e) => {
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
                  type='text'
                  value={testCase.expectedOutput}
                  onChange={(e) => {
                    const newTestCases = [...formData.testCases];
                    newTestCases[index].expectedOutput = e.target.value;
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  required
                />
              </div>
              <button
                type='button'
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
            type='button'
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

        <button type='submit'>{editingId ? "Update exercice" : "Add exercice"}</button>
        {editingId && (
          <button
            type='button'
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: "",
                description: "",
                difficulty: "easy",
                language: "python",
                starterCode: "",
                solution: "",
                testCases: [{ input: "", expectedOutput: "" }],
                packIds: [],
                themeIds: [],
                hidden: false,
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className='exercices-list'>
        <h3>Existing exercices</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Language</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercices.map((exercice) => (
              <tr key={exercice.id} style={exercice.hidden ? { opacity: 0.5 } : {}}>
                <td>{exercice.title}</td>
                <td>{exercice.difficulty}</td>
                <td>{exercice.language}</td>
                <td>
                  <button onClick={() => handleEdit(exercice)}>Edit</button>
                  <button onClick={() => handleToggleHide(exercice)}>
                    {exercice.hidden ? "Unhide" : "Hide"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPracticalexercices;
