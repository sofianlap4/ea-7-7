import React, { useEffect, useState } from "react";
import { fetchUserPackReductions } from "../api/packs";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Users Who Bought Packs With Reduction Codes</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Pack</th>
            <th>Offer</th>
            <th>Reduction Code</th>
            <th>Reduction (%)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reductions.map((r) => (
            <tr key={r.id}>
              <td>
                {r.user.firstName || ""} {r.user.lastName || ""} <br />
                <small>{r.user.email}</small>
              </td>
              <td>{r.userPack?.pack?.name || "-"}</td>
              <td>
                {r.userPack?.offer
                  ? `${r.userPack.offer.durationMonths} months - ${r.userPack.offer.price} €`
                  : "-"}
              </td>
              <td>{r.reductionCode?.code || "-"}</td>
              <td>{r.reductionCode?.percentage ?? "-"}%</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserPackReductionList;