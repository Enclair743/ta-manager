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
};

export default function CatatanPage() {
  // Theme state
  const [theme, setTheme] = useState("dark");
  const colors = useThemeColors(theme);

  // Ambil user dari context
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [catatanList, setCatatanList] = useState<Catatan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", tanggal: "" });
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
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({ title: "", tanggal: "" });
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
              }));
            setCatatanList(mapped);
          });
      })
      .finally(() => setLoading(false));
  }

  // Filter hanya catatan milik user yang login
  const userEmail = user && typeof user.email === "string" ? user.email : "";
  const filteredCatatan = catatanList
    .filter((c: Catatan) => c.user === userEmail)
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
    <div
      style={{
        maxWidth: 700,
        margin: "2rem auto",
        padding: 28,
        background: colors.gradientBg,
        borderRadius: 24,
        boxShadow: colors.glassShadow,
        color: colors.text,
        border: colors.glassBorder,
        fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
        fontSize: "1em",
        position: "relative",
        transition: "background 0.2s",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: "2.2em",
          fontWeight: 900,
          marginBottom: 38,
          color: colors.accent,
          background: theme === "dark"
            ? "linear-gradient(90deg,#a5b4fc,#7c3aed)"
            : "linear-gradient(90deg,#7c3aed,#a5b4fc)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.04em",
          fontFamily:
            "'Montserrat', 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
          textAlign: "center",
          textShadow: theme === "dark"
            ? "0 2px 8px #292944"
            : "0 2px 8px #c4b5fd",
        }}
      >
        Catatan Asistensi
      </h1>
      <div
        style={{
          marginBottom: 28,
          background: colors.cardBg,
          borderRadius: 16,
          boxShadow: colors.cardShadow,
          border: `2px solid ${colors.cardBorder}`,
          padding: "18px 18px 10px 18px",
        }}
      >
        <input
          type="text"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          placeholder="Cari judul catatan..."
          style={{
            width: "100%",
            padding: "0.85em",
            borderRadius: 10,
            border: `2px solid ${colors.border}`,
            marginBottom: 15,
            background: colors.inputBg,
            color: colors.text,
            fontWeight: 500,
            fontSize: "1.07em",
            boxShadow: "0 1px 4px rgba(124,58,237,0.08)",
            outline: "none",
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
        <div
          style={{
            color: colors.danger,
            fontWeight: 700,
            marginTop: 36,
            textAlign: "center",
            fontSize: "1.12em",
            letterSpacing: "0.02em",
            background: colors.cardBg,
            borderRadius: 12,
            padding: "1em 0.6em",
            boxShadow: colors.cardShadow,
            border: `2px solid ${colors.cardBorder}`,
          }}
        >
          Tidak ada catatan milik Anda.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {filteredCatatan.map((c) => (
            <li
              key={c.id}
              className="catatan-card"
              style={{
                background: colors.cardBg,
                marginBottom: 22,
                borderRadius: 14,
                padding: "1.1em 1.4em",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: colors.cardShadow,
                border: `2px solid ${colors.cardBorder}`,
                color: colors.text,
                transition: "background 0.2s, color 0.2s",
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: colors.accent,
                    fontSize: "1.09em",
                    marginBottom: 2,
                  }}
                >
                  {c.title}
                </span>
                {c.tanggal && (
                  <span
                    style={{
                      color: theme === "dark" ? "#a5b4fc" : "#555",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    ({c.tanggal})
                  </span>
                )}
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.success,
                  textDecoration: "underline",
                  fontWeight: 700,
                  fontSize: "1.02em",
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: theme === "dark"
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(34,197,94,0.12)",
                  boxShadow: "0 1px 5px rgba(34,197,94,0.09)",
                  border: `1.5px solid ${colors.success}`,
                }}
              >
                Buka di Notion
              </a>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        @media (max-width: 600px) {
          div[style*='max-width: 700px'] {
            padding: 10px !important;
            font-size: 0.93em !important;
          }
          .catatan-card {
            padding: 1em 1em !important;
            font-size: 1em !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .catatan-card a {
            padding: 7px 12px !important;
            font-size: 1em !important;
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