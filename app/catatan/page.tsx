"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import jsPDF from "jspdf";

// Theme-aware color variables and gradients
const useThemeColors = (theme) => ({
  accent: "#7c3aed",
  accentSoft: "#a5b4fc",
  accentWarn: "#f59e42",
  success: "#22c55e",
  danger: "#ef4444",
  text: theme === "dark" ? "#f3f4f6" : "#22223b",
  bg: theme === "dark" ? "#13131a" : "#f5f7fa",
  cardBg: theme === "dark" ? "linear-gradient(135deg,#232334 60%,#292944 100%)" : "linear-gradient(135deg,#ede9fe 65%,#e0e7ff 100%)",
  inputBg: theme === "dark" ? "#18181b" : "#fff",
  glassShadow: theme === "dark" ? "0 4px 16px rgba(124,58,237,0.18)" : "0 4px 16px rgba(124,58,237,0.10)",
  glassBorder: theme === "dark" ? "2px solid #a5b4fc" : "2px solid #7c3aed",
  border: theme === "dark" ? "#353a47" : "#a5b4fc",
  cardBorder: theme === "dark" ? "#484865" : "#c4b5fd",
  cardShadow: theme === "dark"
    ? "0 8px 32px rgba(48,38,92,0.32),0 1.5px 8px rgba(124,58,237,0.17)"
    : "0 8px 32px rgba(208,202,255,0.21),0 1.5px 8px rgba(124,58,237,0.12)",
  gradientBg: theme === "dark"
    ? "linear-gradient(120deg,#232334 70%,#312e81 100%)"
    : "linear-gradient(120deg,#f5f7fa 70%,#ede9fe 100%)",
});

// Define Catatan type
type Catatan = {
  id: string;
  title: string;
  tanggal: string;
  url: string;
  user: string;
  jenis?: string;
};

