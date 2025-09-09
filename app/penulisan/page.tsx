"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
  fileUrl?: string;
  fileName?: string;
};

const defaultPenulisan = [
  { id: uuidv4(), text: "Judul", checked: false },
  { id: uuidv4(), text: "Bab 1 - Pendahuluan", checked: false },
  { id: uuidv4(), text: "Bab 2 - Tinjauan Pustaka", checked: false },
  { id: uuidv4(), text: "Bab 3 - Metodologi", checked: false },
  { id: uuidv4(), text: "Bab 4 - Hasil & Pembahasan", checked: false },
  { id: uuidv4(), text: "Bab 5 - Kesimpulan", checked: false },
];

const defaultBerkas = [
  { id: uuidv4(), text: "KTP", checked: false },
  { id: uuidv4(), text: "KTM", checked: false },
  { id: uuidv4(), text: "Surat Pengantar", checked: false },
  { id: uuidv4(), text: "Proposal", checked: false },
];

// Pastikan semua konstanta warna menggunakan theme dari useState
const colorAccent = '#7c3aed';
const colorAccentLight = '#c7d2fe';
const colorAccentSoft = '#a5b4fc';
const colorAccentWarn = '#f59e42';
const colorDanger = '#ef4444';
const colorSuccess = '#34d399';

const db = getFirestore(app);
const storage = getStorage(app);
const checklistDoc = doc(db, "penulisan", "checklist");
const [penulisanList, setPenulisanList] = useState<ChecklistItem[]>(defaultPenulisan);
const [newPenulisan, setNewPenulisan] = useState("");
const [editPenulisanId, setEditPenulisanId] = useState<string | null>(null);
const [editPenulisanText, setEditPenulisanText] = useState("");

const [tugasList, setTugasList] = useState<ChecklistItem[]>([]);
const [newTugas, setNewTugas] = useState("");
const [editTugasId, setEditTugasId] = useState<string | null>(null);
const [editTugasText, setEditTugasText] = useState("");

// Checklist Berkas
const [berkasList, setBerkasList] = useState<ChecklistItem[]>(defaultBerkas);
const [newBerkas, setNewBerkas] = useState("");
const [editBerkasId, setEditBerkasId] = useState<string | null>(null);
const [editBerkasText, setEditBerkasText] = useState("");
const [uploadingId, setUploadingId] = useState<string | null>(null);
const [uploadError, setUploadError] = useState<string | null>(null);

const [onedrive, setOnedrive] = useState("");
const [drive, setDrive] = useState("");
const [theme, setTheme] = useState<"dark" | "light">("dark");
// Semua konstanta warna didefinisikan setelah deklarasi theme
const colorCardBg = theme === 'dark' ? 'rgba(36, 41, 54, 0.82)' : 'rgba(255,255,255,0.96)';
const colorMainBg = theme === 'dark'
  ? ('linear-gradient(120deg,#18181b 60%,#23272f 100%)' as string)
  : ('linear-gradient(120deg,#eef2ff 60%,#f5f7fb 100%)' as string);
const colorText = theme === 'dark' ? '#f3f4f6' : '#22223b';
const colorLabel = theme === 'dark' ? colorAccentSoft : colorAccent;
const colorInputBg = theme === 'dark' ? 'rgba(36,41,54,0.92)' : '#fff';
const colorInputBorder = theme === 'dark' ? colorAccentSoft : colorAccent;
const colorShadow = theme === 'dark'
  ? '0 2px 8px 0 rgba(0,0,0,0.25)'
  : '0 2px 8px 0 rgba(0,0,0,0.08)';
const colorGlassBorder = theme === 'dark'
  ? 'rgba(255,255,255,0.08)'
  : 'rgba(36,41,54,0.08)';
const colorGlassShadow = theme === 'dark'
  ? '0 2px 8px 0 rgba(0,0,0,0.32)'
  : '0 2px 8px 0 rgba(0,0,0,0.12)';

const { user, loading } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!loading && !user) {
    router.push("/login");
  }
}, [user, loading, router]);

useEffect(() => {
  async function fetchChecklist() {
    const snap = await getDoc(checklistDoc);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.penulisanList)) setPenulisanList(data.penulisanList);
      if (Array.isArray(data.tugasList)) setTugasList(data.tugasList);
      if (Array.isArray(data.berkasList)) setBerkasList(data.berkasList);
      if (typeof data.onedrive === "string") setOnedrive(data.onedrive);
      if (typeof data.drive === "string") setDrive(data.drive);
    }
  }
  fetchChecklist();

  if (typeof window !== "undefined") {
    setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
  }
}, []);

