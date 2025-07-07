import React, { useEffect, useState, useMemo } from "react";
import { fetchMyPack, fetchMyUsage } from "../api/packs";
import { fetchMyPackTransactions } from "../api/profile";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

const MyPack: React.FC = () => {
  const [pack, setPack] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [displayTransactions, setDisplayTransactions] = useState<any[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  useEffect(() => {
    fetchMyPack().then((response) => {
      if (response.success) {
        setPack(response.data);
      } else {
        setPack(null);
        console.error("Error fetching pack:", response.error);
      }
    });
    fetchMyUsage().then((response) => {
      if (response.success) {
        setUsage(response.data);
      } else {
        setUsage(null);
        console.error("Error fetching usage:", response.error);
      }
    });
    fetchMyPackTransactions().then((response) => {
      if (response.success) {
        setTransactions(response.data || []);
        // Preprocess for display
        setDisplayTransactions(
          (response.data || []).map((tx: any) => ({
            id: tx.id,
            amount: tx.amount,
            packName: tx.pack?.name || "Unknown Pack",
            createdAt: new Date(tx.createdAt as string).toLocaleDateString(),
          }))
        );
      } else {
        setTransactions([]);
        setDisplayTransactions([]);
        console.error("Error fetching transactions:", response.error);
      }
    });
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "amount", headerName: "Amount", width: 120 },
      {
        field: "packName",
        headerName: "Pack",
        width: 180,
      },
      {
        field: "createdAt",
        headerName: "Date",
        width: 180,
      },
    ],
    []
  );

  return (
    <div>
      <h2>My Pack</h2>
      {usage && usage.showUsage && (
        <div style={{ marginBottom: 16, background: "#f8f8f8", padding: 8 }}>
          <h4>Your Usage This Month:</h4>
          <ul>
            <li>
              <strong>Exercises Submited:</strong> {usage.exercisesSubmited}{" "}
              {usage.exerciseLimit !== undefined && usage.exerciseLimit !== null
                ? `/ ${usage.exerciseLimit}`
                : ""}{" "}
              {usage.exercisesLeft !== null && usage.exercisesLeft !== undefined
                ? `(Left: ${usage.exercisesLeft})`
                : ""}
            </li>
            <li>
              <strong>Code Runs:</strong> {usage.codeRuns}{" "}
              {usage.codeRunLimit !== undefined && usage.codeRunLimit !== null
                ? `/ ${usage.codeRunLimit}`
                : ""}{" "}
              {usage.codeRunsLeft !== null && usage.codeRunsLeft !== undefined
                ? `(Left: ${usage.codeRunsLeft})`
                : ""}
            </li>
            <li>
              <strong>Live Sessions Joined:</strong> {usage.liveSessionsJoined}{" "}
              {usage.liveSessionLimit !== undefined && usage.liveSessionLimit !== null
                ? `/ ${usage.liveSessionLimit}`
                : ""}
            </li>
          </ul>
        </div>
      )}
      {pack ? (
        <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <h3>{pack.name}</h3>
          <p>{pack.description}</p>
          <h4>Features & Limits:</h4>
          <ul>
            {pack.features &&
              Object.entries(pack.features).map(([key, value]) => (
                <li key={key}>
                  <strong>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                  </strong>{" "}
                  {String(value)}
                </li>
              ))}
            {pack.durationMonths && (
              <li>
                <strong>Duration:</strong> {pack.durationMonths} month(s)
              </li>
            )}
            {pack.creditAmount && (
              <li>
                <strong>Credits:</strong> {pack.creditAmount}
              </li>
            )}
            {pack.maxUsers && (
              <li>
                <strong>Max Users:</strong> {pack.maxUsers}
              </li>
            )}
            {pack.durationMonths && pack.startDate && (
              <li>
                <strong>Expires On:</strong>{" "}
                {new Date(pack.endDate).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </li>
            )}
          </ul>
          <h4>Courses:</h4>
          <ul>
            {pack.courses?.map((c: any) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>You have no active pack.</p>
      )}
      <h4>Pack Purchase History</h4>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={{ width: "100%", minHeight: 400, background: "#fff" }}>
          <DataGrid
            rows={displayTransactions}
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

export default MyPack;
