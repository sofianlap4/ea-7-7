import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudentPackExercices, fetchPreviewPaidExercices } from "../api/exercices";
import { fetchUserActivePackStatus } from "../api/users";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";


const ExercicesPage: React.FC<{ token: string; userId: string }> = ({ token, userId }) => {
  const [exercices, setExercices] = useState<any[]>([]);
  const [premiumExercices, setPremiumExercices] = useState<any[]>([]);
  const [isFreeVersion, setIsFreeVersion] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const status = await fetchUserActivePackStatus(userId, token);
        if (status.success && status.data) {
          setIsFreeVersion(status.data.freeVersion === true);
          if (status.data.freeVersion === true) {
            const [freeRes, premiumRes] = await Promise.all([
              fetchStudentPackExercices(token),
              fetchPreviewPaidExercices(token),
            ]);
            setExercices(Array.isArray(freeRes.data) ? freeRes.data : []);
            setPremiumExercices(
              Array.isArray(premiumRes.data)
                ? premiumRes.data.map((ex: { Packexercice?: { exerciceId?: string }; id?: string }) => ({
                    ...ex,
                    id: ex.Packexercice?.exerciceId || ex.id || Math.random().toString(36).substr(2, 9),
                  }))
                : []
            );
          } else {
            const freeRes = await fetchStudentPackExercices(token);
            setExercices(Array.isArray(freeRes.data) ? freeRes.data : []);
            setPremiumExercices([]);
          }
        } else {
          setIsFreeVersion(null);
          setExercices([]);
          setPremiumExercices([]);
        }
      } catch (err) {
        setError("Failed to fetch exercices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "title", headerName: "Titre", width: 220 },
      { field: "description", headerName: "Description", width: 400 },
    ],
    []
  );

  return (
    <div>
      <h2>Mes Exercices</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <>
          {isFreeVersion && (
            <>
              <h3>Exercices gratuits :</h3>
              <ul>
                {exercices.map((ex) => (
                  <li key={ex.id}>
                    <a href={`/student/exercice/${ex.id}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                      <strong>{ex.title}</strong>
                    </a>: {ex.description}
                  </li>
                ))}
              </ul>

              <h3>Exercices premium (disponibles avec un pack payant) :</h3>
              <div style={{ width: "100%", minHeight: 400, background: "#fff", marginTop: 16 }}>
                <DataGrid
                  rows={premiumExercices}
                  columns={columns}
                  getRowId={(row) => row.Packexercice?.exerciceId || row.id}
                  loading={false}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 20, 50]}
                  autoHeight
                  disableRowSelectionOnClick
                />
              </div>
              <p style={{ marginTop: 16, color: "#555" }}>
                Ces exercices incluent des solutions PDF et vidéo. Passez à un pack payant pour y accéder.
              </p>
              <button
                style={{ marginTop: 12, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 18px", cursor: "pointer", fontWeight: 500 }}
                onClick={() => navigate("/packs")}
              >
                Découvrir les packs premium
              </button>
            </>
          )}

          {!isFreeVersion && (
            <>
              <h3>Exercices :</h3>
              <div style={{ width: "100%", minHeight: 400, background: "#fff", marginTop: 16 }}>
                <DataGrid
                  rows={exercices}
                  columns={columns}
                  getRowId={(row) => row.Packexercice?.exerciceId || row.id}
                  loading={false}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 20, 50]}
                  autoHeight
                  disableRowSelectionOnClick
                  onRowClick={(params) => {
                    const exerciceId = params.row.Packexercice?.exerciceId || params.row.id;
                    navigate(`/student/exercice/${exerciceId}`);
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ExercicesPage;
