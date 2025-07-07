import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchLiveSession,
  joinLiveSession,
  fetchLiveSessionLog,
  deleteLiveSession,
} from "../api/liveSessions";

const LiveSessionDetail: React.FC<{ userRole: string; token: string }> = ({ userRole, token }) => {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLiveSession(id, token).then((response) => {
        if (response.success) {
          setSession(response.data);
          setMeetLink(response.data.meetLink || null);
        } else {
          setMessage(response.error || "Erreur lors de la récupération de la session.");
        }
      });
      // Check if student has already joined
      fetchLiveSessionLog(id, token).then((response) => {
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        setAlreadyJoined(
          Array.isArray(response?.data) && response?.data.some((log: any) => log.userId === userId)
        );
      });
    }
  }, [id, token]);

  const handleJoin = async () => {
    if (!session) return;
    setMessage("");
    setMeetLink(null);
    const response = await joinLiveSession(session.id, token);
    if (response.success) {
      setMessage(response?.data.message);
      setMeetLink(response?.data.meetLink);
      setAlreadyJoined(true);
    } else {
      setMessage(response.error || response?.data.message || "Impossible de rejoindre la session.");
      setMeetLink(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette session en direct ?")) return;
    const data = await deleteLiveSession(session.id, token);
    if (data.success) {
      setMessage("Session supprimée.");
      // Optionally redirect or update UI
      setTimeout(() => (window.location.href = "/live-sessions"), 1200);
    } else {
      setMessage(data.error || "Erreur lors de la suppression.");
    }
  };

  if (!session) return <div>Chargement...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>
        Sujet: {session.title}
      </h2>
      <p>Description: {session.description}</p>
      <p>Date: {new Date(session.date).toLocaleString()}</p>
      {userRole !== "admin" && userRole !== "superadmin" && (
        <>
          {alreadyJoined || meetLink ? (
            <div style={{ marginTop: 8 }}>
              <label>
                Lien Google Meet:&nbsp;
                <a href={meetLink || session.meetLink} target='_blank' rel='noopener noreferrer'>
                  {meetLink || session.meetLink}
                </a>
              </label>
              <div style={{ marginTop: 8, color: "green" }}>
                Rejoignez la session selon l'heure précise :{" "}
                <b>
                  {new Date(session.date).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </b>
                <br />
                On vous attend !!
              </div>
            </div>
          ) : (
            <button onClick={handleJoin}>Rejoindre</button>
          )}
        </>
      )}
      <br />
      {["admin", "superadmin"].includes(userRole) && (
        <div style={{ marginTop: 16 }}>
          <label>
            Lien Google Meet:&nbsp;
            <a href={meetLink || session.meetLink} target='_blank' rel='noopener noreferrer'>
              {meetLink || session.meetLink}
            </a>
          </label>
          <br />
          <button
            style={{ background: "red", color: "white", marginBottom: 16 }}
            onClick={handleDelete}
          >
            Supprimer la session
          </button>
        </div>
      )}
      {message && <div style={{ marginTop: 8, color: "red" }}>{message}</div>}
    </div>
  );
};

export default LiveSessionDetail;
