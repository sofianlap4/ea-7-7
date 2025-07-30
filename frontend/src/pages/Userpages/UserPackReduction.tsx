import React, { useEffect, useState } from "react";
import { fetchUserPackReductions } from "../../api/packReduction";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

interface UserPackReduction {
  id: string;
  user: { id: string; email: string; firstName?: string; lastName?: string };
  userPack: {
    id: string;
    pack: { id: string; name: string };
    offer: { id: string; durationMonths: number; price: number };
  };
  reductionCode: { id: string; code: string; percentage: number };
  createdAt: string;
}

const UserPackReductionList: React.FC = () => {
  const [reductions, setReductions] = useState<UserPackReduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReductions = async () => {
      setLoading(true);
      setError(null);
      const res = await fetchUserPackReductions();
      if (res.success && Array.isArray(res.data)) {
        setReductions(res.data);
      } else {
        setError(res.error || "Failed to fetch reductions.");
      }
      setLoading(false);
    };
    fetchReductions();
  }, []);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Prepare DataGrid rows
  const rows = reductions.map(r => ({
    id: r.id,
    utilisateur: `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim(),
    email: r.user?.email,
    pack: r.userPack?.pack?.name || "-",
    offre: r.userPack?.offer ? `${r.userPack.offer.durationMonths} months - ${r.userPack.offer.price} €` : "-",
    code: r.reductionCode?.code || "-",
    pourcentage: r.reductionCode?.percentage ?? "-",
    date: r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
  }));

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "utilisateur",
      headerName: "Utilisateur",
      width: 180,
      renderCell: (params) => (
        <span>
          {params.value}
          <br />
          <small>{params.row.email}</small>
        </span>
      ),
    },
    { field: "pack", headerName: "Pack", width: 140 },
    { field: "offre", headerName: "Offre", width: 180 },
    { field: "code", headerName: "Code de réduction", width: 150 },
    { field: "pourcentage", headerName: "Réduction (%)", width: 130 },
    { field: "date", headerName: "Date", width: 180 },
  ];

  return (
    <div>
      <h2>Utilisateurs ayant acheté des packs avec des codes de réduction</h2>
      {rows.length === 0 ? (
        <p>Aucune réduction trouvée.</p>
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

export default UserPackReductionList;