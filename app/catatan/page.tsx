"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";

type Catatan = {
  id?: string;
  tanggal: string;
  nama?: string;
  isi: string;
};

export default function CatatanPage() {
  const [catatanList, setCatatanList] = useState<Catatan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Catatan>({ tanggal: "", nama: "", isi: "" });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [search, setSearch] = useState("");
  const db = getFirestore(app);

  // Fetch catatan dengan ID dokumen
  useEffect(() => {
    async function fetchCatatan() {
      const snapshot = await getDocs(collection(db, "catatan"));
      setCatatanList(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as Catatan)));
    }
    fetchCatatan();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  // Filtering & Sorting
  let filteredCatatan = catatanList
    .filter(c =>
      (c.nama?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      c.isi.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return a.tanggal < b.tanggal ? 1 : -1;
      } else {
        return a.tanggal > b.tanggal ? 1 : -1;
      }
    });

  // Submit Form (Add or Edit)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.tanggal && form.isi.trim()) {
      if (editMode && form.id) {
        await updateDoc(doc(db, "catatan", form.id), {
          tanggal: form.tanggal,
          nama: form.nama,
          isi: form.isi
        });
        setCatatanList(catatanList.map(c => c.id === form.id ? { ...form } : c));
      } else {
        const ref = await addDoc(collection(db, "catatan"), {
          tanggal: form.tanggal,
          nama: form.nama,
          isi: form.isi
        });
        setCatatanList([...catatanList, { ...form, id: ref.id }]);
      }
      setShowForm(false);
      setEditMode(false);
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
    setEditMode(false);
  }

  // Export ke PDF
  function handleExportPDF(idx: number) {
    const c = filteredCatatan[idx];
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text(`Catatan Asistensi TA`, 15, 20);
    docPDF.setFontSize(12);
    docPDF.text(`Tanggal: ${c.tanggal}`, 15, 30);
    if (c.nama) docPDF.text(`Nama: ${c.nama}`, 15, 38);
    docPDF.text(`Catatan:`, 15, 48);
    docPDF.setFontSize(12);
    docPDF.text(c.isi, 15, 57, { maxWidth: 175 });
    docPDF.save(`catatan_${c.tanggal.replaceAll("-", "")}.pdf`);
  }

  return (
    <div>
      <h1 style={{
        fontSize: "1.5rem",
        marginBottom: "1em",
        color: theme === "dark" ? "#f3f4f6" : "#222"
      }}>Catatan Asistensi</h1>

      {/* Search & Sort */}
      <div style={{
        display: "flex", gap: "1em", alignItems: "center", marginBottom: "1.2em"
      }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama/isi catatan..."
          style={{
            padding: "0.7em",
            borderRadius: "8px",
            border: "1.5px solid #6366f1",
            fontSize: "1em",
            width: 220,
            background: theme === "dark" ? "#23272f" : "#fff",
            color: theme === "dark" ? "#f3f4f6" : "#222"
          }}
        />
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.7em 1.2em",
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Urutkan: {sortOrder === "desc" ? "Terbaru" : "Terlama"}
        </button>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          style={{
            background: theme === "dark" ? "linear-gradient(90deg,#6366f1,#60a5fa)" : "linear-gradient(90deg,#e0e7ff,#a5b4fc)",
            color: theme === "dark" ? "#fff" : "#222",
            border: "none",
            borderRadius: "12px",
            padding: "0.7em 1.2em",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: theme === "dark"
              ? "0 4px 16px rgba(99,102,241,0.18)"
              : "0 4px 16px rgba(99,102,241,0.10)",
            fontSize: "1.08em"
          }}
        >
          + Catatan Baru
        </button>
      </div>

      {/* Form Add/Edit */}
      {showForm && (
        <div style={{
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
                    marginLeft: "8px",
                    padding: "0.5em",
                    borderRadius: "6px",
                    border: "1px solid #353a47",
                    background: theme === "dark" ? "#353a47" : "#fff",
                    color: theme === "dark" ? "#f3f4f6" : "#222"
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1em" }}>
              <label>
                <b>Nama (opsional):</b>
                <input
                  type="text"
                  value={form.nama || ""}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  style={{
                    marginLeft: "8px",
                    padding: "0.5em",
                    borderRadius: "6px",
                    border: "1px solid #353a47",
                    background: theme === "dark" ? "#353a47" : "#fff",
                    color: theme === "dark" ? "#f3f4f6" : "#222"
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1em" }}>
              <label>
                <b>Catatan:</b>
                <textarea
                  value={form.isi}
                  onChange={e => setForm({ ...form, isi: e.target.value })}
                  required
                  rows={5}
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
              {editMode ? "Update" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditMode(false); }}
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

      {/* Card Catatan Interaktif */}
      <ul style={{
        marginTop: "1.5rem",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "1.3em"
      }}>
        {filteredCatatan.map((c, i) => (
          <li
            key={c.id || i}
            style={{
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
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
            }}
            onClick={() => {
              if (selectedIdx === i) {
                setSelectedIdx(null); // Ketuk kartu aktif = tutup modal
              } else {
                setSelectedIdx(i);    // Ketuk kartu lain = buka modal
              }
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
              <div style={{ marginBottom: "6px" }}>
                <span style={{
                  background: (new Date(c.tanggal).toDateString() === new Date().toDateString()) ? "#f59e42" : "#a5b4fc",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "0.9em",
                  marginRight: "10px"
                }}>
                  {c.tanggal}
                </span>
                {c.nama && <span style={{ color: "#6366f1", marginRight: "10px" }}>{c.nama}</span>}
              </div>
              <div style={{
                opacity: 0.7,
                fontSize: "0.97em"
              }}>{c.isi.length > 60 ? c.isi.slice(0, 60) + "..." : c.isi}</div>
            </div>
            <span style={{
              fontSize: "0.9em",
              color: "#6366f1",
              fontWeight: 600,
              marginLeft: "1em"
            }}>Detail</span>
          </li>
        ))}
      </ul>

      {/* Modal Detail Catatan (Overlay + Sticky Button) */}
      {selectedIdx !== null && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 10
          }}
          onClick={() => setSelectedIdx(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 600,
              margin: "3rem auto",
              background: theme === "dark" ? "#23272f" : "#fff",
              borderRadius: "18px",
              padding: "2rem",
              boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              overflow: "hidden"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "0.5em", color: theme === "dark" ? "#f3f4f6" : "#222" }}>
              {filteredCatatan[selectedIdx].tanggal}
              {filteredCatatan[selectedIdx].nama ? ` - ${filteredCatatan[selectedIdx].nama}` : ""}
            </h3>
            <pre style={{
              whiteSpace: "pre-wrap",
              fontSize: "1.1em",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              marginBottom: "2.5em",
              maxHeight: "50vh",
              overflowY: "auto"
            }}>
              {filteredCatatan[selectedIdx].isi}
            </pre>
            {/* Sticky Action Bar */}
            <div style={{
              position: "sticky",
              bottom: "0",
              left: 0,
              width: "100%",
              background: theme === "dark" ? "#23272f" : "#fff",
              padding: "1em 0",
              display: "flex",
              gap: "1em",
              borderTop: "1px solid #6366f1",
              justifyContent: "flex-end",
              zIndex: 2
            }}>
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
              <button
                onClick={() => handleEdit(selectedIdx!)}
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.7em 1.2em",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedIdx!)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.7em 1.2em",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Hapus
              </button>
              <button
                onClick={() => handleExportPDF(selectedIdx!)}
                style={{
                  background: "#f59e42",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.7em 1.2em",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
