import React, { useState, useEffect } from "react";
import { fetchAllCreditTransactions, addCreditToStudent } from "../api/credit";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

const AdminCreditPage: React.FC = () => {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
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
        <table border={1} cellPadding={6} style={{ width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Justification URL</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.userId}</td>
                <td>{tx.amount}</td>
                <td>{tx.type}</td>
                <td>
                  {tx.attachmentUrl ? (
                    <a href={tx.attachmentUrl} target="_blank" rel="noopener noreferrer">Voir</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCreditPage;