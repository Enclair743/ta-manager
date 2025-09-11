"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot, getDoc, setDoc } from "firebase/firestore";
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
  const [citationFormat, setCitationFormat] = useState<'APA' | 'IEEE' | 'Harvard'>('APA');
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
    if (!user) return;
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    if (file) {
      fileUrl = URL.createObjectURL(file);
      fileName = file.name;
    }
    let newList;
    if (editIdx !== null && filtered[editIdx]?.id) {
      newList = referensiList.map((r, i) => i === editIdx ? { ...r, jenis, data: form, fileUrl, fileName } : r);
    } else {
      newList = [...referensiList, { id: Date.now().toString(), jenis, data: form, fileUrl, fileName }];
    }
    const docRef = getReferensiDoc(user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { referensiList: newList });
    } else {
      await setDoc(docRef, { referensiList: newList });
    }
    setReferensiList(newList);
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
    if (!user) return;
    if (!confirm("Yakin ingin menghapus referensi ini?")) return;
    const newList = referensiList.filter((r, i) => i !== idx);
    const docRef = getReferensiDoc(user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { referensiList: newList });
    } else {
      await setDoc(docRef, { referensiList: newList });
    }
    setReferensiList(newList);
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
    if (citationFormat === 'IEEE') {
      switch (ref.jenis) {
        case "Buku":
          return `${d.penulis}, ${d.judul}${d.edisi ? `, ${d.edisi}` : ""}. ${d.kota}: ${d.penerbit}, ${d.tahun}.`;
        case "Jurnal":
          return `${d.penulis}, \"${d.judul}\", ${d.jurnal}${d.volume ? `, vol. ${d.volume}` : ""}${d.halaman ? `, hlm. ${d.halaman}` : ""}, ${d.tahun}${d.doi ? `, DOI: ${d.doi}` : ""}.`;
        case "Website":
          return `${d.penulis}, \"${d.judul}\", ${d.situs}, ${d.tahun}. [Online]. Tersedia: ${d.url}${d.akses ? ` (Diakses: ${d.akses})` : ""}`;
        case "Laporan":
          return `${d.penulis}, ${d.judul}${d.nomor ? `, No. ${d.nomor}` : ""}. ${d.penerbit}, ${d.tahun}${d.url ? `, ${d.url}` : ""}.`;
        case "Skripsi":
          return `${d.penulis}, ${d.judul}, ${d.jenisKarya}, ${d.universitas}, ${d.tahun}${d.url ? `, ${d.url}` : ""}.`;
        default:
          return "";
      }
    }
    if (citationFormat === 'Harvard') {
      switch (ref.jenis) {
        case "Buku":
          return `${d.penulis} ${d.tahun}, ${d.judul}${d.edisi ? `, ${d.edisi}` : ""}, ${d.penerbit}, ${d.kota}.`;
        case "Jurnal":
          return `${d.penulis} ${d.tahun}, '${d.judul}', ${d.jurnal}${d.volume ? `, vol. ${d.volume}` : ""}${d.halaman ? `, pp. ${d.halaman}` : ""}${d.doi ? `, doi: ${d.doi}` : ""}.`;
        case "Website":
          return `${d.penulis} ${d.tahun}, ${d.judul}, ${d.situs}, tersedia di: ${d.url}${d.akses ? ` (diakses: ${d.akses})` : ""}`;
        case "Laporan":
          return `${d.penulis} ${d.tahun}, ${d.judul}${d.nomor ? `, No. ${d.nomor}` : ""}, ${d.penerbit}${d.url ? `, tersedia di: ${d.url}` : ""}.`;
        case "Skripsi":
          return `${d.penulis} ${d.tahun}, ${d.judul}, ${d.jenisKarya}, ${d.universitas}${d.url ? `, tersedia di: ${d.url}` : ""}.`;
        default:
          return "";
      }
    }
    // Default APA
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

  // Tambahkan fungsi formatSitasi
  function formatSitasi(ref: Referensi) {
    const d = ref.data;
    // Contoh sederhana: Nama belakang, tahun
    // Bisa disesuaikan dengan format sitasi yang diinginkan
    if (!d.penulis || !d.tahun) return "";
    // Ambil nama belakang saja
    const namaBelakang = d.penulis.split(",")[0] || d.penulis;
    return `(${namaBelakang}, ${d.tahun})`;
  }

  if (loading || !user) return <div>Loading...</div>;

  // Responsive style for mobile & tablet
  const responsiveStyle = `
    @media (max-width: 900px) {
      .referensi-toolbar {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.7em !important;
        padding: 0.5em 0.1em !important;
      }
      .referensi-toolbar input,
      .referensi-toolbar select,
      .referensi-toolbar button {
        width: 100% !important;
        min-width: 0 !important;
        font-size: 0.98em !important;
        margin-bottom: 0.2em !important;
      }
    }
    @media (max-width: 600px) {
      .referensi-toolbar {
        padding: 0.3em 0.05em !important;
        gap: 0.5em !important;
      }
      .referensi-toolbar input,
      .referensi-toolbar select,
      .referensi-toolbar button {
        font-size: 0.95em !important;
        padding: 0.6em 0.7em !important;
      }
    }
  `;

  return (
    <div className="min-h-screen">
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
        display: "flex",
        flexWrap: "wrap",
        gap: "1em",
        marginBottom: "1.2em",
        alignItems: "center",
        justifyContent: "flex-start",
        rowGap: "0.7em",
        padding: "0.5em 0.2em"
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
            minWidth: 120,
            background: theme === "dark" ? "#23272f" : "#fff",
            color: theme === "dark" ? "#f3f4f6" : "#222",
            flex: "1 1 180px",
            maxWidth: "100%"
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
            color: theme === "dark" ? "#f3f4f6" : "#222",
            flex: "1 1 120px",
            minWidth: 90,
            maxWidth: "100%"
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
            cursor: "pointer",
            flex: "1 1 100px",
            minWidth: 90,
            maxWidth: "100%"
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
            fontSize: "1.08em",
            flex: "1 1 140px",
            minWidth: 120,
            maxWidth: "100%"
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
            cursor: "pointer",
            flex: "1 1 120px",
            minWidth: 100,
            maxWidth: "100%"
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
      <div style={{ marginBottom: "1em", display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ color: colorLabel, fontWeight: 600 }}>Format:</label>
        <select value={citationFormat} onChange={e => setCitationFormat(e.target.value as any)} style={{
          padding: "0.5em 1em",
          borderRadius: 8,
          border: `1.5px solid ${colorAccent}`,
          background: colorInputBg,
          color: colorText,
          fontWeight: 500
        }}>
          <option value="APA">APA</option>
          <option value="IEEE">IEEE</option>
          <option value="Harvard">Harvard</option>
        </select>
      </div>
      <div style={{
        display: "grid",
        gap: "0.7em",
        padding: 0,
        margin: 0
      }}>
        {filtered.map((ref, i) => (
          <div key={ref.id || i} style={{
            marginBottom: "0.7em",
            background: theme === "dark" ? "rgba(36,41,54,0.82)" : "rgba(255,255,255,0.96)",
            borderRadius: "14px",
            padding: "0.9em 1.1em 0.7em 1.1em",
            boxShadow: theme === "dark"
              ? "0 4px 16px rgba(124,58,237,0.13)"
              : "0 4px 16px rgba(124,58,237,0.07)",
            fontSize: "0.97em",
            fontWeight: 500,
            color: theme === "dark" ? "#f3f4f6" : "#222",
            border: theme === "dark" ? "1px solid rgba(124,58,237,0.13)" : "1px solid #a5b4fc",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
          }}>
            {/* Baris 1: Jenis sumber dan tahun */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.7em", marginBottom: "2px" }}>
              <span style={{
                background: theme === "dark" ? "#6366f1" : "#a5b4fc",
                color: "#fff",
                borderRadius: "7px",
                padding: "2px 10px",
                fontSize: "0.85em",
                fontWeight: 600,
                minWidth: 56,
                textAlign: "center"
              }}>{ref.jenis}</span>
              <span style={{
                color: theme === "dark" ? "#a5b4fc" : "#6366f1",
                fontSize: "0.85em",
                fontWeight: 500,
                minWidth: 38,
                textAlign: "left"
              }}>{ref.data.tahun}</span>
            </div>
            {/* Baris 2: Daftar pustaka dan salin di akhir teks */}
            <div style={{ marginBottom: "8px", wordBreak: "break-word", lineHeight: 1.6 }}>
              <span>{formatDaftarPustaka(ref)} </span>
              <span
                onClick={() => navigator.clipboard.writeText(formatDaftarPustaka(ref))}
                style={{
                  color: theme === "dark" ? "#a5b4fc" : "#6366f1",
                  fontSize: "0.82em",
                  marginLeft: "8px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500
                }}
              >salin</span>
            </div>
            {/* Baris 3: Sitasi dan salin di akhir teks */}
            <div style={{ marginBottom: "8px", wordBreak: "break-word", lineHeight: 1.6 }}>
              <span>{formatSitasi(ref)} </span>
              <span
                onClick={() => navigator.clipboard.writeText(formatSitasi(ref))}
                style={{
                  color: theme === "dark" ? "#a5b4fc" : "#6366f1",
                  fontSize: "0.82em",
                  marginLeft: "8px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: 500
                }}
              >salin</span>
            </div>
            {/* Baris 4: Download dan Preview file */}
            <div style={{ marginBottom: "8px", display: "flex", gap: "0.7em", alignItems: "center" }}>
              {ref.fileUrl && (
                <>
                  <a href={ref.fileUrl} download={ref.fileName}
                    style={{ color: theme === "dark" ? "#a5b4fc" : "#6366f1", textDecoration: "underline", fontWeight: 600 }}>
                    Download file
                  </a>
                  <button
                    style={{
                      background: theme === "dark" ? "rgba(124,58,237,0.18)" : "#e0e7ff",
                      color: theme === "dark" ? "#a5b4fc" : "#6366f1",
                      border: "none",
                      borderRadius: "7px",
                      padding: "0.25em 0.7em",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontSize: "0.93em"
                    }}
                    onClick={() => handlePreviewFile(ref.fileUrl!)}
                  >Preview PDF</button>
                </>
              )}
            </div>
            {/* Baris 5: Edit dan Hapus */}
            <div style={{ display: "flex", gap: "0.7em", flexWrap: "wrap", marginTop: "2px" }}>
              <button
                onClick={() => handleEdit(i)}
                style={{
                  background: theme === "dark" ? "rgba(124,58,237,0.18)" : "#6366f1",
                  color: theme === "dark" ? "#a5b4fc" : "#fff",
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.25em 0.7em",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.93em"
                }}
              >Edit</button>
              <button
                onClick={() => handleDelete(i)}
                style={{
                  background: theme === "dark" ? "rgba(239,68,68,0.13)" : "#ef4444",
                  color: theme === "dark" ? "#ef4444" : "#fff",
                  border: theme === "dark" ? "1px solid rgba(239,68,68,0.28)" : "none",
                  borderRadius: "7px",
                  padding: "0.25em 0.7em",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.93em"
                }}
              >Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
