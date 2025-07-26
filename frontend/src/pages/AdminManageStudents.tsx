import React, { useEffect, useState, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { fetchUsers, fetchUserById, updateUserById, revokeUserRefreshTokens, archiveUser } from "../api/users";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

const AdminManageStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchUsers("student").then((data) => {
      if (data.success && Array.isArray(data.data)) setStudents(data.data);
      setLoading(false);
    });
  }, []);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", width: 220 },
      { field: "firstName", headerName: "First Name", width: 150 },
      { field: "lastName", headerName: "Last Name", width: 150 },
      { field: "email", headerName: "Email", width: 220 },
      { field: "phone", headerName: "Phone", width: 150 },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        renderCell: (params) => (
          <Button size="small" onClick={() => handleSelectStudent(params.row)}>View</Button>
        ),
      },
    ],
    []
  );

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setEditData(student);
    setEditMode(false);
    setMsg("");
  };

  const handleEdit = () => setEditMode(true);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const data = await updateUserById(selectedStudent.id, editData);
    if (data.success) {
      setMsg("Updated successfully");
      setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? { ...s, ...editData } : s)));
      setEditMode(false);
    } else {
      setMsg(data.error || "Update failed");
    }
  };

  const handleRevoke = async () => {
    const data = await revokeUserRefreshTokens(selectedStudent.id);
    setMsg(data.success ? "Refresh tokens revoked" : data.error || "Failed to revoke");
  };

  const handleArchive = async () => {
    const data = await archiveUser(selectedStudent.id);
    if (data.success) {
      setMsg("User archived successfully");
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setTimeout(() => setSelectedStudent(null), 1000);
    } else {
      setMsg(data.error || "Failed to archive user");
    }
  };

  return (
    <div>
      <h2>Manage Students</h2>
      <div style={{ height: 500, width: "100%", background: "#fff" }}>
        <DataGrid rows={students} columns={columns} getRowId={(row) => row.id} loading={loading} />
      </div>
      <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <>
              <TextField label="First Name" name="firstName" value={editData.firstName || ""} onChange={handleEditChange} fullWidth margin="normal" disabled={!editMode} />
              <TextField label="Last Name" name="lastName" value={editData.lastName || ""} onChange={handleEditChange} fullWidth margin="normal" disabled={!editMode} />
              <TextField label="Email" name="email" value={editData.email || ""} onChange={handleEditChange} fullWidth margin="normal" disabled={!editMode} />
              <TextField label="Phone" name="phone" value={editData.phone || ""} onChange={handleEditChange} fullWidth margin="normal" disabled={!editMode} />
              {msg && <div style={{ color: msg.includes('success') ? 'green' : 'red' }}>{msg}</div>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!editMode && <Button onClick={handleEdit}>Edit</Button>}
          {editMode && <Button onClick={handleSave}>Save</Button>}
          <Button onClick={handleRevoke} color="warning">Revoke Refresh Tokens</Button>
          <Button onClick={handleArchive} color="error">Archive User</Button>
          <Button onClick={() => setSelectedStudent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminManageStudents;
