"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import jsPDF from "jspdf";

// Dummy color/theme variables (replace with your theme logic)
const colorAccent = "#7c3aed";
const colorAccentWarn = "#f59e42";
const colorSuccess = "#22c55e";
const colorDanger = "#ef4444";
const colorAccentLight = "#ede9fe";
const colorAccentSoft = "#a5b4fc";
const colorCardBg = "#fff";
const colorGlassShadow = "0 2px 8px rgba(124,58,237,0.07)";
const colorGlassBorder = "1.5px solid #a5b4fc";

export default function CatatanPage() {
  // Ambil user dari context
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [catatanList, setCatatanList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCatatan(email: string) {
      setLoading(true);
      try {
        const res = await fetch(`/api/notion-list?userId=${encodeURIComponent(email)}`);
        const data = await res.json();
        // Pastikan mapping data sesuai struktur Notion
        const mapped = (data.pages || []).map((item: any) => ({
          id: item.id,
          title: item.title ?? item.Nama ?? "",
          user: item.user ?? item.User ?? "",
          tanggal: item.tanggal ?? item.Tanggal ?? "",
          url: item.url ?? item.Link ?? ""
        }));
        setCatatanList(mapped);
      } catch (err) {
        setCatatanList([]);
      }
      setLoading(false);
    }
    // Pastikan user sudah login dan ada email
    if (user && typeof (user as any).email === "string" && (user as any).email) {
      fetchCatatan((user as any).email);
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  if (!user || typeof (user as any).email !== "string" || !(user as any).email) return;
    setLoading(true);
    fetch("/api/notion-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        userId: (user as any).email
        // tanggal: bisa ditambahkan jika ingin custom, default dari backend
      })
    })
      .then(res => res.json())
      .then(() => {
        setForm({ title: "" });
        setShowForm(false);
  fetch(`/api/notion-list?userId=${encodeURIComponent((user as any).email)}`)
          .then(res => res.json())
          .then(data => setCatatanList(data.pages || []));
      })
      .finally(() => setLoading(false));
  }

  // Filter hanya catatan milik user yang login
  const userEmail = (user && typeof (user as any).email === "string") ? (user as any).email : "";
  const filteredCatatan = catatanList
    .filter(c => c.user === userEmail)
    .filter(c => (c.title ?? "").toLowerCase().includes(search.toLowerCase()));

  if (loading || authLoading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24 }}>
      <h1 style={{ fontSize: "2rem", color: "#7c3aed", fontWeight: 800, marginBottom: 32 }}>Catatan Asistensi</h1>
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari judul catatan..."
          style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #a5b4fc", marginBottom: 12 }}
        />
        <button
          style={{ background: "#7c3aed", color: "#fff", padding: "0.7em 1.5em", borderRadius: 10, fontWeight: 700 }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Tutup Form" : "+ Catatan Baru"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ title: e.target.value })}
            placeholder="Judul catatan..."
            required
            style={{ width: "100%", padding: "0.7em", borderRadius: 8, border: "1.5px solid #a5b4fc", marginBottom: 12 }}
          />
          <button type="submit" style={{ background: "#22c55e", color: "#fff", padding: "0.7em 1.5em", borderRadius: 8, fontWeight: 700 }}>
            Simpan
          </button>
        </form>
      )}
      {filteredCatatan.length === 0 ? (
        <div style={{ color: colorDanger, fontWeight: 600, marginTop: 32 }}>
          Tidak ada catatan milik Anda.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredCatatan.map((c: any) => (
            <li key={c.id} style={{ background: "#ede9fe", marginBottom: 16, borderRadius: 10, padding: "1em 1.2em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#7c3aed" }}>{c.title}</span>
                {c.tanggal && (
                  <span style={{ marginLeft: 12, color: "#555", fontSize: 13 }}>
                    ({c.tanggal})
                  </span>
                )}
              </div>
              <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e", textDecoration: "underline", fontWeight: 700 }}>Buka di Notion</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}