import * as React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  attachmentUrl?: string;
  createdAt: string;
  [key: string]: any;
}

interface Props {
  transactions: CreditTransaction[];
  loading?: boolean;
}

const columns: GridColDef[] = [
  { field: "amount", headerName: "Amount", width: 120 },
  { field: "type", headerName: "Type", width: 150 },
  {
    field: "attachmentUrl",
    headerName: "Justification URL",
    width: 180,
    renderCell: (params) =>
      params.value ? (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          Voir
        </a>
      ) : (
        "-"
      ),
    sortable: false,
    filterable: false,
  },
  { field: "createdAt", headerName: "Date", width: 180 },
];

const SharedCreditTransactionTable: React.FC<Props> = ({ transactions, loading }) => {
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const [displayRows, setDisplayRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    setDisplayRows(
      (transactions || []).map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        attachmentUrl: tx.attachmentUrl,
        createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "",
      }))
    );
  }, [transactions]);

  return (
    <div style={{ width: "100%", minHeight: 400 }}>
      <DataGrid
        rows={displayRows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20, 50]}
        autoHeight
        disableRowSelectionOnClick
        sx={{ background: "#fff" }}
      />
    </div>
  );
};

export default SharedCreditTransactionTable;