// Checklist Penulisan Actions
async function handlePenulisanCheck(idx: number) {
  const updated = [...penulisanList];
  updated[idx].checked = !updated[idx].checked;
  setPenulisanList(updated);
  await setDoc(checklistDoc, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
}
async function handlePenulisanAdd() {
  if (newPenulisan.trim()) {
    const updated = [...penulisanList, { id: uuidv4(), text: newPenulisan, checked: false }];
    setPenulisanList(updated);
    setNewPenulisan("");
    await setDoc(checklistDoc, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }
}
function startEditPenulisan(item: ChecklistItem) {
  setEditPenulisanId(item.id);
  setEditPenulisanText(item.text);
}
async function handlePenulisanEditSave() {
  if (editPenulisanId && editPenulisanText.trim()) {
    const updated = penulisanList.map(i =>
      i.id === editPenulisanId ? { ...i, text: editPenulisanText } : i
    );
    setPenulisanList(updated);
    setEditPenulisanId(null);
    setEditPenulisanText("");
    await setDoc(checklistDoc, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }
}
async function handlePenulisanDelete(id: string) {
  const updated = penulisanList.filter(i => i.id !== id);
  setPenulisanList(updated);
  await setDoc(checklistDoc, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
}

// Checklist Tugas Actions
async function handleTugasCheck(idx: number) {
  const updated = [...tugasList];
  updated[idx].checked = !updated[idx].checked;
  setTugasList(updated);
  await setDoc(checklistDoc, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
}
async function handleTugasAdd() {
  if (newTugas.trim()) {
    const updated = [...tugasList, { id: uuidv4(), text: newTugas, checked: false }];
    setTugasList(updated);
    setNewTugas("");
    await setDoc(checklistDoc, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
  }
}
function startEditTugas(item: ChecklistItem) {
  setEditTugasId(item.id);
  setEditTugasText(item.text);
}
async function handleTugasEditSave() {
  if (editTugasId && editTugasText.trim()) {
    const updated = tugasList.map(i =>
      i.id === editTugasId ? { ...i, text: editTugasText } : i
    );
    setTugasList(updated);
    setEditTugasId(null);
    setEditTugasText("");
    await setDoc(checklistDoc, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
  }
}
async function handleTugasDelete(id: string) {
  const updated = tugasList.filter(i => i.id !== id);
  setTugasList(updated);
  await setDoc(checklistDoc, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
}

// Checklist Berkas Actions
async function handleBerkasCheck(idx: number) {
  const updated = [...berkasList];
  updated[idx].checked = !updated[idx].checked;
  setBerkasList(updated);
  await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
}
async function handleBerkasAdd() {
  if (newBerkas.trim()) {
    const updated = [...berkasList, { id: uuidv4(), text: newBerkas, checked: false }];
    setBerkasList(updated);
    setNewBerkas("");
    await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  }
}
function startEditBerkas(item: ChecklistItem) {
  setEditBerkasId(item.id);
  setEditBerkasText(item.text);
}
async function handleBerkasEditSave() {
  if (editBerkasId && editBerkasText.trim()) {
    const updated = berkasList.map(i =>
      i.id === editBerkasId ? { ...i, text: editBerkasText } : i
    );
    setBerkasList(updated);
    setEditBerkasId(null);
    setEditBerkasText("");
    await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  }
}
async function handleBerkasDelete(id: string) {
  const updated = berkasList.filter(i => i.id !== id);
  setBerkasList(updated);
  await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
}

// Upload Berkas (Firebase Storage)
async function handleBerkasUpload(id: string, file: File) {
  setUploadingId(id);
  setUploadError(null);
  try {
    const storageRef = ref(storage, `berkas_ta/${id}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const updated = berkasList.map(item =>
      item.id === id ? { ...item, fileUrl: url, fileName: file.name } : item
    );
    setBerkasList(updated);
    await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  } catch (err: any) {
    setUploadError("Gagal upload berkas.");
  }
  setUploadingId(null);
}
async function handleBerkasRemoveFile(id: string) {
  const updated = berkasList.map(item =>
    item.id === id ? { ...item, fileUrl: undefined, fileName: undefined } : item
  );
  setBerkasList(updated);
  await setDoc(checklistDoc, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
}

// OneDrive & Drive
async function handleOnedriveChange(val: string) {
  setOnedrive(val);
  await setDoc(checklistDoc, { penulisanList, tugasList, berkasList, onedrive: val, drive }, { merge: true });
}
async function handleDriveChange(val: string) {
  setDrive(val);
  await setDoc(checklistDoc, { penulisanList, tugasList, berkasList, onedrive, drive: val }, { merge: true });
}
function handleCopyOneDrive() {
  if (onedrive) {
    navigator.clipboard.writeText(onedrive);
    setShowCopyOneDrive(true);
    setTimeout(() => setShowCopyOneDrive(false), 1500);
  }
}
function handleCopyDrive() {
  if (drive) {
    navigator.clipboard.writeText(drive);
    setShowCopyDrive(true);
    setTimeout(() => setShowCopyDrive(false), 1500);
  }
}

// Style helpers
const cardStyle = {
  background: theme === "dark" ? "#23272f" : "#fff",
  borderRadius: "18px",
  boxShadow: theme === "dark"
    ? "0 8px 32px rgba(99,102,241,0.18)"
    : "0 8px 32px rgba(99,102,241,0.10)",
  padding: "1.7em 2em",
  marginBottom: "2em",
  color: theme === "dark" ? "#f3f4f6" : "#222",
  border: theme === "dark" ? "1.5px solid #353a47" : "none",
};

const btn = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.3em 0.9em",
  fontWeight: 500,
  cursor: "pointer",
  fontSize: "1em"
};
const btnRed = {
  ...btn,
  background: "#ef4444",
};
const btnGray = {
  ...btn,
  background: "#a5b4fc",
  color: "#23272f",
};

// ----- Checklist Item Layout -----
function renderChecklistList({
  list,
  onCheck,
  onEdit,
  onDelete,
  editId,
  editText,
  setEditText,
  onEditSave,
  setEditId,
  placeholder,
  newValue,
  setNewValue,
  onAdd,
}: {
  list: ChecklistItem[];
  onCheck: (idx: number) => void;
  onEdit: (item: ChecklistItem) => void;
  onDelete: (id: string) => void;
  editId: string | null;
  editText: string;
  setEditText: (txt: string) => void;
  onEditSave: () => void;
  setEditId: typeof setEditPenulisanId | typeof setEditTugasId | typeof setEditBerkasId;
  placeholder: string;
  newValue: string;
  setNewValue: (txt: string) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <ul style={{
        listStyle: "none",
        padding: 0,
        marginBottom: "1em",
      }}>
        {list.map((item, i) => (
          <li key={item.id} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginBottom: "1.3em",
            background: item.checked
              ? (theme === "dark" ? "#23272f" : "#e0e7ff")
              : (theme === "dark" ? "#23272f" : "#fff"),
            borderRadius: "10px",
            padding: "1em",
            boxShadow: item.checked
              ? "0 4px 16px rgba(99,102,241,0.15)"
              : "0 2px 8px rgba(99,102,241,0.05)",
            border: item.checked
              ? "1.5px solid #6366f1"
              : "1px solid #353a47",
            color: theme === "dark" ? "#f3f4f6" : "#222",
            transition: "box-shadow 0.2s, background 0.2s"
          }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onCheck(i)}
                style={{
                  marginRight: "1em",
                  accentColor: "#6366f1",
                  width: "1.2em",
                  height: "1.2em",
                }}
              />
              {editId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{
                      flex: 1,
                      marginRight: "0.5em",
                      padding: "0.5em",
                      borderRadius: "6px",
                      border: "1px solid #6366f1"
                    }}
                  />
                  <button onClick={onEditSave}
                    style={{ ...btn, marginRight: "0.3em" }}>Simpan</button>
                  <button onClick={() => setEditId(null)}
                    style={btnGray}>Batal</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: "1.08em" }}>{item.text}</span>
                  <button onClick={() => onEdit(item)}
                    style={{ ...btn, marginRight: "0.3em" }}>Edit</button>
                  <button onClick={() => onDelete(item.id)}
                    style={btnRed}>Hapus</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "0.6em", marginTop: "0.5em" }}>
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "0.7em",
            borderRadius: "8px",
            border: "1.5px solid #6366f1",
            fontSize: "1em"
          }}
        />
        <button
          onClick={onAdd}
          style={{
            ...btn,
            padding: "0.7em 1.2em",
            fontWeight: 500,
          }}
        >
          +
        </button>
      </div>
    </>
  );
}

// Responsive style for mobile
const responsiveStyle = `
  @media (max-width: 600px) {
    body {
      padding: 0 !important;
    }
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
    h1 {
      font-size: 1.3em !important;
    }
    h2 {
      font-size: 1.1em !important;
    }
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
  }
`;

const [showCopyOneDrive, setShowCopyOneDrive] = useState(false);
const [showCopyDrive, setShowCopyDrive] = useState(false);

function PenulisanPage() {
  if (loading || !user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", marginTop: 30, background: colorMainBg }}>
      <style>{responsiveStyle}</style>
      <h1 style={{
        fontSize: "2rem",
        marginBottom: "1em",
        color: colorAccent,
        background: theme === 'dark'
          ? ('linear-gradient(90deg,#c7d2fe,#7c3aed)' as string)
          : ('linear-gradient(90deg,#7c3aed,#a5b4fc)' as string),
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 700,
        letterSpacing: "-1px"
      }}>
        Penulisan Tugas Akhir
      </h1>

      {/* --- LINK DOKUMEN --- */}
      <div style={{ ...cardStyle, background: colorCardBg, color: colorText, boxShadow: colorGlassShadow, border: colorGlassBorder, marginBottom: 28 }}>
        <h2 style={{ marginBottom: 16, fontSize: "1.18em" }}>Dokumen Tugas Akhir</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, marginRight: 10 }}>Link OneDrive Dokumen TA:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em", marginTop: 5 }}>
            <input
              type="text"
              value={onedrive}
              onChange={e => handleOnedriveChange(e.target.value)}
              placeholder="Paste link OneDrive TA..."
              style={{
                flex: 1,
                padding: "0.8em",
                borderRadius: "10px",
                border: "1.5px solid #6366f1",
                fontSize: "1em",
                background: theme === "dark" ? "#23272f" : "#fff",
                color: theme === "dark" ? "#f3f4f6" : "#222"
              }}
            />
            <button
              onClick={handleCopyOneDrive}
              style={btn}>
              Copy
            </button>
            {onedrive && (
              <a
                href={onedrive}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...btnGray,
                  padding: "0.7em 1.2em",
                  textDecoration: "none"
                }}>
                Buka
              </a>
            )}
          </div>
          {showCopyOneDrive && (
            <span style={{ color: "#6366f1", marginLeft: 10, fontWeight: 500 }}>Link berhasil dicopy!</span>
          )}
        </div>
        <div>
          <label style={{ fontWeight: 500, marginRight: 10 }}>Link Google Drive Dokumen TA:</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8em", marginTop: 5 }}>
            <input
              type="text"
              value={drive}
              onChange={e => handleDriveChange(e.target.value)}
              placeholder="Paste link Google Drive TA..."
              style={{
                flex: 1,
                padding: "0.8em",
                borderRadius: "10px",
                border: "1.5px solid #6366f1",
                fontSize: "1em",
                background: theme === "dark" ? "#23272f" : "#fff",
                color: theme === "dark" ? "#f3f4f6" : "#222"
              }}
            />
            <button
              onClick={handleCopyDrive}
              style={btn}>
              Copy
            </button>
            {drive && (
              <a
                href={drive}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...btnGray,
                  padding: "0.7em 1.2em",
                  textDecoration: "none"
                }}>
                Buka
              </a>
            )}
          </div>
          {showCopyDrive && (
            <span style={{ color: "#6366f1", marginLeft: 10, fontWeight: 500 }}>Link berhasil dicopy!</span>
          )}
        </div>
      </div>

      {/* Checklist Penulisan */}
      <div style={cardStyle}>
        <h2 style={{
          marginBottom: 10,
          fontSize: "1.5em",
          fontWeight: 700,
          color: theme === "dark" ? "#a5b4fc" : "#6366f1"
        }}>Checklist Penulisan</h2>
        {renderChecklistList({
          list: penulisanList,
          onCheck: handlePenulisanCheck,
          onEdit: startEditPenulisan,
          onDelete: handlePenulisanDelete,
          editId: editPenulisanId,
          editText: editPenulisanText,
          setEditText: setEditPenulisanText,
          onEditSave: handlePenulisanEditSave,
          setEditId: setEditPenulisanId,
          placeholder: "Tambah item penulisan...",
          newValue: newPenulisan,
          setNewValue: setNewPenulisan,
          onAdd: handlePenulisanAdd,
        })}
      </div>

      {/* Checklist Tugas */}
      <div style={cardStyle}>
        <h2 style={{
          marginBottom: 10,
          fontSize: "1.5em",
          fontWeight: 700,
          color: theme === "dark" ? "#a5b4fc" : "#6366f1"
        }}>Checklist Tugas</h2>
        {renderChecklistList({
          list: tugasList,
          onCheck: handleTugasCheck,
          onEdit: startEditTugas,
          onDelete: handleTugasDelete,
          editId: editTugasId,
          editText: editTugasText,
          setEditText: setEditTugasText,
          onEditSave: handleTugasEditSave,
          setEditId: setEditTugasId,
          placeholder: "Tambah tugas baru...",
          newValue: newTugas,
          setNewValue: setNewTugas,
          onAdd: handleTugasAdd,
        })}
      </div>

      {/* Checklist Berkas - di bagian paling bawah */}
      <div style={cardStyle}>
        <h2 style={{
          marginBottom: 10,
          fontSize: "1.5em",
          fontWeight: 700,
          color: theme === "dark" ? "#a5b4fc" : "#6366f1"
        }}>Checklist Berkas</h2>
        <ul style={{
          listStyle: "none",
          padding: 0,
          marginBottom: "1em",
        }}>
          {berkasList.map((item, i) => (
            <li key={item.id} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginBottom: "1.3em",
              background: item.checked
                ? (theme === "dark" ? "#23272f" : "#e0e7ff")
                : (theme === "dark" ? "#23272f" : "#fff"),
              borderRadius: "10px",
              padding: "1em",
              boxShadow: item.checked
                ? "0 4px 16px rgba(99,102,241,0.15)"
                : "0 2px 8px rgba(99,102,241,0.05)",
              border: item.checked
                ? "1.5px solid #6366f1"
                : "1px solid #353a47",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              transition: "box-shadow 0.2s, background 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleBerkasCheck(i)}
                  style={{
                    marginRight: "1em",
                    accentColor: "#6366f1",
                    width: "1.2em",
                    height: "1.2em",
                  }}
                />
                {editBerkasId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editBerkasText}
                      onChange={e => setEditBerkasText(e.target.value)}
                      style={{
                        flex: 1,
                        marginRight: "0.5em",
                        padding: "0.5em",
                        borderRadius: "6px",
                        border: "1px solid #6366f1"
                      }}
                    />
                    <button onClick={handleBerkasEditSave}
                      style={{ ...btn, marginRight: "0.3em" }}>Simpan</button>
                    <button onClick={() => setEditBerkasId(null)}
                      style={btnGray}>Batal</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontWeight: 500, fontSize: "1.08em" }}>{item.text}</span>
                    <button onClick={() => startEditBerkas(item)}
                      style={{ ...btn, marginRight: "0.3em" }}>Edit</button>
                    <button onClick={() => handleBerkasDelete(item.id)}
                      style={btnRed}>Hapus</button>
                  </>
                )}
              </div>
              {/* Upload opsional */}
              <div style={{ marginTop: "0.7em", width: "100%" }}>
                {item.fileUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                      style={{
                        color: "#6366f1",
                        fontWeight: 500,
                        textDecoration: "underline"
                      }}>
                      {item.fileName || "Download Berkas"}
                    </a>
                    <button
                      onClick={() => handleBerkasRemoveFile(item.id)}
                      style={btnRed}>Hapus File</button>
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const input = (e.target as HTMLFormElement).elements.namedItem("file") as HTMLInputElement;
                      if (input?.files && input.files[0]) {
                        handleBerkasUpload(item.id, input.files[0]);
                      }
                    }}
                  >
                    <input
                      type="file"
                      name="file"
                      style={{
                        marginRight: "1em",
                        padding: "0.3em",
                        borderRadius: "5px",
                        border: "1px solid #6366f1",
                        fontSize: "0.95em"
                      }}
                      disabled={!!uploadingId}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.zip"
                    />
                    <button
                      type="submit"
                      disabled={!!uploadingId}
                      style={{ ...btn, padding: "0.3em 0.9em" }}>
                      {uploadingId === item.id ? "Mengunggah..." : "Upload"}
                    </button>
                  </form>
                )}
                {uploadError && uploadingId === item.id && (
                  <span style={{ color: "#ef4444", marginLeft: 10, fontWeight: 500 }}>{uploadError}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "0.6em", marginTop: "0.5em" }}>
          <input
            type="text"
            value={newBerkas}
            onChange={e => setNewBerkas(e.target.value)}
            placeholder="Tambah item berkas..."
            style={{
              flex: 1,
              padding: "0.7em",
              borderRadius: "8px",
              border: "1.5px solid #6366f1",
              fontSize: "1em"
            }}
          />
          <button
            onClick={handleBerkasAdd}
            style={{
              ...btn,
              padding: "0.7em 1.2em",
              fontWeight: 500,
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default PenulisanPage;
