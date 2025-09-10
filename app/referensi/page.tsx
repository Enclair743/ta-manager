"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

type JenisReferensi = "Buku" | "Jurnal" | "Website" | "Laporan" | "Skripsi";
type Referensi = {
  id?: string;
  jenis: JenisReferensi;
  data: any;
  fileName?: string;
  fileUrl?: string;
};

const jenisList: { label: string; value: JenisReferensi }[] = [
  { label: "Buku", value: "Buku" },
  { label: "Jurnal / Artikel Ilmiah", value: "Jurnal" },
  { label: "Website / Sumber Online", value: "Website" },
  { label: "Laporan / Dokumen Resmi", value: "Laporan" },
  { label: "Skripsi / Tesis / Disertasi", value: "Skripsi" },
];

function ReferensiForm({ jenis, form, setForm }: { jenis: JenisReferensi; form: any; setForm: any }) {
  const inputStyle: React.CSSProperties = {
    marginTop: "6px",
    padding: "0.5em 1em",
    borderRadius: "6px",
    border: "1px solid #353a47",
    background: "#fff",
    color: "#222",
    boxSizing: "border-box",
    width: "100%",
    fontSize: "1em",
  };
  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1.1em",
  };

  if (jenis === "Buku") return (
    <>
      <div style={fieldStyle}>
        <label>Nama penulis (nama belakang, inisial):</label>
        <input type="text" value={form.penulis || ""} onChange={e => setForm({ ...form, penulis: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tahun terbit:</label>
        <input type="text" value={form.tahun || ""} onChange={e => setForm({ ...form, tahun: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Judul buku <span style={{ fontStyle: "italic" }}>(italic)</span>:</label>
        <input type="text" value={form.judul || ""} onChange={e => setForm({ ...form, judul: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Edisi (opsional):</label>
        <input type="text" value={form.edisi || ""} onChange={e => setForm({ ...form, edisi: e.target.value })} style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Kota penerbit:</label>
        <input type="text" value={form.kota || ""} onChange={e => setForm({ ...form, kota: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Nama penerbit:</label>
        <input type="text" value={form.penerbit || ""} onChange={e => setForm({ ...form, penerbit: e.target.value })} required style={inputStyle} />
      </div>
    </>
  );
  if (jenis === "Jurnal") return (
    <>
      <div style={fieldStyle}>
        <label>Nama penulis:</label>
        <input type="text" value={form.penulis || ""} onChange={e => setForm({ ...form, penulis: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tahun terbit:</label>
        <input type="text" value={form.tahun || ""} onChange={e => setForm({ ...form, tahun: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Judul artikel:</label>
        <input type="text" value={form.judul || ""} onChange={e => setForm({ ...form, judul: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Nama jurnal <span style={{ fontStyle: "italic" }}>(italic)</span>:</label>
        <input type="text" value={form.jurnal || ""} onChange={e => setForm({ ...form, jurnal: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Volume (nomor):</label>
        <input type="text" value={form.volume || ""} onChange={e => setForm({ ...form, volume: e.target.value })} style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Halaman:</label>
        <input type="text" value={form.halaman || ""} onChange={e => setForm({ ...form, halaman: e.target.value })} style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>DOI (opsional):</label>
        <input type="text" value={form.doi || ""} onChange={e => setForm({ ...form, doi: e.target.value })} style={inputStyle} />
      </div>
    </>
  );
  if (jenis === "Website") return (
    <>
      <div style={fieldStyle}>
        <label>Nama penulis / organisasi:</label>
        <input type="text" value={form.penulis || ""} onChange={e => setForm({ ...form, penulis: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tahun / tanggal update:</label>
        <input type="text" value={form.tahun || ""} onChange={e => setForm({ ...form, tahun: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Judul halaman / artikel:</label>
        <input type="text" value={form.judul || ""} onChange={e => setForm({ ...form, judul: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Nama situs:</label>
        <input type="text" value={form.situs || ""} onChange={e => setForm({ ...form, situs: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>URL:</label>
        <input type="text" value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tanggal akses (opsional):</label>
        <input type="text" value={form.akses || ""} onChange={e => setForm({ ...form, akses: e.target.value })} style={inputStyle} />
      </div>
    </>
  );
  if (jenis === "Laporan") return (
    <>
      <div style={fieldStyle}>
        <label>Nama lembaga/penulis:</label>
        <input type="text" value={form.penulis || ""} onChange={e => setForm({ ...form, penulis: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tahun:</label>
        <input type="text" value={form.tahun || ""} onChange={e => setForm({ ...form, tahun: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Judul laporan <span style={{ fontStyle: "italic" }}>(italic)</span>:</label>
        <input type="text" value={form.judul || ""} onChange={e => setForm({ ...form, judul: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Nomor laporan (opsional):</label>
        <input type="text" value={form.nomor || ""} onChange={e => setForm({ ...form, nomor: e.target.value })} style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Penerbit:</label>
        <input type="text" value={form.penerbit || ""} onChange={e => setForm({ ...form, penerbit: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>URL (opsional):</label>
        <input type="text" value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
      </div>
    </>
  );
  if (jenis === "Skripsi") return (
    <>
      <div style={fieldStyle}>
        <label>Nama penulis:</label>
        <input type="text" value={form.penulis || ""} onChange={e => setForm({ ...form, penulis: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Tahun:</label>
        <input type="text" value={form.tahun || ""} onChange={e => setForm({ ...form, tahun: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Judul skripsi/tesis/disertasi <span style={{ fontStyle: "italic" }}>(italic)</span>:</label>
        <input type="text" value={form.judul || ""} onChange={e => setForm({ ...form, judul: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>Jenis karya:</label>
        <select value={form.jenisKarya || "Skripsi"} onChange={e => setForm({ ...form, jenisKarya: e.target.value })} style={inputStyle}>
          <option value="Skripsi">Skripsi</option>
          <option value="Tesis">Tesis</option>
          <option value="Disertasi">Disertasi</option>
        </select>
      </div>
      <div style={fieldStyle}>
        <label>Nama universitas:</label>
        <input type="text" value={form.universitas || ""} onChange={e => setForm({ ...form, universitas: e.target.value })} required style={inputStyle} />
      </div>
      <div style={fieldStyle}>
        <label>URL (opsional):</label>
        <input type="text" value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
      </div>
    </>
  );
  return null;
}

export default function ReferensiPage() {
  const [referensiList, setReferensiList] = useState<Referensi[]>([]);
  const [jenis, setJenis] = useState<JenisReferensi>("Buku");
  const [form, setForm] = useState<any>({});
  const [file, setFile] = useState<File | undefined>(undefined);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<"tahun" | "jenis" | "penulis">("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const db = getFirestore(app);

  // Ganti doc menjadi per user
  function getReferensiDoc(uid: string) {
    return doc(db, "referensi", uid);
  }

  // Color palette mirip dashboard/catatan
  const colorAccent = '#7c3aed';
  const colorAccentLight = '#c7d2fe';
  const colorAccentSoft = '#a5b4fc';
  const colorAccentWarn = '#f59e42';
  const colorDanger = '#ef4444';
  const colorSuccess = '#34d399';
  const colorCardBg = theme === 'dark' ? 'rgba(36, 41, 54, 0.82)' : 'rgba(255,255,255,0.96)';
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
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const [docRef, setDocRef] = useState<any>(null);

  useEffect(() => {
    if (!loading && user) {
      setDocRef(getReferensiDoc(user.uid));
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchReferensi() {
      if (!docRef) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { referensiList?: Referensi[] };
        setReferensiList(data.referensiList || []);
      } else {
        setReferensiList([]);
      }
    }
    fetchReferensi();
  }, [docRef]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  let filtered = referensiList
    .filter(ref =>
      (ref.data.penulis?.toLowerCase() ?? "").includes(filter.toLowerCase()) ||
      (ref.data.judul?.toLowerCase() ?? "").includes(filter.toLowerCase()) ||
      (ref.jenis?.toLowerCase() ?? "").includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "tahun") {
        aVal = a.data.tahun ?? "";
        bVal = b.data.tahun ?? "";
      } else if (sortBy === "penulis") {
        aVal = a.data.penulis ?? "";
        bVal = b.data.penulis ?? "";
      } else {
        aVal = a.jenis ?? "";
        bVal = b.jenis ?? "";
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    if (file) {
      fileUrl = URL.createObjectURL(file);
      fileName = file.name;
    }
    if (editIdx !== null && filtered[editIdx]?.id) {
      await updateDoc(doc(db, "referensi", filtered[editIdx].id!), {
        jenis, data: form, fileUrl, fileName
      });
      setReferensiList(referensiList.map((r, i) =>
        i === editIdx ? { ...r, jenis, data: form, fileUrl, fileName } : r
      ));
    } else {
      const ref = await addDoc(collection(db, "referensi"), {
        jenis, data: form, fileUrl, fileName
      });
      setReferensiList([...referensiList, { id: ref.id, jenis, data: form, fileUrl, fileName }]);
    }
    resetForm();
    setShowModal(false);
  }

  function handleEdit(idx: number) {
    setJenis(filtered[idx].jenis);
    setForm(filtered[idx].data);
    setFile(undefined);
    setEditIdx(idx);
    setShowModal(true);
  }

  async function handleDelete(idx: number) {
    if (!confirm("Yakin ingin menghapus referensi ini?")) return;
    const id = filtered[idx].id;
    if (id) {
      await deleteDoc(doc(db, "referensi", id));
      setReferensiList(referensiList.filter(r => r.id !== id));
    }
  }

  function resetForm() {
    setJenis("Buku");
    setForm({});
    setFile(undefined);
    setEditIdx(null);
  }

  function handlePreviewFile(url: string) {
    setPreviewFileUrl(url);
  }

  function handleExportPDF() {
    const docPDF = new jsPDF();
    docPDF.setFontSize(14);
    docPDF.text("Daftar Pustaka", 15, 20);
    docPDF.setFontSize(11);
    let y = 30;
    filtered.forEach((ref, i) => {
      docPDF.text(`${i + 1}. ${formatDaftarPustaka(ref)}`, 15, y, { maxWidth: 175 });
      y += 10;
      if (y > 250) {
        docPDF.addPage();
        y = 20;
      }
    });
    docPDF.save("daftar_pustaka.pdf");
  }

  function formatDaftarPustaka(ref: Referensi) {
    const d = ref.data;
    switch (ref.jenis) {
      case "Buku":
        return `${d.penulis} (${d.tahun}). ${d.judul}${d.edisi ? ` (${d.edisi})` : ""}. ${d.kota}: ${d.penerbit}.`;
      case "Jurnal":
        return `${d.penulis} (${d.tahun}). ${d.judul}. ${d.jurnal}${d.volume ? `, ${d.volume}` : ""}${d.halaman ? `, ${d.halaman}` : ""}${d.doi ? `. ${d.doi}` : ""}`;
      case "Website":
        return `${d.penulis}. (${d.tahun}). ${d.judul}. ${d.situs}. ${d.url}${d.akses ? ` (Diakses: ${d.akses})` : ""}`;
      case "Laporan":
        return `${d.penulis} (${d.tahun}). ${d.judul}${d.nomor ? ` (${d.nomor})` : ""}. ${d.penerbit}${d.url ? `. ${d.url}` : ""}`;
      case "Skripsi":
        return `${d.penulis} (${d.tahun}). ${d.judul} [${d.jenisKarya}, ${d.universitas}]${d.url ? `. ${d.url}` : ""}`;
      default:
        return "";
    }
  }

  if (loading || !user) return <div>Loading...</div>;

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
      h1 { font-size: 1.3em !important; }
      h2 { font-size: 1.1em !important; }
      [data-section-style], [data-card-style] {
        padding: 1em 0.5em !important;
        max-width: 100vw !important;
        border-radius: 10px !important;
      }
      .main-menu-cards {
        flex-direction: column !important;
        gap: 1em !important;
        min-width: 0 !important;
        max-width: 100vw !important;
      }
      .main-menu-cards a {
        min-width: 0 !important;
        max-width: 100vw !important;
        font-size: 1em !important;
        padding: 1em 0.5em !important;
      }
      .checklist-section, .progress-section, .jadwal-section {
        padding: 1em 0.5em !important;
        max-width: 100vw !important;
      }
      input, select, button {
        font-size: 1em !important;
        min-width: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .MuiInputBase-root, .MuiFormControl-root {
        width: 100% !important;
        min-width: 0 !important;
      }
    }
  `;

  return (
    <div style={{ background: colorMainBg }}>
      <style>{responsiveStyle}</style>
      <h1 style={{
        fontSize: "1.5rem",
        marginBottom: "1em",
        color: colorAccent,
        background: theme === 'dark'
          ? ('linear-gradient(90deg,#c7d2fe,#7c3aed)' as string)
          : ('linear-gradient(90deg,#7c3aed,#a5b4fc)' as string),
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>Referensi</h1>
      <div style={{
        display: "flex", gap: "1em", marginBottom: "1.2em", alignItems: "center"
      }}>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Cari judul/penulis/jenis..."
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
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          style={{
            padding: "0.7em",
            borderRadius: "8px",
            border: "1.5px solid #6366f1",
            fontSize: "1em",
            background: theme === "dark" ? "#23272f" : "#fff",
            color: theme === "dark" ? "#f3f4f6" : "#222"
          }}
        >
          <option value="tahun">Sort: Tahun</option>
          <option value="jenis">Sort: Jenis</option>
          <option value="penulis">Sort: Penulis</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
          {sortOrder === "asc" ? "Naik" : "Turun"}
        </button>
        <button
          onClick={() => { setShowModal(true); resetForm(); }}
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
          + Referensi Baru
        </button>
        <button
          onClick={handleExportPDF}
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

      {/* Modal Tambah/Edit Referensi */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 10,
          overflowY: "auto" // agar modal bisa discroll
        }}
          onClick={() => setShowModal(false)}
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
              overflowY: "auto", // agar isi modal bisa discroll
              maxHeight: "90vh", // modal tidak keluar layar
            }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1em" }}>
                <label>
                  <b>Upload file (PDF):</b>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setFile(e.target.files?.[0])}
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
                  <b>Jenis referensi:</b>
                  <select
                    value={jenis}
                    onChange={e => { setJenis(e.target.value as JenisReferensi); setForm({}); }}
                    style={{
                      marginLeft: "8px",
                      padding: "0.5em 1em",
                      borderRadius: "6px",
                      border: "1px solid #353a47",
                      background: theme === "dark" ? "#353a47" : "#fff",
                      color: theme === "dark" ? "#f3f4f6" : "#222",
                      boxSizing: "border-box"
                    }}
                  >
                    {jenisList.map(j => (
                      <option key={j.value} value={j.value}>{j.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "1em" }}>
                <ReferensiForm jenis={jenis} form={form} setForm={setForm} />
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
                {editIdx !== null ? "Update" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
        </div>
      )}

      {/* Modal Preview File PDF */}
      {previewFileUrl && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 11
        }}
          onClick={() => setPreviewFileUrl(null)}
        >
          <div style={{
            position: "relative",
            maxWidth: "80vw",
            height: "80vh",
            margin: "3rem auto",
            background: "#fff",
            borderRadius: "18px",
            padding: "1rem",
            boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
            overflow: "hidden"
          }}
            onClick={e => e.stopPropagation()}>
            <iframe
              src={previewFileUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
            <button
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.5em 1em",
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => setPreviewFileUrl(null)}
            >Tutup</button>
          </div>
        </div>
      )}

      <h2 style={{
        marginBottom: "1em",
        color: theme === "dark" ? "#f3f4f6" : "#222"
      }}>Daftar Pustaka</h2>
      <ol style={{
        display: "grid",
        gap: "1.3em",
        padding: 0,
        margin: 0
      }}>
        {filtered.map((ref, i) => (
          <li key={ref.id || i} style={{
            marginBottom: "1em",
            background: theme === "dark" ? "#23272f" : "#fff",
            borderRadius: "18px",
            padding: "1.3em 1.7em",
            boxShadow: theme === "dark"
              ? "0 4px 16px rgba(99,102,241,0.18)"
              : "0 4px 16px rgba(99,102,241,0.10)",
            fontSize: "1.08em",
            fontWeight: 500,
            color: theme === "dark" ? "#f3f4f6" : "#222",
            border: "1px solid " + (theme === "dark" ? "#353a47" : "#e0e7ff"),
            transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
          }}>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "1em" }}>
              <span style={{
                background: "#6366f1",
                color: "#fff",
                borderRadius: "8px",
                padding: "2px 12px",
                fontSize: "0.9em",
                fontWeight: 600
              }}>{ref.jenis}</span>
              <span style={{
                color: "#60a5fa",
                fontSize: "0.9em"
              }}>{ref.data.tahun}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              {formatDaftarPustaka(ref)}
              {ref.fileUrl && (
                <span>
                  {" "}
                  | <a href={ref.fileUrl} download={ref.fileName}
                    style={{ color: "#6366f1", textDecoration: "underline", fontWeight: 600 }}>
                    Download file
                  </a>
                  <button
                    style={{
                      marginLeft: "8px",
                      background: "#e0e7ff",
                      color: "#6366f1",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.3em 0.8em",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                    onClick={() => handlePreviewFile(ref.fileUrl!)}
                  >
                    Preview PDF
                  </button>
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "1em" }}>
              <button
                onClick={() => handleEdit(i)}
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5em 1em",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >Edit</button>
              <button
                onClick={() => handleDelete(i)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5em 1em",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >Hapus</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
