"use client";
import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import jsPDF from "jspdf";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

type Catatan = {
  id?: string;
  tanggal: string;
  nama?: string;
  isi: string;
};

export default function CatatanTiptapPage() {
  const [catatanList, setCatatanList] = useState<Catatan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Catatan>({ tanggal: "", nama: "", isi: "" });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const db = getFirestore(app);

  // Fetch catatan dengan ID dokumen
  useEffect(() => {
    async function fetchCatatan() {
      const snapshot = await getDocs(collection(db, "catatan"));
      setCatatanList(snapshot.docs.map(doc => doc.data() as Catatan));
    }
    fetchCatatan();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.tanggal && form.isi.trim()) {
      setCatatanList([...catatanList, form]);
      await addDoc(collection(db, "catatan"), form);
      setShowForm(false);
      resetForm();
    }
  }

  // Edit Catatan
  function handleEdit(idx: number) {
    const catatan = filteredCatatan[idx];
    setForm(catatan);
    setEditMode(true);
    setShowForm(true);
    setSelectedIdx(null);
  }

  // Hapus Catatan
  async function handleDelete(idx: number) {
    const catatan = filteredCatatan[idx];
    if (catatan.id) {
      if (!confirm("Yakin ingin menghapus catatan ini?")) return;
      await deleteDoc(doc(db, "catatan", catatan.id));
      setCatatanList(catatanList.filter(c => c.id !== catatan.id));
      setSelectedIdx(null);
    }
  }

  function resetForm() {
    setForm({ tanggal: "", nama: "", isi: "" });
  }

  return (
    <div>
      <h1 style={{
        fontSize: "1.5rem",
        marginBottom: "1em",
        color: theme === "dark" ? "#f3f4f6" : "#222"
      }}>Catatan Asistensi</h1>
      <button
        onClick={() => { setShowForm(true); resetForm(); }}
        style={{
          background: theme === "dark" ? "linear-gradient(90deg,#6366f1,#60a5fa)" : "linear-gradient(90deg,#e0e7ff,#a5b4fc)",
          color: theme === "dark" ? "#fff" : "#222",
          border: "none",
          borderRadius: "12px",
          padding: "1em 1.7em",
          fontWeight: 600,
          marginBottom: "1.5em",
          cursor: "pointer",
          boxShadow: theme === "dark"
            ? "0 4px 16px rgba(99,102,241,0.18)"
            : "0 4px 16px rgba(99,102,241,0.10)",
          fontSize: "1.08em",
          transition: "background 0.2s, box-shadow 0.2s, transform 0.2s"
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = theme === "dark"
            ? "#6366f1"
            : "#e0e7ff";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.18)";
          e.currentTarget.style.transform = "scale(1.04)";
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = theme === "dark"
            ? "linear-gradient(90deg,#6366f1,#60a5fa)"
            : "linear-gradient(90deg,#e0e7ff,#a5b4fc)";
          e.currentTarget.style.boxShadow = theme === "dark"
            ? "0 4px 16px rgba(99,102,241,0.18)"
            : "0 4px 16px rgba(99,102,241,0.10)";
          e.currentTarget.style.transform = "none";
        }}
      >
        + Buat Catatan Baru
      </button>
      {showForm && (
        <div style={{
          border: "none",
          padding: "2.2rem",
          margin: "1.5rem 0",
          background: theme === "dark" ? "#23272f" : "#fff",
          borderRadius: "18px",
          boxShadow: theme === "dark"
            ? "0 8px 32px rgba(99,102,241,0.18)"
            : "0 8px 32px rgba(99,102,241,0.10)",
          color: theme === "dark" ? "#f3f4f6" : "#222"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1em" }}>
              <label>
                <b>Tanggal Catatan:</b>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm({ ...form, tanggal: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    marginTop: "7px",
                    padding: "0.7em 1em",
                    borderRadius: "10px",
                    border: `1.7px solid ${colorInputBorder}`,
                    fontSize: "1.11em",
                    background: colorInputBg,
                    color: colorText,
                    boxShadow: colorShadow,
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.border = `2px solid ${colorAccent}`}
                  onBlur={e => e.currentTarget.style.border = `1.7px solid ${colorInputBorder}`}
                />
              </div>
              <div style={{ marginBottom: "1.3em", fontWeight: 500 }}>
                <label style={{ color: colorLabel, fontSize: "1.13em", marginBottom: 6 }}>Nama (opsional):</label>
                <input
                  type="text"
                  value={form.nama || ""}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "0.7em",
                    borderRadius: "8px",
                    border: "1px solid #353a47",
                    background: theme === "dark" ? "#353a47" : "#fff",
                    color: theme === "dark" ? "#f3f4f6" : "#222",
                    resize: "vertical"
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              style={{
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.7em 1.2em",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                marginLeft: "8px",
                background: theme === "dark" ? "#353a47" : "#e0e7ff",
                color: theme === "dark" ? "#f3f4f6" : "#6366f1",
                border: "none",
                borderRadius: "8px",
                padding: "0.7em 1.2em",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Batal
            </button>
          </form>
        </div>
      )}
      <ul style={{
        marginTop: "1.5rem",
        padding: 0,
        listStyle: "none",
        display: "grid",
        gap: "1.3em"
      }}>
        {catatanList.map((c, i) => (
          <li key={i} style={{
            cursor: "pointer",
            marginBottom: "10px",
            background: theme === "dark" ? "#23272f" : "#fff",
            borderRadius: "18px",
            padding: "1.3em 1.7em",
            boxShadow: theme === "dark"
              ? "0 4px 16px rgba(99,102,241,0.18)"
              : "0 4px 16px rgba(99,102,241,0.10)",
            fontWeight: 500,
            fontSize: "1.08em",
            color: theme === "dark" ? "#f3f4f6" : "#222",
            border: "1px solid " + (theme === "dark" ? "#353a47" : "#e0e7ff"),
            transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
          }}
            onClick={() => setSelectedIdx(i)}
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
            <span>
              {c.tanggal}{c.nama ? `_${c.nama}` : ""}
            </span>
          </li>
        ))}
      </ul>
      {selectedIdx !== null && (
        <div style={{
          border: "none",
          padding: "2rem",
          marginTop: "1.5rem",
          background: theme === "dark" ? "#23272f" : "#fff",
          borderRadius: "18px",
          boxShadow: theme === "dark"
            ? "0 8px 32px rgba(99,102,241,0.18)"
            : "0 8px 32px rgba(99,102,241,0.10)",
          color: theme === "dark" ? "#f3f4f6" : "#222"
        }}>
          <h3 style={{ marginBottom: "0.5em", color: theme === "dark" ? "#f3f4f6" : "#222" }}>
            {catatanList[selectedIdx].tanggal}
            {catatanList[selectedIdx].nama ? ` - ${catatanList[selectedIdx].nama}` : ""}
          </h3>
          <pre style={{
            whiteSpace: "pre-wrap",
            fontSize: "1.1em",
            color: theme === "dark" ? "#f3f4f6" : "#222",
            marginBottom: "1em"
          }}>
            {catatanList[selectedIdx].isi}
          </pre>
          <button
            onClick={() => setSelectedIdx(null)}
            style={{
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.7em 1.2em",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}