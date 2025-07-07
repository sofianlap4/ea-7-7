import React, { useEffect, useState } from "react";
import {
  fetchReductionCodes,
  createReductionCode,
  updateReductionCode,
  deleteReductionCode,
} from "../api/packReduction";
import { fetchAllPacksAdmin } from "../api/packs";
import UserPackReductionList from "./UserPackReduction";

const AdminReductionCodeList: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    description: "",
    percentage: 0,
    isActive: true,
    packIds: [] as string[],
  });
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [codesRes, packsRes] = await Promise.all([
      fetchReductionCodes(),
      fetchAllPacksAdmin(),
    ]);
    setCodes(codesRes.data || []);
    setPacks((packsRes.data || []).filter((p: any) => !p.freeVersion));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateReductionCode(editId, form);
    } else {
      await createReductionCode(form);
    }
    setForm({ code: "", description: "", percentage: 0, isActive: true, packIds: [] });
    setEditId(null);
    load();
  };

  const handleEdit = (code: any) => {
    setEditId(code.id);
    setForm({
      code: code.code,
      description: code.description || "",
      percentage: code.percentage,
      isActive: code.isActive,
      packIds: code.packs?.map((p: any) => p.id) || [],
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this reduction code?")) {
      await deleteReductionCode(id);
      load();
    }
  };

  return (
    <div>
      <h2>Reduction Codes</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <label htmlFor="code">Code</label>
            <input
              placeholder="Code"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              required
            />
            <br />
            <label htmlFor="description">Description</label>
            <input
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <br />
            <label htmlFor="percentage">Percentage</label>
            <input
              type="number"
              placeholder="Percentage"
              value={form.percentage}
              min={1}
              max={100}
              onChange={e => setForm(f => ({ ...f, percentage: Number(e.target.value) }))}
              required
            />
            <br />
            <label>
              Active
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
            </label>
            <br />
            <label>
              Packs:
              <select
                multiple
                value={form.packIds}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    packIds: Array.from(e.target.selectedOptions, opt => opt.value),
                  }))
                }
              >
                {packs.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <button type="submit">{editId ? "Update" : "Create"}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ code: "", description: "", percentage: 0, isActive: true, packIds: [] }); }}>
                Cancel
              </button>
            )}
          </form>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Percentage</th>
                <th>Active</th>
                <th>Packs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => (
                <tr key={code.id}>
                  <td>{code.code}</td>
                  <td>{code.description}</td>
                  <td>{code.percentage}%</td>
                  <td>{code.isActive ? "Yes" : "No"}</td>
                  <td>
                    {(code.packs || []).map((p: any) => p.name).join(", ")}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(code)}>Edit</button>
                    <button onClick={() => handleDelete(code.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>List of reductions Codes</h3>

          <UserPackReductionList />
        </>
      )}
    </div>
  );
};

export default AdminReductionCodeList;