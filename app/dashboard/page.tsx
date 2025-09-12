"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "../firebase";
import { useRouter } from "next/navigation";
import { useAuthCalendar } from "../../src/context/AuthCalendarContext";

export default function DashboardPage() {
  const authCalendar = useAuthCalendar();
  if (!authCalendar) return <div>Gagal mendapatkan context. Silakan reload halaman.</div>;
  const { user, calendarToken } = authCalendar;

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [judul, setJudul] = useState("Judul Tugas Akhir");
  const [pembimbing1, setPembimbing1] = useState("");
  const [pembimbing2, setPembimbing2] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [tempJudul, setTempJudul] = useState(judul);
  const [tempPembimbing1, setTempPembimbing1] = useState(pembimbing1);
  const [tempPembimbing2, setTempPembimbing2] = useState(pembimbing2);
  const [penulisanList, setPenulisanList] = useState<any[]>([]);
  const [tugasList, setTugasList] = useState<any[]>([]);
  const [berkasList, setBerkasList] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [docRef, setDocRef] = useState<any>(null);
  const db = getFirestore(app);

  // Ganti doc menjadi per user
  function getDashboardDoc(uid: string) {
    return doc(db, "dashboard", uid);
  }
  function getChecklistDoc(uid: string) {
    return doc(getFirestore(app), "penulisan", uid);
  }

  const { loading } = useAuth();
  const router = useRouter();

  // Color palette mirip page catatan
  const colorAccent = '#7c3aed'; // Ungu (accent utama)
  const colorAccentLight = '#c7d2fe'; // Untuk mode terang
  const colorAccentSoft = '#a5b4fc'; // Untuk border dan shadow di light
  const colorAccentWarn = '#f59e42'; // Orange
  const colorDanger = '#ef4444';
  const colorSuccess = '#34d399';
  const colorCardBg = theme === 'dark'
    ? 'rgba(36, 41, 54, 0.82)'
    : 'rgba(255,255,255,0.96)';
  const colorMainBg = theme === 'dark'
    ? ('linear-gradient(120deg,#18181b 60%,#23272f 100%)' as string)
    : ('linear-gradient(120deg,#eef2ff 60%,#f5f7fb 100%)' as string);
  const colorText = theme === 'dark' ? '#f3f4f6' : '#22223b';
  const colorLabel = theme === 'dark' ? colorAccentSoft : colorAccent;
  const colorInputBg = theme === 'dark' ? 'rgba(36,41,54,0.92)' : '#fff';
  const colorInputBorder = theme === 'dark' ? colorAccentSoft : colorAccent;
  const colorShadow = theme === 'dark'
    ? '0 6px 20px rgba(124,58,237,0.12)'
    : '0 6px 20px rgba(124,58,237,0.07)';
  const colorGlassBorder = theme === 'dark'
    ? '1.5px solid rgba(124,58,237,0.28)'
    : '1.5px solid #7c3aed';
  const colorGlassShadow = theme === 'dark'
    ? '0 8px 32px rgba(124,58,237,0.22)'
    : '0 8px 32px rgba(124,58,237,0.09)';

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bodyTheme = document.body.getAttribute("data-theme");
      setTheme(bodyTheme === "light" ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
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
      setCalendarLoading(true);
      try {
        const now = new Date();
        const timeMin = encodeURIComponent(now.toISOString());
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMin}&maxResults=10`,
          {
            headers: {
              Authorization: `Bearer ${calendarToken}`,
            },
          }
        );
        if (res.status === 401) {
          setCalendarEvents([]);
          setUserEmail(null);
          setCalendarLoading(false);
          return;
        }
        const data = await res.json();
        setCalendarEvents((data.items || []).filter(ev => typeof ev.description === "string" && ev.description.replace(/\s+/g, "").includes("__FROM_APP__")));
      } catch {
        setCalendarEvents([]);
      }
      setCalendarLoading(false);
    }
    if (calendarToken) {
      fetchUserEmail();
      fetchEvents();
    } else {
      setCalendarEvents([]);
      setUserEmail(null);
    }
  }, [calendarToken]);

  // Proteksi login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      setDocRef(getChecklistDoc(user.uid));
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchChecklist() {
      if (!docRef) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { penulisanList?: any[], tugasList?: any[], berkasList?: any[], judul?: string, pembimbing1?: string, pembimbing2?: string };
        setChecklist(data.penulisanList || []);
        setPenulisanList(data.penulisanList || []);
        setTugasList(data.tugasList || []);
        setBerkasList(data.berkasList || []);
        setJudul(data.judul || "Judul Tugas Akhir");
        setPembimbing1(data.pembimbing1 || "");
        setPembimbing2(data.pembimbing2 || "");
      }
    }
    fetchChecklist();
  }, [docRef]);

  if (loading || !user) return <div>Loading...</div>;

  // Format tanggal dan waktu
  function formatDateTime24(dt: string) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Styles
  const cardBg = theme === "dark"
    ? "#23272f"
    : "#fff";
  const cardShadow = theme === "dark"
    ? "0 4px 16px rgba(0,0,0,0.32)"
    : "0 4px 16px rgba(99,102,241,0.10)";
  const cardText = theme === "dark" ? "#f3f4f6" : "#222";
  const borderColor = theme === "dark" ? "#353a47" : "#e0e7ff";
  const inputStyle = {
    padding: "0.7em 1em",
    borderRadius: "10px",
    border: `1.5px solid #6366f1`,
    fontSize: "1.05em",
    width: "100%",
    background: theme === "dark" ? "#23272f" : "#fff",
    color: theme === "dark" ? "#f3f4f6" : "#222",
    marginBottom: "0.9em",
    boxSizing: "border-box" as "border-box"
  };

  // Modal style
  const modalOverlay = {
    position: "fixed" as "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
  const modalCard = {
    position: "relative" as "relative",
    minWidth: 350,
    maxWidth: 500,
    margin: "0 auto",
    background: cardBg,
    borderRadius: "18px",
    padding: "2rem",
    boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
    color: cardText,
    border: `1px solid ${borderColor}`,
    overflowY: "auto" as const,
    maxHeight: "90vh"
  };

  // Section style
  const sectionStyle = {
    maxWidth: 820,
    margin: "0 auto",
    marginBottom: "2em",
    background: cardBg,
    borderRadius: "18px",
    boxShadow: cardShadow,
    padding: "2em 1.5em",
    color: cardText,
    border: `1px solid ${borderColor}`
  };

  // Button style
  const buttonPrimary = {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.7em 1.2em",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px #6366f120",
    fontSize: "1em",
    transition: "background 0.2s"
  };

  const buttonCancel = {
    background: theme === "dark" ? "#353a47" : "#e0e7ff",
    color: theme === "dark" ? "#f3f4f6" : "#6366f1",
    border: "none",
    borderRadius: "10px",
    padding: "0.7em 1.2em",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "1em",
    marginLeft: "8px",
    transition: "background 0.2s"
  };

  // Checklist style
  const checklistItemStyle = {
    background: theme === "dark" ? "#23272f" : "#e0e7ff",
    borderRadius: "12px",
    padding: "1em 1.5em",
    color: cardText,
    fontWeight: 500,
    fontSize: "1.08em",
    border: `1px solid ${borderColor}`,
    boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
    marginBottom: "0.7em",
    display: "flex",
    alignItems: "center",
    gap: "0.8em"
  };

  // Helper progress dinamis (copy dari penulisan/page.tsx)
  function calcPenulisanProgress(list: any[]) {
    const totalBab = list.length;
    if (totalBab === 0) return { percent: 0, detail: [] };
    const babBobot = 100 / totalBab;
    let done = 0;
    let detail: { name: string, bobot: number, checked: boolean }[] = [];
    list.forEach(bab => {
      if (bab.subBab && bab.subBab.length > 0) {
        const subBabBobot = babBobot / bab.subBab.length;
        let subDone = 0;
        bab.subBab.forEach(sub => {
          detail.push({ name: `${bab.text} - ${sub.text}`, bobot: subBabBobot, checked: sub.checked });
          if (sub.checked) subDone += subBabBobot;
        });
        // Bab checked jika semua subBab checked
        if (bab.subBab.every(sub => sub.checked)) {
          done += babBobot;
        } else {
          done += subDone;
        }
      } else {
        detail.push({ name: bab.text, bobot: babBobot, checked: bab.checked });
        if (bab.checked) done += babBobot;
      }
    });
    return { percent: Math.round(done), detail };
  }

  // ProgressBar helper
  function ProgressBar({ total, done, title, color, percentOverride }: { total: number, done: number, title: string, color: string, percentOverride?: number }) {
    const percent = typeof percentOverride === "number" ? percentOverride : (total ? Math.round((done / total) * 100) : 0);
    return (
      <div style={{ marginBottom: "1.3em" }}>
        <div style={{
          fontWeight: 700,
          marginBottom: "0.5em",
          display: "flex",
          alignItems: "center",
          gap: "0.8em"
        }}>
          <span>{title}</span>
          <span style={{
            fontSize: "0.98em",
            color: "#aaa",
            fontWeight: 400
          }}>
            ({done}/{total} selesai)
          </span>
          <span style={{
            fontSize: "0.98em",
            fontWeight: 600,
            color: color
          }}>{percent}%</span>
        </div>
        <div style={{
          width: "100%",
          height: 18,
          background: theme === "dark" ? "#23272f" : "#e0e7ff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
          position: "relative"
        }}>
          <div style={{
            width: `${percent}%`,
            height: "100%",
            background: color,
            borderRadius: 8,
            transition: "width 0.7s cubic-bezier(.4,1.6,.4,1)"
          }} />
        </div>
      </div>
    );
  }

  // Modal edit judul/pembimbing
  const [showEditModal, setShowEditModal] = useState(false);

  function openEditModal() {
    setTempJudul(judul);
    setTempPembimbing1(pembimbing1);
    setTempPembimbing2(pembimbing2);
    setShowEditModal(true);
  }

  function saveEditModal() {
    setJudul(tempJudul);
    setPembimbing1(tempPembimbing1);
    setPembimbing2(tempPembimbing2);
    setShowEditModal(false);
    // Simpan ke Firestore agar data sinkron
    if (docRef) {
      setDoc(docRef, {
        judul: tempJudul,
        pembimbing1: tempPembimbing1,
        pembimbing2: tempPembimbing2,
      }, { merge: true });
    }
  }

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
      .nav-link, .theme-toggle-btn {
        font-size: 1em !important;
        padding: 0.2em 0.5em !important;
      }
      h1 { font-size: 1.15em !important; }
      h2 { font-size: 1em !important; }
      [data-section-style], [data-card-style] {
        padding: 0.7em 0.3em !important;
        max-width: 100vw !important;
        border-radius: 10px !important;
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
      }
      .checklist-section, .progress-section, .jadwal-section {
        padding: 0.7em 0.3em !important;
        max-width: 100vw !important;
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
      .checklist-section h3, .progress-section h2, .jadwal-section h2 {
        font-size: 0.98em !important;
        margin-bottom: 0.5em !important;
      }
      .checklist-section ol {
        margin-left: 0 !important;
        padding-left: 0 !important;
      }
      .checklist-section ol li {
        flex-direction: column !important;
        gap: 0.3em !important;
      }
      .main-menu-cards a {
        margin: 0.2em 0 !important;
      }
    }
    @media (max-width: 600px) {
      h1 { font-size: 1em !important; }
      h2 { font-size: 0.95em !important; }
      .main-menu-cards a {
        font-size: 0.95em !important;
        padding: 0.7em 0.2em !important;
      }
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

  // Konten dashboard utama
  return (
    <div className="min-h-screen">
      <div style={{ fontFamily: "Inter, Roboto, Arial, sans-serif", background: colorMainBg }}>
        <style>{responsiveStyle}</style>
        <h1 style={{
          fontSize: "1.45em",
          fontWeight: 800,
          margin: "1.2em auto 0.7em auto",
          color: colorAccent,
          background: theme === 'dark'
            ? 'linear-gradient(90deg,#a5b4fc,#7c3aed)'
            : 'linear-gradient(90deg,#7c3aed,#a5b4fc)',
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          textAlign: "center",
          letterSpacing: "0.01em"
        }}>
          Dashboard Tugas Akhir
        </h1>

        {/* Email User */}
        <div style={{
          textAlign: "center",
          fontSize: "1.18em",
          fontWeight: 700,
          margin: "0.7em auto 1.3em auto",
          background: theme === 'dark'
            ? 'linear-gradient(90deg,#6366f1,#a5b4fc)'
            : 'linear-gradient(90deg,#7c3aed,#a5b4fc)',
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          letterSpacing: "0.01em"
        }}>
          {user.email}
        </div>

        {/* Modal Edit Judul/Pembimbing */}
        {showEditModal && (
          <div style={modalOverlay} onClick={() => setShowEditModal(false)}>
            <div style={modalCard} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 700, fontSize: "1.22em", marginBottom: "1.2em" }}>Edit Judul & Pembimbing</h2>
              <div style={{ marginBottom: "1em" }}>
                <label>
                  Judul Tugas Akhir:
                  <input
                    type="text"
                    value={tempJudul}
                    onChange={e => setTempJudul(e.target.value)}
                    style={inputStyle}
                    autoFocus
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1em" }}>
                <label>
                  Pembimbing 1:
                  <input
                    type="text"
                    value={tempPembimbing1}
                    onChange={e => setTempPembimbing1(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "1em" }}>
                <label>
                  Pembimbing 2:
                  <input
                    type="text"
                    value={tempPembimbing2}
                    onChange={e => setTempPembimbing2(e.target.value)}
                    style={inputStyle}
                  />
                </label>
              </div>
              <div style={{ display: "flex", gap: "1em", marginTop: "1em" }}>
                <button style={buttonPrimary} onClick={saveEditModal}>Simpan</button>
                <button style={buttonCancel} onClick={() => setShowEditModal(false)}>Batal</button>
              </div>
            </div>
          </div>
        )}

        {/* Card Judul & Pembimbing */}
        <div style={{ ...sectionStyle, background: colorCardBg, color: colorText, boxShadow: colorGlassShadow, border: colorGlassBorder }}>
          <div>
            <h2 style={{
              fontWeight: 700,
              fontSize: "1.5em",
              marginBottom: "0.8em",
              color: cardText
            }}>{judul}</h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.7em",
              marginBottom: "1.2em"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7em" }}>
                <span style={{
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 18px",
                  fontSize: "1em",
                  fontWeight: 600,
                  minWidth: 120,
                  textAlign: "center"
                }}>Pembimbing 1</span>
                <span style={{ fontWeight: 500, color: pembimbing1 ? cardText : "#aaa", fontSize: "1.08em" }}>
                  {pembimbing1 || "Belum diisi"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7em" }}>
                <span style={{
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 18px",
                  fontSize: "1em",
                  fontWeight: 600,
                  minWidth: 120,
                  textAlign: "center"
                }}>Pembimbing 2</span>
                <span style={{ fontWeight: 500, color: pembimbing2 ? cardText : "#aaa", fontSize: "1.08em" }}>
                  {pembimbing2 || "Belum diisi"}
                </span>
              </div>
            </div>
            <button style={{ ...buttonPrimary, marginTop: "0.5em", width: 140 }} onClick={openEditModal}>Edit Data</button>
          </div>
        </div>

        {/* Main Menu Cards */}
        <div style={{
          display: "flex",
          flexDirection: "column", // agar menu vertikal di HP
          gap: "1em",
          marginBottom: "1.5em",
          width: "100%", // full lebar
          maxWidth: "100%", // hilangkan batas maxWidth
          margin: "0 auto 1.5em auto",
          justifyContent: "center",
          alignItems: "stretch",
          overflowX: "auto"
        }} className="main-menu-cards">
          {[
            { href: "/penulisan", label: "📝 Penulisan" },
            { href: "/catatan", label: "📒 Catatan" },
            { href: "/referensi", label: "📚 Referensi" },
            { href: "/kalender", label: "📅 Kalender" },
            { href: "/panduan", label: "📘 Panduan" }, // <-- Tambahkan ini
          ].map(card => (
            <a
              key={card.href}
              href={card.href}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%", // full lebar
                padding: "1.2em 0.7em",
                background: cardBg,
                borderRadius: "16px",
                boxShadow: cardShadow,
                textAlign: "center",
                textDecoration: "none",
                color: cardText,
                fontWeight: 700,
                fontSize: "1.18em",
                transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
                cursor: "pointer",
                border: `1.5px solid ${borderColor}`,
                margin: "0.2em 0"
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = theme === "dark"
                  ? "0 8px 32px rgba(99,102,241,0.18)"
                  : "0 8px 32px rgba(99,102,241,0.12)";
                e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
                e.currentTarget.style.background = theme === "dark"
                  ? "#353a47"
                  : "#e0e7ff";
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = cardShadow;
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.background = cardBg;
              }}
            >
              {card.label}
            </a>
          ))}
        </div>

        {/* Checklist Section */}
        <div style={{ ...sectionStyle }} data-section-style className="checklist-section">
          <h2 style={{ fontSize: "1.32em", fontWeight: 800, marginBottom: "1.1em" }}>Checklist Belum Selesai</h2>
          <div style={{ marginBottom: "1.5em" }}>
            <h3 style={{ fontSize: "1.09em", fontWeight: 700, marginBottom: "0.6em" }}>📝 Penulisan</h3>
            <ol style={{ padding: 0, margin: 0 }}>
              {penulisanList.filter(item => item && !item.checked).map(item => (
                <li key={item.id} style={checklistItemStyle}>
                  <span style={{ background: "#6366f1", color: "#fff", borderRadius: "7px", fontSize: "0.9em", padding: "2px 10px" }}>Penulisan</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
            {penulisanList.filter(item => item && !item.checked).length === 0 && (
              <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1.08em', margin: "0.7em 0" }}>Semua penulisan selesai! 🎉</div>
            )}
          </div>
          <div style={{ marginBottom: "1.5em" }}>
            <h3 style={{ fontSize: "1.09em", fontWeight: 700, marginBottom: "0.6em" }}>📋 Tugas</h3>
            <ol style={{ padding: 0, margin: 0 }}>
              {tugasList.filter(item => item && !item.checked).map(item => (
                <li key={item.id} style={checklistItemStyle}>
                  <span style={{ background: "#6366f1", color: "#fff", borderRadius: "7px", fontSize: "0.9em", padding: "2px 10px" }}>Tugas</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
            {tugasList.filter(item => item && !item.checked).length === 0 && (
              <div style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1.08em', margin: "0.7em 0" }}>Semua tugas selesai! 🎉</div>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: "1.09em", fontWeight: 700, marginBottom: "0.6em" }}>📁 Berkas</h3>
            <ol style={{ padding: 0, margin: 0 }}>
              {berkasList.filter(item => item && !item.checked).map(item => (
                <li key={item.id} style={checklistItemStyle}>
                  <span style={{ background: "#6366f1", color: "#fff", borderRadius: "7px", fontSize: "0.9em", padding: "2px 10px" }}>Berkas</span>
                  <span>{item.text}</span>
                </li>
              ))}
              {berkasList.filter(item => item && !item.checked).length === 0 && (
                <li style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1.08em', margin: "0.7em 0" }}>Semua berkas selesai! 🎉</li>
              )}
            </ol>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{ ...sectionStyle }} data-section-style className="progress-section">
          <h2 style={{ fontSize: "1.18em", fontWeight: 800, marginBottom: "1em" }}>Progress Checklist</h2>
          {/* Penulisan progress dinamis */}
          {(() => {
            const { percent } = calcPenulisanProgress(penulisanList);
            return (
              <ProgressBar
                total={penulisanList.length}
                done={penulisanList.filter(i => i && i.checked).length}
                title="Penulisan"
                color="linear-gradient(90deg,#6366f1,#60a5fa)"
                percentOverride={percent}
              />
            );
          })()}
          <ProgressBar
            total={tugasList.length}
            done={tugasList.filter(i => i && i.checked).length}
            title="Tugas"
            color="linear-gradient(90deg,#f59e42,#6366f1)"
          />
          <ProgressBar
            total={berkasList.length}
            done={berkasList.filter(i => i && i.checked).length}
            title="Berkas"
            color="linear-gradient(90deg,#34d399,#6366f1)"
          />
        </div>

        {/* Jadwal Tugas Akhir dari Kalender */}
        <div style={{ ...sectionStyle }} data-section-style className="jadwal-section">
          <h2 style={{ fontSize: "1.22em", fontWeight: 800, marginBottom: "1.1em" }}>Jadwal Tugas Akhir (Google Kalender)</h2>
          {calendarLoading ? (
            <div style={{ color: "#888", textAlign: "center", padding: "1em" }}>Mengambil jadwal...</div>
          ) : calendarEvents.length === 0 ? (
            <div style={{ color: "#aaa", textAlign: "center", padding: "1em" }}>Tidak ada jadwal tugas akhir</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {calendarEvents.map(ev => (
                <li key={ev.id}
                    style={{
                      background: cardBg,
                      borderRadius: "14px",
                      marginBottom: "1em",
                      padding: "1em 1.2em",
                      boxShadow: cardShadow,
                      color: cardText,
                      border: `1px solid ${borderColor}`,
                      transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
                    }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1.08em", marginBottom: "0.3em" }}>{ev.summary}</div>
                  <div style={{ color: theme === "dark" ? "#a1a1aa" : "#555", fontSize: "0.98em" }}>
                    {ev.start?.dateTime ? formatDateTime24(ev.start.dateTime) : ev.start?.date}
                    {" - "}
                    {ev.end?.dateTime ? formatDateTime24(ev.end.dateTime) : ev.end?.date}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
