import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PracticalExercicesPage.css";
import { fetchRandomPracticalexercice, fetchPracticalexerciceCountForUserPack } from "../../api/practicalExercices";
import { fetchUserActivePackStatus } from "../../api/users";
import { fetchThemesByPackId } from "../../api/theme";
import { fetchMyPack } from "../../api/packs";

interface Practicalexercice {
  id: number;
  title: string;
  description: string; // Problem statement/instructions
  difficulty: string;
  language: "python" | "javascript" | "sql";
  starterCode: string; // Initial code template
  solution: string; // Correct solution (optional)
  testCases: Array<{
    input: string;
    expectedOutput: string;
    explanation?: string; // Optional explanation for the test case
  }>;
}

//const LANGUAGES = ["python", "javascript", "sql"];
const LANGUAGES = ["python"];
const DIFFICULTIES = ["easy", "medium", "hard"];

interface PracticalexercicesPageProps {
  userId?: string;
}

const PracticalexercicesPage: React.FC<PracticalexercicesPageProps> = ({ userId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  const [themes, setThemes] = useState<any[]>([]);
  const [randomexercice, setRandomexercice] = useState<Practicalexercice | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [myPackId, setMyPackId] = useState<string>("");
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);
  const [exerciceCounts, setexerciceCounts] = useState<{ total: number; paidVersionTotal: number }>({ total: 0, paidVersionTotal: 0 });
  const [isFreeVersion, setIsFreeVersion] = useState<boolean | null>(null);

  const navigate = useNavigate();

  // Fetch user's packId, themes, exercice counts, and freeVersion status
  useEffect(() => {
    const fetchPackAndThemes = async () => {
      const packRes = await fetchMyPack();
      if (packRes && packRes.success && packRes.data && packRes.data.id) {
        setMyPackId(packRes.data.id);
        const themesRes = await fetchThemesByPackId(packRes.data.id);
        if (themesRes && themesRes.success) setThemes(themesRes.data);

        // Fetch exercice counts
        const token = localStorage.getItem("token") || "";
        const countsRes = await fetchPracticalexerciceCountForUserPack(token);
        console.log(countsRes)
        if (countsRes && countsRes.success && countsRes.data) {
          setexerciceCounts(countsRes.data);
        }

        // Fetch freeVersion status
        if (userId) {
          const userStatus = await fetchUserActivePackStatus(userId, token);
          if (userStatus && userStatus.success && userStatus.data) {
            setIsFreeVersion(userStatus.data.freeVersion === true);
          }
        }
      }
    };
    fetchPackAndThemes();
  }, []);

  const handleFetchRandom = async () => {
    setLoading(true);
    setError("");
    setRandomexercice(null);
    const token = localStorage.getItem("token") || "";
    const ex = await fetchRandomPracticalexercice(
      selectedDifficulty,
      selectedLanguage,
      selectedThemeIds,
      token
    );
    if (ex && ex.success) {
      setRandomexercice(ex?.data);
    } else {
      setRandomexercice(null);
      setError(ex?.error || "No exercice found for these filters.");
    }
    setLoading(false);
  };

  // Fetch a random exercice when the page loads
  useEffect(() => {
    handleFetchRandom();
  }, []);

  return (
    <div className='practical-exercices-page'>
      <h2>exercices Pratiques</h2>

      {/* Show exercice counts and CTA for freeVersion users */}
      {isFreeVersion === true && (
        <div style={{ marginBottom: 16, background: '#f7f7f7', border: '1px solid #ddd', borderRadius: 6, padding: 16 }}>
          <div><strong>Exercices disponibles avec votre pack gratuit :</strong> {exerciceCounts.total}</div>
          <div><strong>Exercices disponibles avec la version payante :</strong> {exerciceCounts.paidVersionTotal}</div>
          <button style={{ marginTop: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/packs')}>
            Découvrir les packs premium
          </button>
        </div>
      )}
      {isFreeVersion === false && (
        <div style={{ marginBottom: 16, background: '#f7f7f7', border: '1px solid #ddd', borderRadius: 6, padding: 16 }}>
          <div><strong>Exercices disponibles :</strong> {exerciceCounts.total}</div>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label>
          Language:&nbsp;
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            {/* <option value=''>All</option> */}
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;
        <label>
          Difficulte:&nbsp;
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value=''>All</option>
            {DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;
        <label>
          Thèmes:&nbsp;
          <select
            multiple
            value={selectedThemeIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setSelectedThemeIds(selected);
            }}
            disabled={themes.length === 0}
            style={{ minHeight: 60 }}
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.title}
              </option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;
        <button onClick={handleFetchRandom} disabled={loading}>
          Suivant
        </button>
      </div>

      {error && <div className='error-message'>{error}</div>}

      {loading && <div>Loading...</div>}

      {randomexercice && (
        <div
          className='exercice-item'
          style={{ border: "1px solid #ccc", padding: 16, marginBottom: 16 }}
        >
          <strong>{randomexercice.title}</strong>
          <p>{randomexercice.description}</p>
          <span className='badge'>{randomexercice.difficulty}</span>
          <span className='badge'>{randomexercice.language}</span>
          <br />
          <button
            style={{ marginTop: 8 }}
            onClick={() => navigate(`/practical-exercices/${randomexercice.id}`)}
          >
            Essayer
          </button>
        </div>
      )}

      {!randomexercice && !loading && !error && (
        <div style={{ marginBottom: 16 }}>
          <span>
            Select language and difficulty, then click "Suivant" to get a random exercice.
          </span>
        </div>
      )}
    </div>
  );
};

export default PracticalexercicesPage;
