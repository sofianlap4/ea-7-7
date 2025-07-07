import React, { useEffect, useState } from "react";
import { fetchProfile, fetchUserSolutions, fetchMyRank } from "../api/profile";
import {
  fetchDivisionLeaderboard,
  fetchGlobalLeaderboard,
  fetchMyDivisionRanking,
  fetchMyGlobalRanking,
} from "../api/leaderboard";

const MyRankPage: React.FC = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rank, setRank] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [divisionLeaderboard, setDivisionLeaderboard] = useState<any[]>([]);
  const [showRankingInfo, setShowRankingInfo] = useState(false);
  const [myGlobalRanking, setMyGlobalRanking] = useState<any>(null);
  const [myDivisionRanking, setMyDivisionRanking] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const responseProfile = await fetchProfile();
      if (!responseProfile.success) {
        setError("Failed to load profile.");
        setLoading(false);
        return;
      }
      const userId = responseProfile?.data.id;
      const [solutionsData, rankData, globalLb, myGlobal, myDivision] = await Promise.all([
        fetchUserSolutions(userId),
        fetchMyRank(),
        fetchGlobalLeaderboard(),
        fetchMyGlobalRanking(),
        fetchMyDivisionRanking(),
      ]);
      const divisionLb = await fetchDivisionLeaderboard(
        rankData?.data?.currentRank || rankData?.data?.rank || "Junior Dev"
      );
      setSolutions(solutionsData?.data || []);
      setRank(rankData?.data?.currentRank || rankData?.data?.rank || null);
      setPoints(rankData?.data?.points ?? rankData?.data?.totalLikes ?? null);
      setGlobalLeaderboard(globalLb?.data || []);
      setDivisionLeaderboard(divisionLb?.data || []);
      setMyGlobalRanking(myGlobal?.data);
      setMyDivisionRanking(myDivision?.data);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Mon classement</h2>
      <button
        onClick={() => setShowRankingInfo((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "#007bff",
          cursor: "pointer",
          fontSize: 18,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
        }}
        aria-expanded={showRankingInfo}
        aria-controls='ranking-info'
      >
        {showRankingInfo ? "▼" : "▶"} Comment fonctionne le système de classement ?
      </button>
      {showRankingInfo && (
        <div id='ranking-info' style={{ marginBottom: 16 }}>
          <span role='img' aria-label='trophy'>
            🏆
          </span>{" "}
          <b>Divisions&nbsp;:</b>
          <br />
          Junior Dev : 0–19 points
          <br />
          Mid Dev : 20–49 points
          <br />
          Senior Dev : 50–99 points
          <br />
          Hacker : 100+ points
          <br />
          <b>Comment gagner des points&nbsp;?</b>
          <br />
          +1 point à chaque fois qu'un étudiant soumet un exercice résolu facile.
          <br />
          +3 point à chaque fois qu'un étudiant soumet un exercice résolu moyen.
          <br />
          +5 point à chaque fois qu'un étudiant soumet un exercice résolu difficile.
          <br />
          +5 points à chaque fois qu'un étudiant réussit un quizz.
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <strong>Division :</strong> {rank || "N/A"}
        {points !== null && (
          <span style={{ marginLeft: 16 }}>
            <strong>Points :</strong> {points}
          </span>
        )}
      </div>

      <h3>Top 10 global :</h3>
      <ol>
        {globalLeaderboard.map((user, idx) => (
          <li key={user.userId || idx}>
            {user.user?.firstName} {user.user?.lastName} — {user.points} pts ({user.currentRank})
          </li>
        ))}
      </ol>
      {myGlobalRanking && (
        <div style={{ marginBottom: 16, color: "#007bff" }}>
          <b>Votre position globale :</b> {myGlobalRanking.position} / {myGlobalRanking.total}{" "}
          &nbsp;
          <b>
            ({myGlobalRanking.points} pts, {myGlobalRanking.currentRank})
          </b>
        </div>
      )}

      <h3>Top 10 de ma division ({rank})</h3>
      <ol>
        {divisionLeaderboard.map((user, idx) => (
          <li key={user.userId || idx}>
            {user.user?.firstName} {user.user?.lastName} — {user.points} pts
          </li>
        ))}
      </ol>
      {myDivisionRanking && (
        <div style={{ marginBottom: 16, color: "#007bff" }}>
          <b>Votre position dans la division :</b> {myDivisionRanking.position} /{" "}
          {myDivisionRanking.total} &nbsp;
          <b>
            ({myDivisionRanking.points} pts, {myDivisionRanking.currentRank})
          </b>
        </div>
      )}

      <h2>Mes solutions</h2>
      {solutions.length === 0 && <div>Aucune solution trouvée.</div>}
      {solutions.map((sol) => (
        <div key={sol.id} style={{ border: "1px solid #ccc", margin: 12, padding: 12 }}>
          <div>
            <strong>Exercice :</strong> {sol.exercise?.title}
          </div>
          <div>{sol.exercise?.description}</div>
          <pre style={{ background: "#f8f8f8", padding: 8 }}>{sol.code}</pre>
          <div>
            <strong>Likes :</strong> {sol.likes}
          </div>
          <div>
            <strong>Soumis le :</strong> {new Date(sol.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRankPage;
