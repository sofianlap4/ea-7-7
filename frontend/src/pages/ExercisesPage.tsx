import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudentPackExercices } from "../api/exercices";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    fetchStudentPackExercices(token)
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          setExercises(response.data);
        } else {
          setError(response.error || "Failed to fetch exercises");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch exercises");
        setLoading(false);
      });
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "title",
        headerName: "Title",
        width: 220,
        renderCell: (params) => (
          <span
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={() => navigate(`/student/exercice/${params.row.id}`)}
          >
            {params.value}
          </span>
        ),
      },
      { field: "description", headerName: "Description", width: 400 },
      {
        field: "themes",
        headerName: "Themes",
        width: 250,
        valueFormatter: (params: { value: any }) => {
          const themes = params || [];
          return Array.isArray(themes) && themes.length > 0
            ? themes.map((theme: any) => theme.title).join(", ")
            : "";
        },
      },
    ],
    [navigate]
  );

  return (
    <div>
      <h2>My Exercises</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div style={{ width: "100%", minHeight: 400, background: "#fff", marginTop: 16 }}>
          <DataGrid
            rows={exercises}
            columns={columns}
            getRowId={(row) => row.id}
            loading={false}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
          />
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
