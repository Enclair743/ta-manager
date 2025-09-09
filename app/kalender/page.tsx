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
import { id as idLocale } from "date-fns/locale";
import { useAuthCalendar } from "../../src/context/AuthCalendarContext";
import { useRouter } from "next/navigation";

export default function KalenderPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [form, setForm] = useState({
    summary: "",
    start: new Date(),
    end: new Date(Date.now() + 60 * 60000),
  });
  const [timeZone, setTimeZone] = useState("Asia/Jakarta");
  const [editId, setEditId] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0); // for iframe refresh
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user, calendarToken } = useAuthCalendar();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // Detect theme from body
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  // Fetch events & email when calendarToken changes (login kalender sukses)
  useEffect(() => {
    if (calendarToken) {
      fetchUserEmail();
      fetchEvents();
      intervalRef.current = setInterval(() => {
        fetchEvents();
        setCalendarKey(k => k + 1); // force iframe reload
      }, 15000); // 15 detik, ubah sesuai kebutuhan
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

  // --- MODIFIKASI fetchEvents agar ambil event dari hari ini ke depan ---
  async function fetchEvents() {
    if (!calendarToken) return;
    setEventsLoading(true);
    try {
      const now = new Date();
      const timeMin = encodeURIComponent(now.toISOString()); // ambil dari sekarang
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
    if (!calendarToken) return;
    if (!validateFormTime()) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setEventsLoading(true);
    try {
      const startISO = toISODateTime(form.start);
      const endISO = toISODateTime(form.end);
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
      setCalendarKey(k => k + 1); // force iframe reload setelah hapus event
    } finally {
      setEventsLoading(false);
    }
  }

  async function editEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!calendarToken || !editId) return;
    if (!validateFormTime()) {
      alert("Waktu mulai/selesai tidak valid atau format salah.");
      return;
    }
    setEventsLoading(true);
    try {
      const startISO = toISODateTime(form.start);
      const endISO = toISODateTime(form.end);
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
      setEventsLoading(false);
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

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return <div>Loading...</div>;

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
            {/* Form tambah/edit event */}
            {/* ... (form dan daftar event sama seperti sebelumnya) ... */}
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
