"use client";
import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import jsPDF from "jspdf";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [filterTanggalAwal, setFilterTanggalAwal] = useState("");
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState("");
  const [selectedPdfIdxs, setSelectedPdfIdxs] = useState<number[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const { user, loading } = useAuth();
  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.isi,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setForm(f => ({ ...f, isi: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(form.isi || "");
  }, [showForm, editIdx]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark';
      setTheme(t === 'light' ? 'light' : 'dark');
    }
  }, []);

  const db = getFirestore(app);

  useEffect(() => {
    async function fetchCatatan() {
      const snapshot = await getDocs(collection(db, "catatan"));
      setCatatanList(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      }) as Catatan));
    }
    fetchCatatan();
  }, []);

  // Better color palette
  const colorAccent = '#7c3aed'; // Ungu (accent utama)
  const colorAccentLight = '#c7d2fe'; // Untuk mode terang
  const colorAccentSoft = '#a5b4fc'; // Untuk border dan shadow di light
  const colorAccentWarn = '#f59e42'; // Orange
  const colorDanger = '#ef4444';
  const colorSuccess = '#34d399';
  const colorCardBg = theme === 'dark'
    ? 'rgba(36, 41, 54, 0.82)'
    : 'rgba(255,255,255,0.96)';
  // Perbaikan tipe agar tidak error pada background gradient
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
  const colorModalBg = theme === 'dark'
    ? 'rgba(36,41,54,0.96)'
    : 'rgba(255,255,255,0.97)';
  const colorModalOverlay = theme === 'dark'
    ? 'rgba(32,26,53,0.55)'
    : 'rgba(136,142,233,0.18)';
  const colorGlassBorder = theme === 'dark'
    ? '1.5px solid rgba(124,58,237,0.28)'
    : '1.5px solid #7c3aed';
  const colorGlassShadow = theme === 'dark'
    ? '0 8px 32px rgba(124,58,237,0.22)'
    : '0 8px 32px rgba(124,58,237,0.09)';
  const colorFormBg = theme === 'dark'
    ? 'rgba(36,41,54,0.96)'
    : 'rgba(255,255,255,0.98)';

  // Filter + sort + tanggal
  let filteredCatatan = catatanList
    .filter(c => {
      const searchMatch =
        (c.nama ?? "").toLowerCase().includes(search.toLowerCase()) ||
        c.isi.replace(/<[^>]+>/g, "").toLowerCase().includes(search.toLowerCase());
      const awal = filterTanggalAwal ? filterTanggalAwal : "0000-00-00";
      const akhir = filterTanggalAkhir ? filterTanggalAkhir : "9999-12-31";
      const tanggalMatch = c.tanggal >= awal && c.tanggal <= akhir;
      return searchMatch && tanggalMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "desc") return a.tanggal < b.tanggal ? 1 : -1;
      else return a.tanggal > b.tanggal ? 1 : -1;
    });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.tanggal && form.isi.replace(/<[^>]+>/g, "").trim()) {
      if (editIdx !== null && filteredCatatan[editIdx]?.id) {
        updateDoc(doc(db, "catatan", filteredCatatan[editIdx].id!), {
          tanggal: form.tanggal,
          nama: form.nama,
          isi: form.isi
        });
        setCatatanList(list => list.map((item, i) => i === editIdx ? { ...form, id: filteredCatatan[editIdx].id } : item));
      } else {
        addDoc(collection(db, "catatan"), {
          tanggal: form.tanggal,
          nama: form.nama,
          isi: form.isi
        }).then(ref => {
          setCatatanList(list => [...list, { ...form, id: ref.id }]);
        });
      }
      setShowForm(false);
      setEditIdx(null);
      setForm({ tanggal: "", nama: "", isi: "" });
      if (editor) editor.commands.setContent("");
    }
  }

  function handleEdit(idx: number) {
    setForm(filteredCatatan[idx]);
    setShowForm(true);
    setEditIdx(idx);
    if (editor) editor.commands.setContent(filteredCatatan[idx].isi || "");
  }

  function handleDelete(idx: number) {
    if (confirm("Yakin ingin menghapus catatan ini?")) {
      const id = filteredCatatan[idx].id;
      if (id) {
        deleteDoc(doc(db, "catatan", id));
        setCatatanList(list => list.filter((item) => item.id !== id));
      }
    }
    setSelectedIdx(null);
    setSelectedPdfIdxs(selectedPdfIdxs.filter(x => x !== idx));
  }

  // PDF Export satu atau beberapa
  function exportPDF(idxList: number[]) {
    if (idxList.length === 0) return;
    const pdf = new jsPDF();
    pdf.setFont("helvetica");
    pdf.setFontSize(16);
    pdf.text("Daftar Catatan Asistensi", 20, 20);
    let y = 35;
    idxList.forEach((idx, no) => {
      const c = filteredCatatan[idx];
      pdf.setFontSize(13);
      pdf.text(`Catatan #${no+1}`, 20, y);
      y += 7;
      pdf.setFontSize(12);
      pdf.text(`Tanggal: ${c.tanggal}${c.nama ? " | Nama: " + c.nama : ""}`, 20, y);
      y += 8;
      pdf.text("Isi:", 20, y);
      y += 7;
      let isi = c.isi.replace(/<[^>]+>/g, "");
      const lines = pdf.splitTextToSize(isi, 170);
      lines.forEach(line => {
        pdf.text(line, 24, y);
        y += 7;
        if (y > 270) { pdf.addPage(); y = 20; }
      });
      y += 10;
      if (y > 270) { pdf.addPage(); y = 20; }
    });
    pdf.save(idxList.length === 1
      ? `catatan_${filteredCatatan[idxList[0]].tanggal}.pdf`
      : `catatan_asistensi_${new Date().toISOString().slice(0,10)}.pdf`
    );
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: colorMainBg as string,
      fontFamily: "Inter, Segoe UI, sans-serif",
      paddingBottom: "4rem",
      transition: "background 0.5s"
    }}>
      <div style={{
        maxWidth: 820,
        margin: "2.5rem auto",
        padding: "0 1rem",
        backdropFilter: "blur(2px)"
      }}>
        <h1 style={{
          fontSize: "2rem",
          marginBottom: "1.2em",
          color: colorAccent,
          background: theme === 'dark'
            ? ('linear-gradient(90deg,#c7d2fe,#7c3aed)' as string)
            : ('linear-gradient(90deg,#7c3aed,#a5b4fc)' as string),
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
        }}>Catatan Asistensi (TipTap)</h1>

        {/* Filter & Sort */}
        <div style={{
          display: "flex",
          gap: 18,
          alignItems: "center",
          marginBottom: 26,
          flexWrap: "wrap",
          background: theme === "dark"
            ? 'rgba(36,41,54,0.82)'
            : 'rgba(255,255,255,0.96)',
          borderRadius: 16,
          boxShadow: colorShadow,
          padding: "1.1em 1.2em"
        }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama/isi catatan..."
            style={{
              padding: "0.78em 1em",
              borderRadius: 10,
              border: `1.6px solid ${colorInputBorder}`,
              fontSize: "1.07em",
              width: 245,
              background: colorInputBg,
              color: colorText,
              boxShadow: colorShadow,
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={e => e.currentTarget.style.border = `2px solid ${colorAccent}`}
            onBlur={e => e.currentTarget.style.border = `1.6px solid ${colorInputBorder}`}
          />
          <input
            type="date"
            value={filterTanggalAwal}
            onChange={e => setFilterTanggalAwal(e.target.value)}
            style={{
              padding: "0.78em",
              borderRadius: 10,
              border: `1.6px solid ${colorInputBorder}`,
              fontSize: "1.07em",
              width: 145,
              background: colorInputBg,
              color: colorText,
              boxShadow: colorShadow,
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={e => e.currentTarget.style.border = `2px solid ${colorAccent}`}
            onBlur={e => e.currentTarget.style.border = `1.6px solid ${colorInputBorder}`}
          />
          <span style={{
            color: theme === "dark" ? colorAccentSoft : colorAccent,
            fontWeight: 500
          }}>s/d</span>
          <input
            type="date"
            value={filterTanggalAkhir}
            onChange={e => setFilterTanggalAkhir(e.target.value)}
            style={{
              padding: "0.78em",
              borderRadius: 10,
              border: `1.6px solid ${colorInputBorder}`,
              fontSize: "1.07em",
              width: 145,
              background: colorInputBg,
              color: colorText,
              boxShadow: colorShadow,
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={e => e.currentTarget.style.border = `2px solid ${colorAccent}`}
            onBlur={e => e.currentTarget.style.border = `1.6px solid ${colorInputBorder}`}
          />
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            style={{
              background: `linear-gradient(80deg,${colorAccent},${colorAccentWarn})`,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0.78em 1.2em",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: colorShadow,
              transition: "background 0.2s"
            }}
          >
            Urutkan: {sortOrder === "desc" ? "Terbaru" : "Terlama"}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditIdx(null);
              setForm({ tanggal: "", nama: "", isi: "" });
              if (editor) editor.commands.setContent("");
            }}
            style={{
              background: `linear-gradient(100deg,${colorAccent},${colorAccentWarn},${colorSuccess})`,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "0.78em 1.5em",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: colorShadow,
              fontSize: "1.13em",
              transition: "background 0.2s"
            }}
          >
            {showForm ? "Tutup Form" : "+ Catatan Baru"}
          </button>
        </div>

        {/* PDF Export controls */}
        <div style={{
          margin: "12px 0 24px 0",
          padding: "1em 1.2em",
          background: theme === "dark"
            ? "rgba(124,58,237,0.08)"
            : "rgba(124,58,237,0.07)",
          borderRadius: 14,
          border: colorGlassBorder,
          boxShadow: colorShadow,
          display: "flex",
          gap: 14,
          alignItems: "center",
          color: colorAccent,
          fontWeight: 500
        }}>
          <span style={{ fontWeight: 600, color: colorLabel }}>Pilih catatan untuk export PDF:</span>
          <button
            onClick={() => exportPDF(selectedPdfIdxs)}
            disabled={selectedPdfIdxs.length === 0}
            style={{
              background: selectedPdfIdxs.length === 0 ? colorAccentLight : colorAccent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0.73em 1.2em",
              fontWeight: 700,
              cursor: selectedPdfIdxs.length === 0 ? "not-allowed" : "pointer",
              fontSize: "1em",
              boxShadow: colorShadow,
              transition: "background 0.2s"
            }}
          >
            <span role="img" aria-label="PDF" style={{marginRight: 7}}>📄</span>
            Export PDF {selectedPdfIdxs.length > 1 ? "Terpilih" : "Catatan"}
          </button>
          <button
            onClick={() => setSelectedPdfIdxs(filteredCatatan.map((_, i) => i))}
            style={{
              background: "#fff",
              color: colorAccent,
              border: colorGlassBorder,
              borderRadius: 10,
              padding: "0.73em 1em",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "1em",
              boxShadow: colorShadow,
              transition: "background 0.2s"
            }}
          >
            Pilih Semua
          </button>
          <button
            onClick={() => setSelectedPdfIdxs([])}
            style={{
              background: "#fff",
              color: colorDanger,
              border: `1.5px solid ${colorDanger}`,
              borderRadius: 10,
              padding: "0.73em 1em",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "1em",
              boxShadow: colorShadow,
              transition: "background 0.2s"
            }}
          >
            Reset Pilihan
          </button>
        </div>

        {/* --- Inline Form TipTap --- */}
        {showForm && (
          <div style={{
            background: colorFormBg,
            borderRadius: 24,
            padding: "2.4rem 2rem 2.2rem 2rem",
            marginBottom: "2em",
            color: colorText,
            boxShadow: colorGlassShadow,
            maxWidth: 760,
            border: colorGlassBorder,
            margin: "0 auto",
            backdropFilter: "blur(10px)"
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.3em", fontWeight: 500 }}>
                <label style={{ color: colorLabel, fontSize: "1.13em", marginBottom: 6 }}>Tanggal Catatan:</label>
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
                <label style={{ color: colorLabel, fontSize: "1.13em", marginBottom: 6 }}>Catatan:</label>
                <EditorContent editor={editor} style={{
                  background: colorInputBg,
                  borderRadius: "18px",
                  minHeight: "220px",
                  marginTop: "10px",
                  marginBottom: "1em",
                  padding: "1.2em",
                  fontSize: "1.11em",
                  boxShadow: colorShadow,
                  border: `1.7px solid ${colorInputBorder}`,
                  outline: "none",
                  transition: "border 0.2s",
                }} />
              </div>
              <button
                type="submit"
                style={{
                  background: `linear-gradient(90deg,${colorAccent},${colorSuccess})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.75em 1.3em",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "1.09em",
                  boxShadow: colorShadow,
                  transition: "background 0.2s"
                }}
              >
                {editIdx !== null ? "Update" : "Simpan"}
              </button>
              {editIdx !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(null);
                    setForm({ tanggal: "", nama: "", isi: "" });
                    if (editor) editor.commands.setContent("");
                  }}
                  style={{
                    marginLeft: "10px",
                    background: "#fff",
                    color: colorAccent,
                    border: colorGlassBorder,
                    borderRadius: "10px",
                    padding: "0.75em 1.3em",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.09em",
                    boxShadow: colorShadow,
                    transition: "background 0.2s"
                  }}
                >
                  Batal
                </button>
              )}
            </form>
          </div>
        )}

        {/* --- List catatan --- */}
        <ul style={{
          marginTop: "1.7rem",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "1.35em"
        }}>
          {filteredCatatan.map((c, i) => (
            <li
              key={c.id || i}
              style={{
                background: colorCardBg,
                borderRadius: "22px",
                padding: "1.3em 1.7em",
                boxShadow: colorGlassShadow,
                fontWeight: 500,
                fontSize: "1.10em",
                color: colorText,
                border: colorGlassBorder,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "box-shadow 0.16s, background 0.18s, transform 0.16s"
              }}
              onClick={() => setSelectedIdx(i)}
              onMouseOver={e => {
                e.currentTarget.style.background = theme === 'dark'
                  ? 'rgba(124,58,237,0.20)'
                  : colorAccentLight;
                e.currentTarget.style.color = theme === 'dark' ? '#fff' : colorAccent;
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = colorCardBg;
                e.currentTarget.style.color = colorText;
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedPdfIdxs.includes(i)}
                  onChange={e => {
                    e.stopPropagation();
                    setSelectedPdfIdxs(arr => arr.includes(i)
                      ? arr.filter(x => x !== i)
                      : [...arr, i]
                    );
                  }}
                  style={{ width: 18, height: 18, accentColor: colorAccent }}
                  onClick={e => e.stopPropagation()}
                  title="Pilih untuk export PDF"
                />
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{
                      background: (new Date(c.tanggal).toDateString() === new Date().toDateString()) ? colorAccentWarn : colorAccent,
                      color: "#fff",
                      borderRadius: "10px",
                      padding: "4px 14px",
                      fontSize: "1em",
                      marginRight: "10px",
                      fontWeight: 700,
                      boxShadow: colorShadow,
                      letterSpacing: "0.01em"
                    }}>
                      {c.tanggal}
                    </span>
                    {c.nama && <span style={{ color: colorAccent, marginRight: "10px", fontWeight: 700 }}>{c.nama}</span>}
                  </div>
                  <div style={{ opacity: 0.74, fontSize: "1em" }}>
                    {typeof c.isi === "string"
                      ? c.isi.replace(/<[^>]+>/g, "").slice(0, 60) + (c.isi.replace(/<[^>]+>/g, "").length > 60 ? "..." : "")
                      : ""}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: "0.99em",
                color: colorAccent,
                fontWeight: 700,
                marginLeft: "1em",
                letterSpacing: "0.01em"
              }}>Detail</span>
            </li>
          ))}
        </ul>

        {/* --- Detail Modal --- */}
        {selectedIdx !== null && (
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              background: colorModalOverlay,
              zIndex: 9999,
              backdropFilter: "blur(6px)"
            }}
            onClick={() => setSelectedIdx(null)}
          >
            <div
              style={{
                position: "relative",
                maxWidth: 660,
                margin: "3.5rem auto",
                background: colorModalBg,
                borderRadius: "24px",
                padding: "2.6rem",
                boxShadow: colorGlassShadow,
                color: colorText,
                overflow: "hidden",
                border: `2px solid ${colorAccent}`,
                backdropFilter: "blur(10px)"
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{
                marginBottom: "1em",
                color: colorAccent,
                fontWeight: 800,
                fontSize: "1.36em"
              }}>
                {filteredCatatan[selectedIdx].tanggal}
                {filteredCatatan[selectedIdx].nama ? ` - ${filteredCatatan[selectedIdx].nama}` : ""}
              </h3>
              <div
                style={{
                  fontSize: "1.13em",
                  color: colorText,
                  marginBottom: "2.8em",
                  maxHeight: "46vh",
                  overflowY: "auto",
                  background: theme === 'dark' ? 'rgba(36,41,54,0.90)' : '#f8fafc',
                  borderRadius: "14px",
                  padding: "1.1em 1.3em",
                  boxShadow: theme === 'dark'
                    ? 'inset 0 2px 8px rgba(124,58,237,0.10)'
                    : 'inset 0 2px 8px rgba(124,58,237,0.07)',
                  border: `1.7px solid ${colorAccentSoft}`
                }}
                dangerouslySetInnerHTML={{ __html: filteredCatatan[selectedIdx].isi }}
              />
              <div style={{
                position: "sticky",
                bottom: "0",
                left: 0,
                width: "100%",
                padding: "1em 0",
                display: "flex",
                gap: "1em",
                borderTop: `1.6px solid ${colorAccent}`,
                justifyContent: "flex-end",
                zIndex: 2,
                background: theme === 'dark' ? 'rgba(36,41,54,0.96)' : '#fff'
              }}>
                <button
                  onClick={() => setSelectedIdx(null)}
                  style={{
                    background: colorAccent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.09em",
                    boxShadow: colorShadow,
                    transition: "background 0.2s"
                  }}
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleEdit(selectedIdx!)}
                  style={{
                    background: colorSuccess,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.09em",
                    boxShadow: colorShadow,
                    transition: "background 0.2s"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedIdx!)}
                  style={{
                    background: colorDanger,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.09em",
                    boxShadow: colorShadow,
                    transition: "background 0.2s"
                  }}
                >
                  Hapus
                </button>
                <button
                  onClick={() => exportPDF([selectedIdx!])}
                  style={{
                    background: colorAccentWarn,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.7em 1.2em",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.09em",
                    boxShadow: colorShadow,
                    transition: "background 0.2s"
                  }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}