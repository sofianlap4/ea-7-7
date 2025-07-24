import React, { useEffect, useState } from "react";
import { fetchAllRankings, updateStudentRankingPoints } from "../api/leaderboard";
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";

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

  // Prepare DataGrid rows
  const rows = rankings.map(r => ({
    id: r.userId,
    student: r.user?.name || r.userId,
    points: r.points,
    currentRank: r.currentRank,
  }));

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: "student", headerName: "Student", width: 200 },
    {
      field: "points",
      headerName: "Points",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const userId = params.row.id;
        return editPoints[userId] !== undefined ? (
          <input
            type="number"
            value={editPoints[userId]}
            onChange={e =>
              setEditPoints({ ...editPoints, [userId]: Number(e.target.value) })
            }
            style={{ width: 60 }}
          />
        ) : (
          params.value
        );
      },
    },
    { field: "currentRank", headerName: "Current Rank", width: 150 },
    {
      field: "edit",
      headerName: "Edit",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const userId = params.row.id;
        return editPoints[userId] !== undefined ? (
          <button onClick={() => handleSave(userId)}>Save</button>
        ) : (
          <button onClick={() => handleEdit(userId, params.row.points)}>Edit</button>
        );
      },
    },
  ];

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });

  return (
    <div>
      <h2>Manage Student Rankings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ width: "100%", minHeight: 400 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={row => row.id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
            sx={{ background: "#fff" }}
          />
        </div>
      )}
    </div>
  );
};

export default ManageRankingPage;