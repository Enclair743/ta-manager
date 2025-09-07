"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

type JenisReferensi =
  | "Buku"
  | "Jurnal"
  | "Website"
  | "Laporan"
  | "Skripsi";

type Referensi = {
  jenis: JenisReferensi;
  data: any;
  file?: File;
};

const jenisList: { label: string; value: JenisReferensi }[] = [
  { label: "Buku", value: "Buku" },
  { label: "Jurnal / Artikel Ilmiah", value: "Jurnal" },
  { label: "Website / Sumber Online", value: "Website" },
  { label: "Laporan / Dokumen Resmi", value: "Laporan" },
  { label: "Skripsi / Tesis / Disertasi", value: "Skripsi" },
];

export default function ReferensiPage() {
  const [referensiList, setReferensiList] = useState<Referensi[]>([]);
  const [jenis, setJenis] = useState<JenisReferensi>("Buku");
  const [form, setForm] = useState<any>({});
  const [file, setFile] = useState<File | undefined>(undefined);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const db = getFirestore(app);

  useEffect(() => {
    async function fetchReferensi() {
      const snapshot = await getDocs(collection(db, "referensi"));
      setReferensiList(
        snapshot.docs.map(doc => doc.data() as Referensi)
      );
    }
    fetchReferensi();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newRef: Referensi = { jenis, data: form, file };
    setReferensiList([...referensiList, newRef]);
    await addDoc(collection(db, "referensi"), {
      jenis,
      data: form,
      // file: file ? file.name : null // file upload ke Storage, bukan Firestore
    });
    resetForm();
  }

  function resetForm() {
    setForm({});
    setFile(undefined);
    setJenis("Buku");
  }

  function renderForm() {
    const inputStyle: React.CSSProperties = {
      marginTop: "6px",
      padding: "0.5em 1em",
      borderRadius: "6px",
      border: "1px solid #353a47",
      background: theme === "dark" ? "#353a47" : "#fff",
      color: theme === "dark" ? "#f3f4f6" : "#222",
      boxSizing: "border-box",
      width: "100%",
      fontSize: "1em"
    };
    const fieldStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      marginBottom: "1.1em"
    };

    switch (jenis) {
      case "Buku":
        return (
          <>
            <div style={fieldStyle}>
              <label>Nama penulis:</label>
              <input
                type="text"
                value={form.penulis || ""}
                onChange={e => setForm({ ...form, penulis: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tahun terbit:</label>
              <input
                type="text"
                value={form.tahun || ""}
                onChange={e => setForm({ ...form, tahun: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Judul buku:</label>
              <input
                type="text"
                value={form.judul || ""}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Edisi (opsional):</label>
              <input
                type="text"
                value={form.edisi || ""}
                onChange={e => setForm({ ...form, edisi: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Kota penerbit:</label>
              <input
                type="text"
                value={form.kota || ""}
                onChange={e => setForm({ ...form, kota: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Nama penerbit:</label>
              <input
                type="text"
                value={form.penerbit || ""}
                onChange={e => setForm({ ...form, penerbit: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          </>
        );
      case "Jurnal":
        return (
          <>
            <div style={fieldStyle}>
              <label>Nama penulis:</label>
              <input
                type="text"
                value={form.penulis || ""}
                onChange={e => setForm({ ...form, penulis: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tahun terbit:</label>
              <input
                type="text"
                value={form.tahun || ""}
                onChange={e => setForm({ ...form, tahun: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Judul artikel:</label>
              <input
                type="text"
                value={form.judul || ""}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Nama jurnal:</label>
              <input
                type="text"
                value={form.jurnal || ""}
                onChange={e => setForm({ ...form, jurnal: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Volume (nomor):</label>
              <input
                type="text"
                value={form.volume || ""}
                onChange={e => setForm({ ...form, volume: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Halaman:</label>
              <input
                type="text"
                value={form.halaman || ""}
                onChange={e => setForm({ ...form, halaman: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>DOI (opsional):</label>
              <input
                type="text"
                value={form.doi || ""}
                onChange={e => setForm({ ...form, doi: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );
      case "Website":
        return (
          <>
            <div style={fieldStyle}>
              <label>Nama penulis / organisasi:</label>
              <input
                type="text"
                value={form.penulis || ""}
                onChange={e => setForm({ ...form, penulis: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tahun / tanggal update:</label>
              <input
                type="text"
                value={form.tahun || ""}
                onChange={e => setForm({ ...form, tahun: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Judul halaman / artikel:</label>
              <input
                type="text"
                value={form.judul || ""}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Nama situs:</label>
              <input
                type="text"
                value={form.situs || ""}
                onChange={e => setForm({ ...form, situs: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>URL:</label>
              <input
                type="text"
                value={form.url || ""}
                onChange={e => setForm({ ...form, url: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tanggal akses (opsional):</label>
              <input
                type="text"
                value={form.akses || ""}
                onChange={e => setForm({ ...form, akses: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );
      case "Laporan":
        return (
          <>
            <div style={fieldStyle}>
              <label>Nama lembaga/penulis:</label>
              <input
                type="text"
                value={form.penulis || ""}
                onChange={e => setForm({ ...form, penulis: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tahun:</label>
              <input
                type="text"
                value={form.tahun || ""}
                onChange={e => setForm({ ...form, tahun: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Judul laporan:</label>
              <input
                type="text"
                value={form.judul || ""}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Nomor laporan (opsional):</label>
              <input
                type="text"
                value={form.nomor || ""}
                onChange={e => setForm({ ...form, nomor: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Penerbit:</label>
              <input
                type="text"
                value={form.penerbit || ""}
                onChange={e => setForm({ ...form, penerbit: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>URL (opsional):</label>
              <input
                type="text"
                value={form.url || ""}
                onChange={e => setForm({ ...form, url: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );
      case "Skripsi":
        return (
          <>
            <div style={fieldStyle}>
              <label>Nama penulis:</label>
              <input
                type="text"
                value={form.penulis || ""}
                onChange={e => setForm({ ...form, penulis: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Tahun:</label>
              <input
                type="text"
                value={form.tahun || ""}
                onChange={e => setForm({ ...form, tahun: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Judul skripsi/tesis/disertasi:</label>
              <input
                type="text"
                value={form.judul || ""}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>Jenis karya:</label>
              <select
                value={form.jenisKarya || "Skripsi"}
                onChange={e => setForm({ ...form, jenisKarya: e.target.value })}
                style={inputStyle}
              >
                <option value="Skripsi">Skripsi</option>
                <option value="Tesis">Tesis</option>
                <option value="Disertasi">Disertasi</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label>Nama universitas:</label>
              <input
                type="text"
                value={form.universitas || ""}
                onChange={e => setForm({ ...form, universitas: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label>URL (opsional):</label>
              <input
                type="text"
                value={form.url || ""}
                onChange={e => setForm({ ...form, url: e.target.value })}
                style={inputStyle}
              />
            </div>
          </>
        );
      default:
        return null;
    }
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

  return (
    <div>
      <h1 style={{
        fontSize: "1.5rem",
        marginBottom: "1em",
        color: theme === "dark" ? "#f3f4f6" : "#222"
      }}>Referensi</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          border: "none",
          padding: "2.2rem",
          marginBottom: "2rem",
          background: theme === "dark" ? "#23272f" : "#fff",
          borderRadius: "18px",
          boxShadow: theme === "dark"
            ? "0 8px 32px rgba(99,102,241,0.18)"
            : "0 8px 32px rgba(99,102,241,0.10)",
          color: theme === "dark" ? "#f3f4f6" : "#222"
        }}
      >
        <div style={{ marginBottom: "1em" }}>
          <label>
            <b>Upload file:</b>
            <input
              type="file"
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
          {renderForm()}
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
          Simpan Referensi
        </button>
      </form>
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
        {referensiList.map((ref, i) => (
          <li key={i} style={{
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
            <div>
              {formatDaftarPustaka(ref)}
              {ref.file && (
                <span>
                  {" "}
                  | <a href={URL.createObjectURL(ref.file)} download={ref.file.name}
                    style={{ color: "#6366f1", textDecoration: "underline", fontWeight: 600 }}>
                    Download file
                  </a>
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
