import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAdminExercices,
  fetchDeleteExercice,
} from "../api/exercices";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

const AdminExercice: React.FC = () => {
  const [exercices, setExercices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const loadExercices = () => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    fetchAdminExercices(token)
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
  };

  useEffect(() => {
    loadExercices();
  }, [location]);

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

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "title", headerName: "Title", width: 220, renderCell: (params) => (
        <span
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
          onClick={() => navigate(`/admin/exercices/edit/${params.row.id}`)}
        >
          {params.value}
        </span>
      ) },
      { field: "description", headerName: "Description", width: 400 },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <>
            <button onClick={() => navigate(`/admin/exercices/edit/${params.row.id}`)}>Edit</button>
            <button style={{ marginLeft: 8 }} onClick={() => handleDelete(params.row.id)}>Delete</button>
          </>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div>
      <h2>Admin: Exercices</h2>
      <button onClick={() => navigate("/admin/exercices/new")}>Add New Exercice</button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div style={{ width: "100%", minHeight: 400, background: "#fff", marginTop: 16 }}>
          <DataGrid
            rows={exercices}
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


export default AdminExercice;