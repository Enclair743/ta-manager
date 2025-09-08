"use client";
import { useEffect, useState } from "react";
import app from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
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
  const db = getFirestore(app);
  const checklistDoc = doc(db, "penulisan", "checklist");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bodyTheme = document.body.getAttribute("data-theme");
      setTheme(bodyTheme === "light" ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
    async function fetchChecklist() {
      const snap = await getDoc(checklistDoc);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.penulisanList)) setPenulisanList(data.penulisanList);
        if (Array.isArray(data.tugasList)) setTugasList(data.tugasList);
        if (Array.isArray(data.berkasList)) setBerkasList(data.berkasList);
      }
    }
    fetchChecklist();
  }, [checklistDoc]);

  // Proteksi login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div>Loading...</div>;

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

  // ProgressBar helper
  function ProgressBar({ total, done, title, color }: { total: number, done: number, title: string, color: string }) {
    const percent = total ? Math.round((done / total) * 100) : 0;
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
  }

  return (
    <div style={{ fontFamily: "Inter, Roboto, Arial, sans-serif" }}>
      <h1 style={{
        fontSize: "2.1em",
        fontWeight: 800,
        margin: "0 auto 1.1em auto",
        color: cardText,
        textAlign: "center"
      }}>
        Dashboard Tugas Akhir
      </h1>

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
      <div style={sectionStyle}>
        <div>
          <h2 style={{
            fontWeight: 700,
            fontSize: "1.5em",
            marginBottom: "0.6em",
            color: cardText
          }}>{judul}</h2>
          <div style={{
            color: cardText,
            fontSize: "1.12em",
            marginBottom: "0.3em",
            display: "flex",
            alignItems: "center",
            gap: "0.5em"
          }}>
            <span style={{
              background: "#6366f1",
              color: "#fff",
              borderRadius: "8px",
              padding: "2px 12px",
              fontSize: "0.93em",
              fontWeight: 600
            }}>Pembimbing 1</span>
            <span><b>{pembimbing1 || <span style={{ color: "#aaa" }}>Belum diisi</span>}</b></span>
          </div>
          <div style={{
            color: cardText,
            fontSize: "1.12em",
            marginBottom: "0.7em",
            display: "flex",
            alignItems: "center",
            gap: "0.5em"
          }}>
            <span style={{
              background: "#6366f1",
              color: "#fff",
              borderRadius: "8px",
              padding: "2px 12px",
              fontSize: "0.93em",
              fontWeight: 600
            }}>Pembimbing 2</span>
            <span><b>{pembimbing2 || <span style={{ color: "#aaa" }}>Belum diisi</span>}</b></span>
          </div>
          <button style={buttonPrimary} onClick={openEditModal}>Edit Data</button>
        </div>
      </div>

      {/* Main Menu Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "2rem",
        marginBottom: "2em",
        maxWidth: 820,
        margin: "0 auto"
      }}>
        {[
          { href: "/penulisan", label: "📝 Penulisan" },
          { href: "/catatan", label: "📒 Catatan" },
          { href: "/referensi", label: "📚 Referensi" },
          { href: "/kalender", label: "📅 Kalender" }
        ].map(card => (
          <a
            key={card.href}
            href={card.href}
            style={{
              display: "block",
              padding: "2.2em 1.2em",
              background: cardBg,
              borderRadius: "16px",
              boxShadow: cardShadow,
              textAlign: "center",
              textDecoration: "none",
              color: cardText,
              fontWeight: 700,
              fontSize: "1.24em",
              transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
              cursor: "pointer",
              border: `1.5px solid ${borderColor}`
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
      <div style={sectionStyle}>
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
            {penulisanList.filter(item => item && !item.checked).length === 0 && (
              <li style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1.08em', margin: "0.7em 0" }}>Semua penulisan selesai! 🎉</li>
            )}
          </ol>
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
            {tugasList.filter(item => item && !item.checked).length === 0 && (
              <li style={{ color: '#aaa', fontStyle: 'italic', fontSize: '1.08em', margin: "0.7em 0" }}>Semua tugas selesai! 🎉</li>
            )}
          </ol>
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
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "1.18em", fontWeight: 800, marginBottom: "1em" }}>Progress Checklist</h2>
        <ProgressBar
          total={penulisanList.length}
          done={penulisanList.filter(i => i && i.checked).length}
          title="Penulisan"
          color="linear-gradient(90deg,#6366f1,#60a5fa)"
        />
        <ProgressBar
          total={berkasList.length}
          done={berkasList.filter(i => i && i.checked).length}
          title="Berkas"
          color="linear-gradient(90deg,#34d399,#6366f1)"
        />
      </div>
    </div>
  );
}