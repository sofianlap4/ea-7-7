import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPackById, addStudentToPack, removeStudentFromPack } from "../api/packs";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

const AdminPackStudents: React.FC = () => {
  const { id: packId } = useParams<{ id: string }>();
  const [pack, setPack] = useState<any>(null);
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (packId) fetchPackById(packId).then(response => {
      if (response.success) {
        setPack(response.data);
      } else {
        setPack(null);
        console.error("Error fetching pack:", response.error);
      }
    });
  }, [packId]);

  const handleAdd = async () => {
    if (!packId) return;
    const response = await addStudentToPack(packId, studentId);
    if (response.success) {
      setMessage(RESPONSE_MESSAGES.STUDENT_ADDED);
      setStudentId(""); // Clear input after adding
    } else {
      setMessage(response.error || "Failed to add student.");
    }
    fetchPackById(packId).then(response => {
      if (response.success) {
        setPack(response.data);
      } else {
        console.error("Error fetching updated pack:", response.error);
      }
    });
  };

  const handleRemove = async (sid: string) => {
    if (!packId) return;
    const response = await removeStudentFromPack(packId, sid);
    if (response.success) {
      setMessage(RESPONSE_MESSAGES.STUDENT_REMOVED);
    } else {
      setMessage(response.error || "Failed to remove student.");
    }
    fetchPackById(packId).then(response => {
      if (response.success) {
        setPack(response.data);
      } else {
        console.error("Error fetching updated pack:", response.error);
      }
    });
  };

  return (
    <div>
      <h3>Students in this Pack</h3>
      <ul>
        {pack?.students.length > 0 ? (
          pack?.students?.map((s: any) => (
            <li key={s.id}>
              <strong>ID:</strong> {s.id} — ({s.email}) <button onClick={() => handleRemove(s.id)}>Remove</button>
            </li>
          ))
        ) : (
          <li>No students in this pack.</li>
        )}
      </ul>
      <input
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder='Student ID to add'
      />
      <button onClick={handleAdd}>Add Student</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminPackStudents;
