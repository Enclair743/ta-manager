declare global {
  interface Window {
    google?: any;
  }
}

"use client";
import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// Ganti import locale
import { id as idLocale } from "date-fns/locale";

export default function KalenderPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    summary: "",
    start: new Date(),
    end: new Date(Date.now() + 60 * 60000),
  });
  const [timeZone, setTimeZone] = useState("Asia/Jakarta");
  const [editId, setEditId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0); // for iframe refresh
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const tokenClientRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load GIS script only once
  useEffect(() => {
    if (typeof window !== "undefined" && !window['google']?.accounts?.oauth2) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Detect theme from body
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  // Fetch events when accessToken changes (login)
  useEffect(() => {
    if (accessToken) {
      fetchUserEmail();
      fetchEvents();
      intervalRef.current = setInterval(() => {
        fetchEvents();
        setCalendarKey(k => k + 1); // force iframe reload
      }, 15000); // 15 detik, ubah sesuai kebutuhan
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [accessToken]);

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

  function handleLogin() {
    if (!window.google?.accounts?.oauth2) {
      alert("Google Identity Services belum siap. Coba reload.");
      return;
    }
    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: "656328403825-6ntm1l1mjnqn589rnqj77m1svf6sq3oq.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
        callback: (resp: any) => {
          if (resp.error) {
            alert("Gagal login: " + resp.error);
            return;
          }
          setAccessToken(resp.access_token);
        },
      });
    }
    tokenClientRef.current.requestAccessToken();
  }

  async function fetchUserEmail() {
    if (!accessToken) return;
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
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

  // --- MODIFIKASI fetchEvents agar ambil event dari hari ini ke depan ---
  async function fetchEvents() {
    if (!accessToken) return;
    setLoading(true);
    try {
      const now = new Date();
      const timeMin = encodeURIComponent(now.toISOString()); // ambil dari sekarang
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMin}&maxResults=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.status === 401) {
        alert("Token expired, silakan login ulang.");
        setAccessToken(null);
        setEvents([]);
        setUserEmail(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      alert("Gagal mengambil event kalender");
    }
    setLoading(false);
  }

  function validateFormTime() {
    const start = form.start;
    const end = form.end;
    if (
      !start ||
      !end ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) return false;
    return start < end;
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    if (!validateFormTime()) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setLoading(true);
    try {
      const startISO = toISODateTime(form.start);
      const endISO = toISODateTime(form.end);
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
          start: new Date(),
          end: new Date(Date.now() + 60 * 60000),
        });
        fetchEvents();
        setCalendarKey(k => k + 1); // force iframe reload setelah tambah event
      } else {
        const err = await res.json();
        alert("Gagal menambah event: " + (err.error?.message || ""));
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!accessToken) return;
    setLoading(true);
    try {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      await fetchEvents();
      setCalendarKey(k => k + 1); // force iframe reload setelah hapus event
    } finally {
      setLoading(false);
    }
  }

  async function editEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !editId) return;
    if (!validateFormTime()) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setLoading(true);
    try {
      const startISO = toISODateTime(form.start);
      const endISO = toISODateTime(form.end);
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
          start: new Date(),
          end: new Date(Date.now() + 60 * 60000),
        });
        setEditId(null);
        fetchEvents();
        setCalendarKey(k => k + 1); // force iframe reload setelah edit event
      } else {
        const err = await res.json();
        alert("Gagal edit event: " + (err.error?.message || ""));
      }
    } finally {
      setLoading(false);
    }
  }

  function startEdit(ev: any) {
    setForm({
      summary: ev.summary || "",
      start: ev.start?.dateTime ? new Date(ev.start.dateTime) : new Date(),
      end: ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(Date.now() + 60 * 60000),
    });
    setEditId(ev.id);
  }

  function resetForm() {
    setEditId(null);
    setForm({
      summary: "",
      start: new Date(),
      end: new Date(Date.now() + 60 * 60000),
    });
  }

  // Lebih toleran: cocokkan description mengandung __FROM_APP__ (spasi/newline diabaikan)
  const appEvents = events.filter(ev =>
    typeof ev.description === "string" && ev.description.replace(/\s+/g, "").includes("__FROM_APP__")
  );

  // DEBUG: tampilkan semua description event (hapus blok ini jika sudah tidak perlu)
  // Aktifkan ini untuk cek data mentah dari API!
  {/*
  {events.length > 0 && (
    <div style={{margin:'1em 0',background:'#fff',padding:10,borderRadius:8}}>
      <b>DEBUG: Semua Event (description):</b>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>
            <b>{ev.summary}:</b> [{JSON.stringify(ev.description)}] <span>{ev.start?.dateTime}</span>
          </li>
        ))}
      </ul>
    </div>
  )}
  */}

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
        <h1 style={{
          fontSize: "1.5rem",
          marginBottom: "1em",
          color: theme === "dark" ? "#f3f4f6" : "#222"
        }}>
          Kalender & Timeline
        </h1>
        {!accessToken ? (
          <div style={{ marginBottom: "2em" }}>
            <button
              onClick={handleLogin}
              style={{
                background: theme === "dark" ? "linear-gradient(90deg,#6366f1,#60a5fa)" : "linear-gradient(90deg,#e0e7ff,#a5b4fc)",
                color: theme === "dark" ? "#fff" : "#222",
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
              Login Google Kalender
            </button>
            <p
              style={{
                fontSize: "0.95em",
                color: theme === "dark" ? "#6366f1" : "#222",
                marginTop: "1em",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              Login dengan Google untuk akses kalender pribadi.
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
            {/* ZONA WAKTU SELECTOR */}
            <div style={{ marginBottom: "1em" }}>
              <label style={{
                fontWeight: 500,
                color: theme === "dark" ? "#f3f4f6" : "#222", // kontras di dark mode
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
              disabled={loading}
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
              {loading ? "Mengambil event..." : "Ambil Event Kalender"}
            </button>
            {/* Form tambah/edit event */}
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
                    onChange={(e) =>
                      setForm({ ...form, summary: e.target.value })
                    }
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
                <label style={{
                  color: theme === "dark" ? "#f3f4f6" : "#222",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.5em"
                }}>
                  Mulai:
                  <DateTimePicker
                    label=""
                    value={form.start}
                    onChange={(date) => {
                      if (date) setForm({ ...form, start: date });
                    }}
                    ampm={false}
                    inputFormat="yyyy-MM-dd HH:mm"
                    minutesStep={5}
                    renderInput={(params) => (
                      <TextField {...params}
                        required
                        sx={{
                          marginTop: "8px",
                          width: "100%",
                          background: "#fff",
                          borderRadius: "6px",
                          "& .MuiInputBase-input": {
                            color: theme === "dark" ? "#222" : "#222"
                          }
                        }}
                      />
                    )}
                    localeText={{ timePickerToolbarTitle: "Waktu" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1em" }}>
                <label style={{
                  color: theme === "dark" ? "#f3f4f6" : "#222",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.5em"
                }}>
                  Selesai:
                  <DateTimePicker
                    label=""
                    value={form.end}
                    onChange={(date) => {
                      if (date) setForm({ ...form, end: date });
                    }}
                    ampm={false}
                    inputFormat="yyyy-MM-dd HH:mm"
                    minutesStep={5}
                    renderInput={(params) => (
                      <TextField {...params}
                        required
                        sx={{
                          marginTop: "8px",
                          width: "100%",
                          background: "#fff",
                          borderRadius: "6px",
                          "& .MuiInputBase-input": {
                            color: theme === "dark" ? "#222" : "#222"
                          }
                        }}
                      />
                    )}
                    localeText={{ timePickerToolbarTitle: "Waktu" }}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
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
            <div style={{
              margin: "2em 0",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              <h3 style={{
                marginBottom: 10,
                color: theme === "dark" ? "#f3f4f6" : "#222"
              }}>Daftar Jadwal Tugas Akhir:</h3>
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
            {/* Kalender Google auto refresh */}
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
                // Tambahkan filter untuk sedikit gelap di dark mode
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
                  <>
                    Ini adalah kalender kamu (<b>{userEmail}</b>).
                  </>
                )
                : (
                  <>
                    Ganti <b>YOUR_EMAIL%40gmail.com</b> dengan email Google kamu (pakai %40 untuk @).
                  </>
                )
              }
            </p>
          </div>
        )}
      </LocalizationProvider>
    </div>
  );
}
