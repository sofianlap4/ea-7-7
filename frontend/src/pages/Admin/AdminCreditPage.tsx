import React, { useState, useEffect } from "react";
import { fetchAllCreditTransactions, addCreditToStudent } from "../../api/credit";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

const AdminCreditPage: React.FC = () => {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 10, page: 0 });
  const [displayRows, setDisplayRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    const response = await fetchAllCreditTransactions();
    if (!response.success) {
      setMessage(response.error || "Failed to load transactions.");
      setLoading(false);
      return;
    }
    setTransactions(Array.isArray(response?.data) ? response?.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setDisplayRows(
      (transactions || []).map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        amount: tx.amount,
        type: tx.type,
        attachmentUrl: tx.attachmentUrl,
        createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "",
      }))
    );
  }, [transactions]);

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const response = await addCreditToStudent(studentId, amount, attachmentUrl);
    if (response.success) {
      setMessage(RESPONSE_MESSAGES.CREDIT_ADDED);
      setStudentId("");
      setAmount("");
      setAttachmentUrl("");
      fetchTransactions();
    } else {
      setMessage(response.error || "Failed to add credit.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Admin: Add Credit to Student</h2>
      <form onSubmit={handleAddCredit} style={{ marginBottom: 24 }}>
        <div>
          <label>Student ID:</label>
          <input value={studentId} onChange={e => setStudentId(e.target.value)} required style={{ width: 300 }} />
        </div>
        <div>
          <label>Amount:</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: 100 }} />
        </div>
        <div>
          <label>Justification URL:</label>
          <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} placeholder="Google Drive or other URL" style={{ width: 400 }} />
        </div>
        <button type="submit">Add Credit</button>
      </form>
      {message && <div style={{ color: message.includes("success") ? "green" : "red" }}>{message}</div>}

      <h3>All Credit Transactions</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ width: "100%", minHeight: 400, marginTop: 12 }}>
          <DataGrid
            rows={displayRows}
            columns={[
              { field: "userId", headerName: "User ID", width: 150 },
              { field: "amount", headerName: "Amount", width: 120 },
              { field: "type", headerName: "Type", width: 150 },
              {
                field: "attachmentUrl",
                headerName: "Justification URL",
                width: 180,
                renderCell: (params) =>
                  params.value ? (
                    <a href={params.value} target="_blank" rel="noopener noreferrer">Voir</a>
                  ) : (
                    "-"
                  ),
                sortable: false,
                filterable: false,
              },
              { field: "createdAt", headerName: "Date", width: 180 },
            ]}
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
      )}
    </div>
  );
};

export default AdminCreditPage;