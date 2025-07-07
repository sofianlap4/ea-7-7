import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  fetchAllLiveSessions,
  createLiveSession,
  updateLiveSession,
  fetchAllStudentLiveSesssionsByPack,
} from "../api/liveSessions";
import { useNavigate } from "react-router-dom";
import { fetchAllPacksAdmin } from "../api/packs";

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface LiveSession {
  id: string;
  title: string;
  description: string;
  date: string;
  meetLink: string;
  createdBy: string;
  packId: string;
}

interface Pack {
  id: string;
  name: string;
}

interface Props {
  userRole: string;
  token: string;
}

const LiveSessionsCalendar: React.FC<Props> = ({ userRole, token }) => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selected, setSelected] = useState<LiveSession | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", meetLink: "", packId: "" });
  const [message, setMessage] = useState("");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [calendarView, setCalendarView] = useState<View>("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const navigate = useNavigate();

  // Fetch sessions
  useEffect(() => {
    if (userRole === "student") {
      fetchAllStudentLiveSesssionsByPack(token).then((response) => {
        if (response?.success) {
          setSessions(Array.isArray(response?.data) ? response?.data : []);
        } else {
          console.error("Failed to load sessions:", response?.error || "Unknown error");
          setSessions([]);
        }
      });
    } else {
      fetchAllLiveSessions(token).then((response) => {
        if (response?.success) {
          setSessions(Array.isArray(response?.data) ? response?.data : []);
        } else {
          console.error("Failed to load sessions:", response?.error || "Unknown error");
          setSessions([]);
        }
      });
      fetchAllPacksAdmin().then((response) => {
        if (response?.success) {
          setPacks(Array.isArray(response?.data) ? response?.data : []);
        } else {
          setPacks([]);
        }
      });
    }
  }, [token, userRole]);

  // Convert sessions to calendar events
  const events = useMemo<RBCEvent[]>(
    () =>
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        start: new Date(s.date),
        end: new Date(new Date(s.date).getTime() + 60 * 60 * 1000), // 1h session
        resource: s,
      })),
    [sessions]
  );

  // Add or edit session
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    let ok = false;
    if (selected) {
      const res = await updateLiveSession(
        selected.id,
        { ...form },
        token
      );
      ok = res?.data && (res?.data?.id || res.success);
    } else {
      const res = await createLiveSession({ ...form }, token);
      ok = res?.data && (res?.data.id || res.success);
    }
    if (ok) {
      setShowForm(false);
      setSelected(null);
      setForm({ title: "", description: "", date: "", meetLink: "", packId: "" });
      fetchAllLiveSessions(token).then((response) => {
        if (response?.success) {
          setSessions(Array.isArray(response?.data) ? response?.data : []);
        } else {
          console.error("Failed to load sessions:", response?.error || "Unknown error");
          setSessions([]);
        }
      });
    } else {
      setMessage("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div>
      <h2>Calendrier des sessions en direct</h2>
      { userRole === "admin" || userRole === "superadmin" ? (
        <button
          onClick={() => {
            setShowForm(true);
            setSelected(null);
            setForm({ title: "", description: "", date: "", meetLink: "", packId: "" });
          }}
        >
          Ajouter une session
        </button>
      ) : null}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        style={{ height: 500, margin: "30px 0" }}
        view={calendarView}
        date={calendarDate}
        onView={setCalendarView}
        onNavigate={setCalendarDate}
        onSelectEvent={(event: any) => {
          navigate(`/live-sessions/${event.id}`);
        }}
        min={new Date(1970, 1, 1, 8, 0)} // 8:00 AM
        max={new Date(1970, 1, 1, 23, 0)} // 11:00 PM
      />
      {/* Only show the Add/Edit form inline */}
      {showForm && (
        <form
          onSubmit={handleSave}
          style={{ border: "1px solid #ccc", padding: 16, marginTop: 16 }}
        >
          <h3>{selected ? "Modifier" : "Ajouter"} une session</h3>
          <input
            required
            placeholder='Titre'
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            required
            placeholder='Description'
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            required
            type='datetime-local'
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            required
            placeholder='Google Meet Link'
            value={form.meetLink}
            onChange={(e) => setForm((f) => ({ ...f, meetLink: e.target.value }))}
            style={{ width: "100%", marginBottom: 8 }}
          />
          {/* Select pack for the session */}
          <label>Pack concerné :</label>
          <select
            required
            value={form.packId}
            onChange={(e) => setForm((f) => ({ ...f, packId: e.target.value }))}
            style={{ width: "100%", marginBottom: 8 }}
          >
            <option value="">Sélectionner un pack</option>
            {packs.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.name}
              </option>
            ))}
          </select>
          <button type='submit'>{selected ? "Enregistrer" : "Ajouter"}</button>
          <button
            type='button'
            onClick={() => {
              setShowForm(false);
            }}
            style={{ marginLeft: 8 }}
          >
            Annuler
          </button>
          {message && <div style={{ marginTop: 8, color: "red" }}>{message}</div>}
        </form>
      )}
    </div>
  );
};

export default LiveSessionsCalendar;
