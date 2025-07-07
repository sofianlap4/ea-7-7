import React, { useEffect, useState } from "react";
import { fetchAllRankings, updateStudentRankingPoints } from "../api/leaderboard";

type User = {
  id: string;
  name?: string;
  email?: string;
};

type Ranking = {
  userId: string;
  points: number;
  currentRank: string;
  user?: User;
};

const ManageRankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPoints, setEditPoints] = useState<{ [userId: string]: number }>({});
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    fetchAllRankings(token).then((response: {success: boolean, error: any, data: Ranking[]}) => {
      if(response?.success) {
        setRankings(Array.isArray(response?.data) ? response?.data : []);
      } else {
        console.error("Failed to load rankings:", response?.error || "Unknown error");
      }
      setLoading(false);
    });
  }, [token]);

  const handleEdit = (userId: string, currentPoints: number) => {
    setEditPoints({ ...editPoints, [userId]: currentPoints });
  };

  const handleSave = async (userId: string) => {
    const points = editPoints[userId];
    await updateStudentRankingPoints(userId, points, token);
    setRankings(rankings.map(r => r.userId === userId ? { ...r, points } : r));
    const { [userId]: _, ...rest } = editPoints;
    setEditPoints(rest);
  };

  return (
    <div>
      <h2>Manage Student Rankings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Points</th>
              <th>Current Rank</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map(r => (
              <tr key={r.userId}>
                <td>{r.user?.name || r.userId}</td>
                <td>
                  {editPoints[r.userId] !== undefined ? (
                    <input
                      type="number"
                      value={editPoints[r.userId]}
                      onChange={e =>
                        setEditPoints({ ...editPoints, [r.userId]: Number(e.target.value) })
                      }
                      style={{ width: 60 }}
                    />
                  ) : (
                    r.points
                  )}
                </td>
                <td>{r.currentRank}</td>
                <td>
                  {editPoints[r.userId] !== undefined ? (
                    <button onClick={() => handleSave(r.userId)}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit(r.userId, r.points)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageRankingPage;