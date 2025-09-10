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
            description: "__FROM_APP__",
            start: { dateTime: startISO, timeZone },
            end: { dateTime: endISO, timeZone },
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
    <div style={{ background: colorMainBg }}>
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
              {calendarToken && (
                <div>
                  <form
                    onSubmit={editId === null ? addEvent : editEvent}
                    style={{
                      margin: "2em 0",
                      padding: "1.5em",
                      background: theme === "dark" ? "#23272f" : "#fff",
                      borderRadius: "18px",
                      boxShadow: theme === "dark"
                        ? "0 8px 32px rgba(99,102,241,0.18)"
                        : "0 8px 32px rgba(99,102,241,0.10)",
                      maxWidth: "420px",
                      marginLeft: "auto",
                      marginRight: "auto",
                      color: theme === "dark" ? "#f3f4f6" : "#222",
                      border: theme === "dark" ? "1.5px solid #353a47" : "none",
                    }}
                  >
                    <h3 style={{ marginBottom: "0.7em", color: theme === "dark" ? "#f3f4f6" : "#222" }}>
                      {editId === null ? "Tambah Event" : "Edit Event"}
                    </h3>
                    <div style={{ marginBottom: "1em" }}>
                      <label style={{
                        color: theme === "dark" ? "#f3f4f6" : "#222",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: "0.5em"
                      }}>
                        Judul Event:
                        <input
                          type="text"
                          value={form.summary}
                          onChange={e => setForm({ ...form, summary: e.target.value })}
                          required
                          style={{
                            marginTop: "8px",
                            padding: "0.5em",
                            borderRadius: "6px",
                            border: "1px solid #6366f1",
                            width: "100%",
                            boxSizing: "border-box",
                            color: theme === "dark" ? "#222" : "#222",
                            background: theme === "dark" ? "#fff" : "#fff",
                            fontSize: "1em"
                          }}
                        />
                      </label>
                    </div>
                    <div style={{ marginBottom: "1em" }}>
                      <label style={{ color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, display: "block", marginBottom: "0.5em" }}>
                        Mulai:
                        <div style={{ display: "flex", gap: "0.7em" }}>
                          <input
                            type="date"
                            value={form.startDate}
                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                            required
                            style={{
                              padding: "0.5em",
                              borderRadius: "6px",
                              border: "1px solid #6366f1",
                              fontSize: "1em",
                              fontFamily: "inherit"
                            }}
                          />
                          <select
                            value={form.startTime.split(":")[0]}
                            onChange={e => setForm({ ...form, startTime: e.target.value + ":" + form.startTime.split(":")[1] })}
                            style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}
                          >
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <select
                            value={form.startTime.split(":")[1]}
                            onChange={e => setForm({ ...form, startTime: form.startTime.split(":")[0] + ":" + e.target.value })}
                            style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}
                          >
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </label>
                    </div>
                    <div style={{ marginBottom: "1em" }}>
                      <label style={{ color: theme === "dark" ? "#f3f4f6" : "#222", fontWeight: 500, display: "block", marginBottom: "0.5em" }}>
                        Selesai:
                        <div style={{ display: "flex", gap: "0.7em" }}>
                          <input
                            type="date"
                            value={form.endDate}
                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                            required
                            style={{
                              padding: "0.5em",
                              borderRadius: "6px",
                              border: "1px solid #6366f1",
                              fontSize: "1em",
                              fontFamily: "inherit"
                            }}
                          />
                          <select
                            value={form.endTime.split(":")[0]}
                            onChange={e => setForm({ ...form, endTime: e.target.value + ":" + form.endTime.split(":")[1] })}
                            style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}
                          >
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <select
                            value={form.endTime.split(":")[1]}
                            onChange={e => setForm({ ...form, endTime: form.endTime.split(":")[0] + ":" + e.target.value })}
                            style={{ padding: "0.5em", borderRadius: "6px", border: "1px solid #6366f1", fontSize: "1em", fontFamily: "inherit" }}
                          >
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={eventsLoading}
                      style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7em 1.2em",
                        fontWeight: 500,
                        cursor: "pointer",
                        marginRight: "8px",
                        marginTop: "0.5em"
                      }}
                    >
                      {editId === null ? "Tambah" : "Simpan"}
                    </button>
                    {editId !== null && (
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          background: "#e0e7ff",
                          color: "#6366f1",
                          border: "1px solid #6366f1",
                          borderRadius: "8px",
                          padding: "0.7em 1.2em",
                          fontWeight: 500,
                          cursor: "pointer",
                          marginTop: "0.5em"
                        }}
                      >
                        Batal
                      </button>
                    )}
                  </form>
                  <div style={{ margin: "2em 0", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                    <h3 style={{ marginBottom: 10, color: theme === "dark" ? "#f3f4f6" : "#222" }}>Daftar Jadwal Tugas Akhir:</h3>
                    {appEvents.length === 0 ? (
                      <div style={{
                        background: theme === "dark" ? "#23272f" : "#fff",
                        color: theme === "dark" ? "#a1a1aa" : "#888",
                        padding: "1.2em",
                        borderRadius: "18px",
                        textAlign: "center",
                        boxShadow: theme === "dark"
                          ? "0 4px 16px rgba(99,102,241,0.18)"
                          : "0 4px 16px rgba(99,102,241,0.10)",
                        marginTop: 10
                      }}>
                        Tidak ada jadwal tugas akhir
                      </div>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {appEvents.map(ev => (
                          <li key={ev.id}
                              style={{
                                background: theme === "dark" ? "#23272f" : "#fff",
                                borderRadius: "18px",
                                marginBottom: "1.2em",
                                padding: "1.2em",
                                boxShadow: theme === "dark"
                                  ? "0 4px 16px rgba(99,102,241,0.18)"
                                  : "0 4px 16px rgba(99,102,241,0.10)",
                                color: theme === "dark" ? "#f3f4f6" : "#222",
                                border: "1px solid " + (theme === "dark" ? "#353a47" : "#e0e7ff"),
                                transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
                              }}
                              onMouseOver={e => {
                                e.currentTarget.style.background = theme === "dark" ? "#353a47" : "#e0e7ff";
                                e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.18)";
                                e.currentTarget.style.transform = "scale(1.03)";
                              }}
                              onMouseOut={e => {
                                e.currentTarget.style.background = theme === "dark" ? "#23272f" : "#fff";
                                e.currentTarget.style.boxShadow = theme === "dark"
                                  ? "0 4px 16px rgba(99,102,241,0.18)"
                                  : "0 4px 16px rgba(99,102,241,0.10)";
                                e.currentTarget.style.transform = "none";
                              }}
                          >
                            <div>
                              <span style={{ fontWeight: "bold" }}>{ev.summary}</span>
                            </div>
                            <div style={{ color: theme === "dark" ? "#a1a1aa" : "#555", fontSize: "0.98em" }}>
                              {ev.start?.dateTime ? formatDateTime24(ev.start.dateTime) : ev.start?.date}
                              {" - "}
                              {ev.end?.dateTime ? formatDateTime24(ev.end.dateTime) : ev.end?.date}
                            </div>
                            <div style={{ marginTop: "0.8em", display: "flex", gap: "0.5em" }}>
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
                          </li>
                        ))}
                      </ul>
                    )}
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
          )}
        </div>
      </LocalizationProvider>
    </div>
  );
}
