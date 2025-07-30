import React, { useEffect, useState, useMemo, use } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  fetchAllLiveSessions,
  createLiveSession,
  updateLiveSession,
  fetchAllStudentLiveSesssionsByPack,
  fetchPreviewPaidVersionLiveSessions,
} from "../../api/liveSessions";
import { useNavigate } from "react-router-dom";
import { fetchAllPacksAdmin } from "../../api/packs";
import { fetchUserActivePackStatus } from "../../api/users";

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
  userId: string;
}

const LiveSessionsCalendar: React.FC<Props> = ({ userRole, token, userId }) => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [paidSessions, setPaidSessions] = useState<LiveSession[]>([]);
  const [selected, setSelected] = useState<LiveSession | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", meetLink: "", packId: "" });
  const [message, setMessage] = useState("");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [calendarView, setCalendarView] = useState<View>("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [hasFreeVersion, setHasFreeVersion] = useState(false);
  const navigate = useNavigate();

  // Fetch sessions
  useEffect(() => {
    if (userRole === "student") {
      // First check user's pack status
      fetchUserActivePackStatus(userId, token).then(async (statusResponse) => {
        if (statusResponse?.success) {
          // Fetch regular sessions
          const sessionsResponse = await fetchAllStudentLiveSesssionsByPack(token);
          if (sessionsResponse?.success) {
            setSessions(Array.isArray(sessionsResponse?.data) ? sessionsResponse?.data : []);
          } else {
            console.error("Failed to load sessions:", sessionsResponse?.error || "Unknown error");
            setSessions([]);
          }
          if (statusResponse?.data?.freeVersion) {
            setHasFreeVersion(true);

            const paidSessionsResponse = await fetchPreviewPaidVersionLiveSessions(token);
            if (paidSessionsResponse?.success) {
              setPaidSessions(Array.isArray(paidSessionsResponse?.data) ? paidSessionsResponse?.data : []);
            } else {
              console.error("Failed to load paid sessions:", paidSessionsResponse?.error || "Unknown error");
              setPaidSessions([]);
            }
          } else {
            setHasFreeVersion(false);
          }
        }
        else {
          console.error("Failed to check pack status:", statusResponse?.error || "Unknown error");
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
  }, [token, userRole, userId]);

  // Convert sessions to calendar events
  const events = useMemo<RBCEvent[]>(
    () => [
      // Regular sessions
      ...sessions.map((s: LiveSession) => ({
        id: s.id,
        title: s.title,
        start: new Date(s.date),
        end: new Date(new Date(s.date).getTime() + 60 * 60 * 1000), // 1h session
        resource: s,
        isPaid: false
      })),
      // Paid preview sessions (disabled)
      ...paidSessions.map((s: LiveSession) => ({
        id: s.id,
        title: s.title,
        start: new Date(s.date),
        end: new Date(new Date(s.date).getTime() + 60 * 60 * 1000), // 1h session
        resource: s,
        isPaid: true
      }))
    ],
    [sessions, paidSessions]
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
      {userRole === "admin" || userRole === "superadmin" ? (
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
      {userRole === "student" && hasFreeVersion && (
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <p>Vous avez accès à la version gratuite. Découvrez plus de sessions en direct avec la version premium!</p>
          <button
            onClick={() => navigate('/packs')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Passer à la version premium
          </button>
        </div>
      )}
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
          if (event.isPaid) {
            alert("Cette session est réservée aux utilisateurs de la version premium");
          } else {
            navigate(`/live-sessions/${event.id}`);
          }
        }}
        eventPropGetter={(event: any) => ({
          style: {
            backgroundColor: event.isPaid ? '#e9ecef' : '#007bff',
            cursor: event.isPaid ? 'not-allowed' : 'pointer',
            color: event.isPaid ? '#6c757d' : 'white',
          },
        })}
        min={new Date(1970, 1, 1, 8, 0)} // 8:00 AM
        max={new Date(1970, 1, 1, 23, 0)} // 11:00 PM
        components={{
          event: (props: any) => (
            <div title={props.event.isPaid ? "Cette session est réservée aux utilisateurs de la version premium" : ""}>
              {props.title}
            </div>
          ),
        }}
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
