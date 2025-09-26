declare global {
  interface Window {
    google?: any;
  }
}

"use client";
import { useEffect, useRef, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { id as idLocale } from "date-fns/locale";
import { useAuthCalendar } from "../../src/context/AuthCalendarContext";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/context/AuthContext";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import app from "../firebase";

const db = getFirestore(app);
function getKalenderDoc(uid: string) {
  return doc(db, "kalender", uid);
}

export default function KalenderPage() {
  // Modal & fitur baru
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDesc, setEventDesc] = useState("");
  const [reminders, setReminders] = useState<number[]>([5, 15, 60, 1440]);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState("");
  const [kategori, setKategori] = useState("");
  const [kategoriList, setKategoriList] = useState<{name: string, color: string}[]>([
    { name: "Seminar", color: "#6366f1" },
    { name: "Tugas", color: "#f59e42" },
    { name: "Rapat", color: "#10b981" }
  ]);
  const [newKategori, setNewKategori] = useState("");
  const [newKategoriColor, setNewKategoriColor] = useState("#6366f1");
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [form, setForm] = useState({
    summary: "",
    startDate: new Date().toISOString().slice(0, 10),
    startTime: new Date().toTimeString().slice(0, 5),
    endDate: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 10),
    endTime: new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5),
  });
  const [timeZone, setTimeZone] = useState("Asia/Jakarta");
  const [editId, setEditId] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0); // for iframe refresh
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const authCalendar = useAuthCalendar();
  const user = authCalendar?.user;
  const calendarToken = authCalendar?.calendarToken;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const { loading } = useAuth();
  const [docRef, setDocRef] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
      // Set zona waktu otomatis
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const indoZones = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];
      if (indoZones.includes(localTz)) {
        setTimeZone(localTz);
      }
    }
  }, []);

  useEffect(() => {
    if (calendarToken) {
      fetchUserEmail();
      fetchEvents();
      intervalRef.current = setInterval(() => {
        fetchEvents();
        setCalendarKey(k => k + 1); // force iframe reload
      }, 300000); // 5 menit
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setEvents([]);
      setUserEmail(null);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [calendarToken]);

  useEffect(() => {
    if (!loading && user) {
      setDocRef(getKalenderDoc(user.uid));
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchKalender() {
      if (!docRef) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { events?: any[] };
        setEvents(data.events || []);
      } else {
        setEvents([]);
      }
    }
    fetchKalender();
    // eslint-disable-next-line
  }, [docRef]);

  function toISODateTime(date: Date) {
    if (!date || isNaN(date.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  function formatDateTime24(dt: string) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function fetchUserEmail() {
    if (!calendarToken) return;
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${calendarToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.email || null);
      } else {
        setUserEmail(null);
      }
    } catch {
      setUserEmail(null);
    }
  }

  async function fetchEvents() {
    if (!calendarToken) return;
    setEventsLoading(true);
    try {
      const now = new Date();
      const timeMin = encodeURIComponent(now.toISOString());
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMin}&maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${calendarToken}`,
          },
        }
      );
      if (res.status === 401) {
        alert("Token expired, silakan login ulang.");
        setEvents([]);
        setUserEmail(null);
        setEventsLoading(false);
        return;
      }
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      alert("Gagal mengambil event kalender");
    }
    setEventsLoading(false);
  }

  function getDateTime(dateStr: string, timeStr: string) {
    return new Date(dateStr + 'T' + timeStr);
  }

  function validateFormTime(start: Date, end: Date) {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    return start < end;
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!calendarToken) return;
    const start = getDateTime(form.startDate, form.startTime);
    const end = getDateTime(form.endDate, form.endTime);
    if (!validateFormTime(start, end)) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setEventsLoading(true);
    try {
      const startISO = toISODateTime(start);
      const endISO = toISODateTime(end);
      const reminderOverrides = reminders.map(m => ({ method: "popup", minutes: m }));
      const eventAttendees = attendees.filter(email => email.trim() !== "").map(email => ({ email }));
      const eventRecurrence = recurrence ? [recurrence] : undefined;
      const eventDescription = (eventDesc ? eventDesc + "\n" : "") + "__FROM_APP__";
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${calendarToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: form.summary,
            description: eventDescription,
            start: { dateTime: startISO, timeZone },
            end: { dateTime: endISO, timeZone },
            reminders: {
              useDefault: false,
              overrides: reminderOverrides
            },
            attendees: eventAttendees,
            recurrence: eventRecurrence,
            colorId: kategori ? "11" : undefined,
            extendedProperties: kategori ? { private: { kategori } } : undefined
          }),
        }
      );
      if (res.ok) {
        setForm({
          summary: "",
          startDate: new Date().toISOString().slice(0, 10),
          startTime: new Date().toTimeString().slice(0, 5),
          endDate: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 10),
          endTime: new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5),
        });
        fetchEvents();
        setCalendarKey(k => k + 1);
      } else {
        const err = await res.json();
        alert("Gagal menambah event: " + (err.error?.message || ""));
      }
    } finally {
      setEventsLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!calendarToken) return;
    setEventsLoading(true);
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${calendarToken}` },
        }
      );
      await fetchEvents();
      setCalendarKey(k => k + 1);
    } finally {
      setEventsLoading(false);
    }
  }

  async function editEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!calendarToken || !editId) return;
    const start = getDateTime(form.startDate, form.startTime);
    const end = getDateTime(form.endDate, form.endTime);
    if (!validateFormTime(start, end)) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setEventsLoading(true);
    try {
      const startISO = toISODateTime(start);
      const endISO = toISODateTime(end);
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${calendarToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: form.summary,
            description: "__FROM_APP__",
            start: { dateTime: startISO, timeZone },
            end: { dateTime: endISO, timeZone },
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 5 },
                { method: "popup", minutes: 15 },
                { method: "popup", minutes: 60 },
                { method: "popup", minutes: 1440 }
              ]
            }
          }),
        }
      );
      if (res.ok) {
        setForm({
          summary: "",
          startDate: new Date().toISOString().slice(0, 10),
          startTime: new Date().toTimeString().slice(0, 5),
          endDate: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 10),
          endTime: new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5),
        });
        setEditId(null);
        fetchEvents();
        setCalendarKey(k => k + 1);
      } else {
        const err = await res.json();
        alert("Gagal edit event: " + (err.error?.message || ""));
      }
    } finally {
      setEventsLoading(false);
    }
  }

  function startEdit(ev: any) {
    const start = ev.start?.dateTime ? new Date(ev.start.dateTime) : new Date();
    const end = ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(Date.now() + 60 * 60000);
    setForm({
      summary: ev.summary || "",
      startDate: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endDate: end.toISOString().slice(0, 10),
      endTime: end.toTimeString().slice(0, 5),
    });
    setEditId(ev.id);
  }

  function resetForm() {
    setEditId(null);
    setForm({
      summary: "",
      startDate: new Date().toISOString().slice(0, 10),
      startTime: new Date().toTimeString().slice(0, 5),
      endDate: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 10),
      endTime: new Date(Date.now() + 60 * 60000).toTimeString().slice(0, 5),
    });
  }

  const appEvents = events.filter(ev =>
    typeof ev.description === "string" && ev.description.replace(/\s+/g, "").includes("__FROM_APP__")
  );

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return <div>Loading...</div>;

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const colorAccent = '#7c3aed';
  const colorAccentLight = '#c7d2fe';
  const colorAccentSoft = '#a5b4fc';
  const colorCardBg = theme === 'dark' ? 'rgba(36, 41, 54, 0.82)' : 'rgba(255,255,255,0.96)';
  const colorMainBg = theme === 'dark'
    ? ('linear-gradient(120deg,#18181b 60%,#23272f 100%)' as string)
    : ('linear-gradient(120deg,#eef2ff 60%,#f5f7fb 100%)' as string);

  // Responsive style for mobile & tablet
  const responsiveStyle = `
    @media (max-width: 900px) {
      body { padding: 0 !important; }
      main {
        padding: 0.7rem !important;
        max-width: 100vw !important;
        margin-top: 0.5rem !important;
        border-radius: 0 !important;
        min-height: 90vh !important;
      }
      header {
        padding: 0.7rem 1rem !important;
        font-size: 1em !important;
      }
      h1 { font-size: 1.15em !important; }
      h2 { font-size: 1em !important; }
      [data-section-style], [data-card-style] {
        padding: 0.7em 0.3em !important;
        max-width: 100vw !important;
        border-radius: 10px !important;
      }
      input, select, button {
        font-size: 0.98em !important;
        min-width: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .MuiInputBase-root, .MuiFormControl-root {
        width: 100% !important;
        min-width: 0 !important;
      }
      .checklist-section ol li, .progress-section, .jadwal-section ul li {
        font-size: 0.98em !important;
        padding: 0.7em 0.7em !important;
      }
      .main-menu-cards {
        flex-direction: column !important;
        gap: 0.7em !important;
        min-width: 0 !important;
        max-width: 100vw !important;
      }
      .main-menu-cards a {
        min-width: 0 !important;
        max-width: 100vw !important;
        font-size: 0.98em !important;
        padding: 1em 0.3em !important;
        margin: 0.2em 0 !important;
      }
    }
    @media (max-width: 600px) {
      h1 { font-size: 1em !important; }
      h2 { font-size: 0.95em !important; }
      [data-section-style], [data-card-style] {
        padding: 0.5em 0.1em !important;
      }
      .checklist-section, .progress-section, .jadwal-section {
        padding: 0.5em 0.1em !important;
      }
      .checklist-section ol li, .jadwal-section ul li {
        font-size: 0.95em !important;
        padding: 0.5em 0.5em !important;
      }
    }
  `;

  return (
    <div className="min-h-screen">
      <style>{responsiveStyle}</style>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
        <div>
          <h1 style={{
            fontSize: "1.5rem",
            marginBottom: "1em",
            color: colorAccent,
            background: theme === 'dark'
              ? ('linear-gradient(90deg,#c7d2fe,#7c3aed)' as string)
              : ('linear-gradient(90deg,#7c3aed,#a5b4fc)' as string),
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Kalender & Timeline</h1>
          {!calendarToken ? (
            <div style={{ marginBottom: "2em" }}>
              <p
                style={{
                  fontSize: "0.95em",
                  color: theme === "dark" ? "#6366f1" : "#222",
                  marginTop: "1em",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                Login akun dan kalender Google di halaman login.
              </p>
            </div>
          ) : (
            <div>
              <p>
                <a
                  href="https://calendar.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#0070f3",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  Buka Google Kalender
                </a>
              </p>
              <div style={{ marginBottom: "1em" }}>
                <label style={{
                  fontWeight: 500,
                  color: theme === "dark" ? "#f3f4f6" : "#222",
                  display: "inline-block"
                }}>
                  Zona Waktu:
                  <select
                    value={timeZone}
                    onChange={e => setTimeZone(e.target.value)}
                    style={{
                      marginLeft: "8px",
                      padding: "0.4em",
                      borderRadius: "6px",
                      border: "1px solid #6366f1",
                      background: theme === "dark" ? "#353a47" : "#fff",
                      color: theme === "dark" ? "#f3f4f6" : "#222",
                    }}
                  >
                    <option value="Asia/Jakarta">WIB (GMT+7)</option>
                    <option value="Asia/Makassar">WITA (GMT+8)</option>
                    <option value="Asia/Jayapura">WIT (GMT+9)</option>
                  </select>
                </label>
              </div>
              <button
                onClick={fetchEvents}
                disabled={eventsLoading}
                style={{
                  background: "linear-gradient(90deg,#6366f1,#60a5fa)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.9em 1.5em",
                  fontWeight: 600,
                  marginBottom: "1em",
                  cursor: "pointer",
                  display: "block",
                  width: "100%",
                  maxWidth: "320px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                  fontSize: "1.05em",
                  transition: "background 0.2s",
                }}
              >
                {eventsLoading ? "Mengambil event..." : "Ambil Event Kalender"}
              </button>
              <button
                style={{
                  background: colorAccent,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.9em 1.5em",
                  fontWeight: 700,
                  marginBottom: "1em",
                  cursor: "pointer",
                  display: "block",
                  width: "100%",
                  maxWidth: "320px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
                  fontSize: "1.08em",
                  transition: "background 0.2s",
                }}
                onClick={() => setShowEventForm(true)}
              >
                + Tambah Event
              </button>
              {showEventForm && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: theme === "dark" ? "rgba(0,0,0,0.52)" : "rgba(0,0,0,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  backdropFilter: "blur(2px)",
                  overflow: "auto"
                }}>
                  <div style={{
                    background: colorCardBg,
                    borderRadius: 20,
                    boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
                    border: "2px solid #6366f1",
                    padding: 24,
                    minWidth: 0,
                    maxWidth: "95vw",
                    width: "100%",
                    maxHeight: "90vh",
                    color: theme === "dark" ? "#f3f4f6" : "#222",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}>
                    <h2 style={{ color: colorAccent, fontWeight: 800, fontSize: "1.25rem", marginBottom: 18, textAlign: "center", letterSpacing: "0.03em" }}>
                      Tambah Event Baru
                    </h2>
                    <form onSubmit={addEvent}>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Judul Event:</label>
                        <input type="text" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} required style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #6366f1", marginBottom: 10, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "1em" }} />
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Deskripsi Event:</label>
                        <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} rows={3} style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #6366f1", marginBottom: 10, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "1em" }} />
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Kategori/Jenis Event:</label>
                        <select
                          value={kategori}
                          onChange={e => setKategori(e.target.value)}
                          style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: `1.5px solid ${kategoriList.find(k=>k.name===kategori)?.color||'#6366f1'}`, marginBottom: 10, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "1em" }}
                        >
                          <option value="">Pilih kategori...</option>
                          {kategoriList.map(k => (
                            <option key={k.name} value={k.name} style={{ color: k.color }}>{k.name}</option>
                          ))}
                        </select>
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="text"
                            value={newKategori}
                            onChange={e => setNewKategori(e.target.value)}
                            placeholder="Tambah kategori baru..."
                            style={{ width: "60%", padding: "0.5em", borderRadius: 8, border: "1px solid #6366f1", marginRight: 8, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "0.98em" }}
                          />
                          <input
                            type="color"
                            value={newKategoriColor}
                            onChange={e => setNewKategoriColor(e.target.value)}
                            style={{ width: 32, height: 32, verticalAlign: "middle", marginRight: 8, border: "none", background: "none" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newKategori.trim() && !kategoriList.some(k => k.name === newKategori.trim())) {
                                const updated = [...kategoriList, { name: newKategori.trim(), color: newKategoriColor }];
                                setKategoriList(updated);
                                setKategori(newKategori.trim());
                                setNewKategori("");
                                setNewKategoriColor("#6366f1");
                                // Persist to localStorage
                                if (typeof window !== "undefined") {
                                  localStorage.setItem("kategoriList", JSON.stringify(updated));
                                }
                              }
                            }}
                            style={{ padding: "0.5em 1em", borderRadius: 8, background: newKategoriColor, color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "0.98em" }}
                          >
                            Tambah
                          </button>
                        </div>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Tamu/Undangan (email, pisahkan dengan koma):</label>
                        <input type="text" value={attendees.join(", ")} onChange={e => setAttendees(e.target.value.split(",").map(s => s.trim()))} placeholder="email1@gmail.com, email2@gmail.com" style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #6366f1", marginBottom: 10, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "1em" }} />
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Repeat/Recurrence:</label>
                        <select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #6366f1", marginBottom: 10, background: theme === "dark" ? "#18181b" : "#fff", color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, fontSize: "1em" }}>
                          <option value="">Tidak berulang</option>
                          <option value="RRULE:FREQ=DAILY">Harian</option>
                          <option value="RRULE:FREQ=WEEKLY">Mingguan</option>
                          <option value="RRULE:FREQ=MONTHLY">Bulanan</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Pengingat (Reminder):</label>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {[5, 15, 60, 1440].map(m => (
                            <label key={m} style={{ fontWeight: 500 }}>
                              <input type="checkbox" checked={reminders.includes(m)} onChange={e => {
                                if (e.target.checked) setReminders([...reminders, m]);
                                else setReminders(reminders.filter(x => x !== m));
                              }} /> {m === 1440 ? "1 hari" : `${m} menit`}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Mulai:</label>
                        <div style={{ display: "flex", gap: "0.7em" }}>
                          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }} />
                          <select value={form.startTime.split(":")[0]} onChange={e => setForm({ ...form, startTime: e.target.value + ":" + form.startTime.split(":")[1] })} style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}>
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <select value={form.startTime.split(":")[1]} onChange={e => setForm({ ...form, startTime: form.startTime.split(":")[0] + ":" + e.target.value })} style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}>
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600 }}>Selesai:</label>
                        <div style={{ display: "flex", gap: "0.7em" }}>
                          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }} />
                          <select value={form.endTime.split(":")[0]} onChange={e => setForm({ ...form, endTime: e.target.value + ":" + form.endTime.split(":")[1] })} style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}>
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <select value={form.endTime.split(":")[1]} onChange={e => setForm({ ...form, endTime: form.endTime.split(":")[0] + ":" + e.target.value })} style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}>
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button type="button" onClick={() => setShowEventForm(false)} style={{ background: colorAccent, color: "#fff", padding: "0.85em 1.5em", borderRadius: 10, fontWeight: 700, flex: 1, border: "none", cursor: "pointer", fontSize: "1.08em" }}>Batal</button>
                        <button type="submit" disabled={eventsLoading} style={{ background: colorAccent, color: "#fff", padding: "0.85em 1.5em", borderRadius: 10, fontWeight: 700, flex: 1, border: "none", cursor: "pointer", fontSize: "1.08em" }}>{eventsLoading ? "Menyimpan..." : "Simpan"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <div style={{ margin: "2em 0", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                <h3 style={{ marginBottom: 10, color: theme === "dark" ? "#f3f4f6" : "#222" }}>Daftar Jadwal Tugas Akhir:</h3>
                <ul>
                  {appEvents.map(ev => (
                    <li key={ev.id} style={{ marginBottom: "1em", background: colorCardBg, borderRadius: 10, boxShadow: "0 2px 8px rgba(99,102,241,0.08)", padding: "1em" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
                        <div style={{ fontWeight: 700, color: colorAccent }}>{ev.summary}</div>
                        <div style={{ fontSize: "0.98em" }}>{ev.description?.replace("__FROM_APP__", "")}</div>
                        <div style={{ fontSize: "0.95em", color: theme === "dark" ? colorAccentLight : colorAccentSoft }}>
                          {formatDateTime24(ev.start?.dateTime)} - {formatDateTime24(ev.end?.dateTime)}
                        </div>
                        <div style={{ display: "flex", gap: "0.7em" }}>
                          <button
                            onClick={() => startEdit(ev)}
                            style={{
                              background: "#6366f1",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "0.4em 1em",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "0.4em 1em",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <iframe
                key={calendarKey}
                src={
                  userEmail
                    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
                        userEmail
                      )}&rand=${calendarKey}`
                    : "https://calendar.google.com/calendar/embed?src=YOUR_EMAIL%40gmail.com"
                }
                style={{
                  border: "2px solid " + (theme === "dark" ? "#353a47" : "#e0e7ff"),
                  background: theme === "dark" ? "#23272f" : "#fff",
                  width: "100%",
                  height: "600px",
                  borderRadius: "14px",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.06)",
                  filter: theme === "dark" ? "brightness(0.92)" : "none"
                }}
                frameBorder={0}
              ></iframe>
              <p
                style={{
                  fontSize: "0.9em",
                  color: theme === "dark" ? "#888" : "#888",
                  marginTop: "1em",
                  textAlign: "center",
                }}
              >
                {userEmail
                  ? (
                    <>Ini adalah kalender kamu (<b>{userEmail}</b>).</>
                  )
                  : (
                    <>Ganti <b>YOUR_EMAIL%40gmail.com</b> dengan email Google kamu (pakai %40 untuk @).</>
                  )
                }
              </p>
            </div>
          )}
        </div>
      </LocalizationProvider>
    </div>
  );
}
