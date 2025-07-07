import React, { useState, useEffect } from "react";
import {
  fetchAllPracticalExercises,
  deletePracticalExercise,
  updatePracticalExercise,
  createPracticalExercise,
} from "../api/practicalExercices";
import { fetchAllPacksAdmin } from "../api/packs";
import { fetchAllThemes } from "../api/theme";

interface PracticalExercise {
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

const AdminPracticalExercises: React.FC = () => {
  const [allPacks, setAllPacks] = useState<{ id: string; name: string }[]>([]);
  const [allThemes, setAllThemes] = useState<{ id: string; title: string }[]>([]);
  const [exercises, setExercises] = useState<PracticalExercise[]>([]);
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
    fetchAllPracticalExercises(token)
      .then((reponse) => {
        if (reponse?.success) {
          setExercises(reponse?.data);
        } else {
          console.error("Failed to load exercises:", reponse?.error || "Unknown error");
          setExercises([]);
        }
      })
      .catch(() => setExercises([]));

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
      const response = await createPracticalExercise(formData, token);
      if (response.data && (response.success || response?.data?.id)) {
        setExercises([...exercises, response?.data]);
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
        alert(response?.error || "Failed to add exercise");
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert("Failed to add exercise");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) return;
    try {
      const res = await deletePracticalExercise(id.toString(), localStorage.getItem("token") || "");
      // Check if the response indicates success (e.g., success: true or status 200)
      if (res?.data && res.success) {
        setExercises(exercises.filter((e) => e.id !== id));
      } else {
        alert(res?.error || "Failed to delete exercise");
      }
    } catch (err) {
      alert("Failed to delete exercise");
    }
  };

  const handleEdit = (exercise: PracticalExercise) => {
    setEditingId(exercise.id);
    setFormData({
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      language: exercise.language,
      starterCode: exercise.starterCode,
      solution: exercise.solution,
      testCases: exercise.testCases,
      packIds: exercise.packIds || [],
      themeIds: exercise.themeIds || [],
      hidden: !!exercise.hidden,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const updated = await updatePracticalExercise(
        editingId.toString(),
        formData,
        localStorage.getItem("token") || ""
      );
      if (!updated?.data || !(updated.success || updated?.data?.id)) {
        console.error(updated?.error || "Failed to update exercise");
        return;
      }
      setExercises(exercises.map((e) => (e.id === editingId ? updated?.data : e)));
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
      alert("Failed to update exercise");
    }
  };

  const handleToggleHide = async (exercise: PracticalExercise) => {
    try {
      const updated = await updatePracticalExercise(
        exercise.id.toString(),
        { ...exercise, hidden: !exercise.hidden },
        localStorage.getItem("token") || ""
      );
      if (updated?.success && updated.data) {
        setExercises(exercises.map((e) => (e.id === exercise.id ? updated.data : e)));
      } else {
        alert(updated?.error || "Failed to update exercise visibility");
      }
    } catch (err) {
      alert("Failed to update exercise visibility");
    }
  };

  return (
    <div className='admin-dashboard'>
      <h2>Gestion des Exercices Pratiques</h2>

      <form onSubmit={editingId ? handleUpdate : handleSubmit} className='exercise-form'>
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

        <button type='submit'>{editingId ? "Update Exercise" : "Add Exercise"}</button>
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

      <div className='exercises-list'>
        <h3>Existing Exercises</h3>
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
            {exercises.map((exercise) => (
              <tr key={exercise.id} style={exercise.hidden ? { opacity: 0.5 } : {}}>
                <td>{exercise.title}</td>
                <td>{exercise.difficulty}</td>
                <td>{exercise.language}</td>
                <td>
                  <button onClick={() => handleEdit(exercise)}>Edit</button>
                  <button onClick={() => handleToggleHide(exercise)}>
                    {exercise.hidden ? "Unhide" : "Hide"}
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

export default AdminPracticalExercises;