export default function CatatanPage() {
  // State untuk tab jenis catatan
  const [jenisTab, setJenisTab] = useState<'asistensi'|'biasa'>('asistensi');
  // Fungsi hapus catatan
  async function handleDeleteCatatan(id: string) {
    if (!window.confirm("Yakin ingin menghapus catatan ini dari Notion?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notion-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: id }),
      });
      if (!res.ok) {
        alert("Gagal menghapus catatan dari Notion.");
      } else {
        // Refresh data setelah hapus
        await fetch("/api/save-catatan", { method: "POST" });
        const catatanRes = await fetch("/catatan.json");
        const data = await catatanRes.json();
        const mapped = (data.pages || [])
          .filter((item) => {
            const userVal = item.user ?? item.User ?? "";
            return userVal === user?.email;
          })
          .map((item) => ({
            id: item.id,
            title: item.title ?? item.Nama ?? "",
            tanggal: item.tanggal ?? item.Tanggal ?? "",
            url: item.url ?? item.Link ?? "",
            user: item.user ?? item.User ?? "",
            jenis:
              (Array.isArray(item.jenis) && item.jenis[0]?.text?.content)
              || (Array.isArray(item.Jenis) && item.Jenis[0]?.text?.content)
              || (typeof item.jenis === "string" ? item.jenis : undefined)
              || (typeof item.Jenis === "string" ? item.Jenis : undefined)
              || "asistensi",
          }));
        setCatatanList(mapped);
      }
    } catch (err) {
      alert("Terjadi error saat menghapus catatan.");
    }
    setLoading(false);
  }
  // Theme state
  const [theme, setTheme] = useState("dark");
  const colors = useThemeColors(theme);
  // Style mirip page penulisan
  const cardStyle = {
    background: theme === "dark"
      ? "rgba(36, 41, 54, 0.82)"
      : "rgba(255,255,255,0.96)",
    borderRadius: "18px",
    boxShadow: theme === "dark"
      ? "0 8px 32px rgba(99,102,241,0.18)"
      : "0 8px 32px rgba(99,102,241,0.10)",
    padding: "1.7em 2em",
    marginBottom: "2em",
    color: theme === "dark" ? "#f3f4f6" : "#222",
    border: theme === "dark" ? "1.5px solid #353a47" : "1.5px solid #e0e7ff",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };

  // Ambil user dari context
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [catatanList, setCatatanList] = useState<Catatan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", tanggal: "" });
  const [formJenis, setFormJenis] = useState<'asistensi'|'biasa'>('asistensi');
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t =
        document.body.getAttribute("data-theme") ||
        localStorage.getItem("theme") ||
        "dark";
      setTheme(t === "light" ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
    async function updateAndFetchCatatan(email) {
      setLoading(true);
      try {
        await fetch("/api/save-catatan", { method: "POST" });
        const res = await fetch("/catatan.json");
        const data = await res.json();
        const mapped = (data.pages || [])
          .filter((item) => {
            const userVal = item.user ?? item.User ?? "";
            return userVal === email;
          })
          .map((item) => ({
            id: item.id,
            title: item.title ?? item.Nama ?? "",
            tanggal: item.tanggal ?? item.Tanggal ?? "",
            url: item.url ?? item.Link ?? "",
            user: item.user ?? item.User ?? "",
            jenis:
              (Array.isArray(item.jenis) && item.jenis[0]?.text?.content)
              || (Array.isArray(item.Jenis) && item.Jenis[0]?.text?.content)
              || (typeof item.jenis === "string" ? item.jenis : undefined)
              || (typeof item.Jenis === "string" ? item.Jenis : undefined)
              || "asistensi",
          }));
        setCatatanList(mapped);
      } catch (err) {
        setCatatanList([]);
      }
      setLoading(false);
    }
    if (user && typeof user.email === "string" && user.email) {
      updateAndFetchCatatan(user.email);
    }
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!user || typeof user.email !== "string" || !user.email) return;
    setLoading(true);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const defaultTitle = `catatan_${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear().toString().slice(-2)}`;
    const titleToSend = form.title.trim() === "" ? defaultTitle : form.title;
    const tanggalToSend = form.tanggal.trim() === "" ? now.toISOString().split("T")[0] : form.tanggal;
    fetch("/api/notion-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleToSend,
        userId: user.email,
        tanggal: tanggalToSend,
        jenis: formJenis,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({ title: "", tanggal: "" });
        setFormJenis(jenisTab);
        setShowForm(false);
        fetch("/api/save-catatan", { method: "POST" })
          .then(() => fetch("/catatan.json"))
          .then((res) => res.json())
          .then((data) => {
            const mapped = (data.pages || [])
              .filter((item) => {
                const userVal = item.user ?? item.User ?? "";
                return userVal === user.email;
              })
              .map((item) => ({
                id: item.id,
                title: item.title ?? item.Nama ?? "",
                tanggal: item.tanggal ?? item.Tanggal ?? "",
                url: item.url ?? item.Link ?? "",
                user: item.user ?? item.User ?? "",
                jenis:
                  (Array.isArray(item.jenis) && item.jenis[0]?.text?.content)
                  || (Array.isArray(item.Jenis) && item.Jenis[0]?.text?.content)
                  || (typeof item.jenis === "string" ? item.jenis : undefined)
                  || (typeof item.Jenis === "string" ? item.Jenis : undefined)
                  || "asistensi",
              }));
            setCatatanList(mapped);
          });
      })
      .finally(() => setLoading(false));
  }

  // Filter hanya catatan milik user yang login
  const userEmail = user && typeof user.email === "string" ? user.email : "";
  const filteredCatatan = catatanList
    .filter((c: Catatan) => {
      const jenisVal = (c.jenis ?? "asistensi").toLowerCase().trim();
      return c.user === userEmail && jenisVal === jenisTab;
    })
    .filter(
      (c: Catatan) =>
        (searchTitle === "" ||
          (c.title ?? "").toLowerCase().includes(searchTitle.toLowerCase())) &&
        ((!searchDateStart || !c.tanggal || c.tanggal >= searchDateStart) &&
          (!searchDateEnd || !c.tanggal || c.tanggal <= searchDateEnd))
    );

  if (loading || authLoading)
    return (
      <div
        style={{
          color: colors.accent,
          textAlign: "center",
          marginTop: 48,
          fontWeight: 600,
          fontSize: "1.2em",
          letterSpacing: "0.04em",
        }}
      >
        Loading...
      </div>
    );

  return (
    <div style={{ padding: "0 1.5em", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <h1
        style={{
          fontSize: "2.2em",
          fontWeight: 900,
          margin: "2.5rem 0 1.5rem 0",
          color: colors.text,
          textAlign: "center",
          letterSpacing: "0.04em",
          fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
        }}
      >
        Catatan Asistensi
      </h1>
      {/* Tombol tambah catatan */}
      <div
        style={{ ...cardStyle, marginBottom: 28, padding: "1.2em 1.2em 0.7em 1.2em" }}
      >
        <input
          type="text"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          placeholder="Cari judul catatan..."
          style={{
            width: "calc(100% - 2px)",
            padding: "0.5em 0.8em",
            borderRadius: 8,
            border: `1.5px solid ${colors.border}`,
            marginBottom: 10,
            background: colors.inputBg,
            color: colors.text,
            fontWeight: 500,
            fontSize: "1em",
            boxShadow: "0 1px 2px rgba(124,58,237,0.06)",
            outline: "none",
            transition: "border 0.2s, box-shadow 0.2s",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <input
            type="date"
            value={searchDateStart}
            onChange={(e) => setSearchDateStart(e.target.value)}
            style={{
              flex: 1,
              padding: "0.85em",
              borderRadius: 10,
              border: `2px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontWeight: 500,
              fontSize: "1.07em",
              outline: "none",
            }}
          />
          <input
            type="date"
            value={searchDateEnd}
            onChange={(e) => setSearchDateEnd(e.target.value)}
            style={{
              flex: 1,
              padding: "0.85em",
              borderRadius: 10,
              border: `2px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontWeight: 500,
              fontSize: "1.07em",
              outline: "none",
            }}
          />
        </div>
        <button
          style={{
            background: colors.accent,
            color: "#fff",
            padding: "0.85em 1.55em",
            borderRadius: 12,
            fontWeight: 700,
            border: "none",
            boxShadow: colors.glassShadow,
            cursor: "pointer",
            fontSize: "1.08em",
            letterSpacing: "0.02em",
            marginTop: 5,
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Tutup Form" : "+ Catatan Baru"}
        </button>
      {/* Tab switch jenis catatan (pindah ke bawah tombol tambah catatan) */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, margin: "24px 0 18px 0" }}>
        <button
          type="button"
          onClick={() => { setJenisTab('biasa'); setFormJenis('biasa'); }}
          style={{
            background: jenisTab === 'biasa' ? colors.accent : colors.cardBg,
            color: jenisTab === 'biasa' ? '#fff' : colors.text,
            border: `2px solid ${colors.accent}`,
            borderRadius: 10,
            fontWeight: 700,
            padding: '0.7em 1.5em',
            fontSize: '1.08em',
            cursor: 'pointer',
            boxShadow: jenisTab === 'biasa' ? colors.glassShadow : 'none',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Catatan Biasa
        </button>
        <button
          type="button"
          onClick={() => { setJenisTab('asistensi'); setFormJenis('asistensi'); }}
          style={{
            background: jenisTab === 'asistensi' ? colors.accent : colors.cardBg,
            color: jenisTab === 'asistensi' ? '#fff' : colors.text,
            border: `2px solid ${colors.accent}`,
            borderRadius: 10,
            fontWeight: 700,
            padding: '0.7em 1.5em',
            fontSize: '1.08em',
            cursor: 'pointer',
            boxShadow: jenisTab === 'asistensi' ? colors.glassShadow : 'none',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Catatan Asistensi
        </button>
      </div>
      </div>
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: theme === "dark"
              ? "rgba(0,0,0,0.52)"
              : "rgba(0,0,0,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: colors.bg,
              borderRadius: 20,
              boxShadow: colors.cardShadow,
              border: colors.glassBorder,
              padding: 36,
              minWidth: 340,
              maxWidth: 420,
              color: colors.text,
              fontFamily:
                "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
            }}
          >
            <h2
              style={{
                color: colors.accent,
                fontWeight: 800,
                fontSize: "1.35rem",
                marginBottom: 22,
                textAlign: "center",
                letterSpacing: "0.03em",
              }}
            >
              Tambah Catatan Baru
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Pilihan jenis catatan */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, marginRight: 12 }}>Jenis Catatan:</label>
                <select
                  value={formJenis}
                  onChange={e => setFormJenis(e.target.value as 'asistensi'|'biasa')}
                  style={{
                    padding: '0.5em 1em',
                    borderRadius: 8,
                    border: `2px solid ${colors.border}`,
                    background: colors.inputBg,
                    color: colors.text,
                    fontWeight: 500,
                    fontSize: '1em',
                    outline: 'none',
                  }}
                >
                  <option value="asistensi">Catatan Asistensi</option>
                  <option value="biasa">Catatan Biasa</option>
                </select>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="Judul catatan... (opsional)"
                style={{
                  width: "100%",
                  padding: "0.85em",
                  borderRadius: 10,
                  border: `2px solid ${colors.border}`,
                  marginBottom: 15,
                  background: colors.inputBg,
                  color: colors.text,
                  fontWeight: 500,
                  fontSize: "1.06em",
                  outline: "none",
                }}
              />
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm({ ...form, tanggal: e.target.value })
                }
                placeholder="Tanggal catatan (opsional)"
                style={{
                  width: "100%",
                  padding: "0.85em",
                  borderRadius: 10,
                  border: `2px solid ${colors.border}`,
                  marginBottom: 22,
                  background: colors.inputBg,
                  color: colors.text,
                  fontWeight: 500,
                  fontSize: "1.06em",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: colors.accent,
                    color: "#fff",
                    padding: "0.85em 1.5em",
                    borderRadius: 10,
                    fontWeight: 700,
                    flex: 1,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.08em",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: colors.success,
                    color: "#fff",
                    padding: "0.85em 1.5em",
                    borderRadius: 10,
                    fontWeight: 700,
                    flex: 1,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.08em",
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {filteredCatatan.length === 0 ? (
        <div style={{ ...cardStyle, color: colors.danger, fontWeight: 700, textAlign: "center", fontSize: "1.12em", letterSpacing: "0.02em" }}>
          Tidak ada catatan milik Anda.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {filteredCatatan.map((c) => (
            <li
              key={c.id}
              className="catatan-card"
              style={{
                ...cardStyle,
                padding: "1.1em 1.4em",
                marginBottom: "1.2em",
                fontWeight: 500,
                boxShadow: theme === "dark"
                  ? "0 2px 8px 0 rgba(0,0,0,0.25)"
                  : "0 2px 8px 0 rgba(0,0,0,0.08)",
                border: theme === "dark" ? "1.5px solid #353a47" : "1.5px solid #e0e7ff",
                display: "block",
              }}
            >
              <div style={{ marginBottom: "0.7em" }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: colors.accent,
                    fontSize: "1.15em",
                    marginBottom: 2,
                    display: "block",
                  }}
                >
                  {c.title}
                </span>
                {c.tanggal && (
                  <span
                    style={{
                      color: theme === "dark" ? "#a5b4fc" : "#555",
                      fontSize: "0.98em",
                      marginTop: 2,
                      display: "block",
                    }}
                  >
                    ({c.tanggal})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.7em", marginTop: "0.5em" }}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: colors.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    fontSize: "1em",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
                    textDecoration: "none",
                    transition: "background 0.2s, color 0.2s",
                    display: "inline-block",
                    flex: 1,
                  }}
                >
                  Buka di Notion
                </a>
                <button
                  onClick={() => handleDeleteCatatan(c.id)}
                  style={{
                    background: colors.danger,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    fontSize: "1em",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.10)",
                    transition: "background 0.2s, color 0.2s",
                    display: "inline-block",
                    flex: 1,
                  }}
                  title="Hapus catatan dari Notion"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        @media (max-width: 600px) {
          div[style*='max-width: 800px'] {
            padding: 0.5em !important;
            font-size: 0.95em !important;
          }
          .catatan-card {
            padding: 0.7em 0.7em !important;
            font-size: 0.98em !important;
            flex-direction: column !important;
            gap: 6px !important;
            margin-bottom: 0.8em !important;
          }
          .catatan-card a, .catatan-card button {
            padding: 0.7em 1em !important;
            font-size: 0.98em !important;
            width: 100%;
            margin: 0.2em 0 !important;
            box-sizing: border-box;
          }
          input[type="text"], input[type="date"] {
            padding: 0.5em 0.7em !important;
            font-size: 0.98em !important;
          }
          button {
            width: 100%;
            font-size: 1em !important;
            margin-top: 0.5em !important;
          }
        }
        ::placeholder {
          color: ${theme === "dark" ? "#a5b4fc" : "#888"};
          opacity: 1;
        }
        input[type="text"], input[type="date"] {
          outline: none;
        }
        button:active {
          filter: brightness(0.94);
        }
      `}</style>
    </div>
  );
}