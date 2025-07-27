import React, { useEffect, useState } from "react";
import { fetchMyCreditTransactions } from "../api/credit";
import SharedCreditTransactionTable from "./SharedCreditTransactionTable";

const StudentCreditHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const res = await fetchMyCreditTransactions(token);
      if (!res.success) {
        console.error("Failed to load transactions:", res.error || "Unknown error");
        setLoading(false);
        return;
      }
      setTransactions(Array.isArray(res?.data) ? res?.data : []);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>My Credit Transactions</h2>
      <SharedCreditTransactionTable transactions={transactions} loading={loading} />
    </div>
  );
};

export default StudentCreditHistoryPage;