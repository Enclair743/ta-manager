"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

const defaultPenulisan = [
  { id: uuidv4(), text: "Judul", checked: false },
  { id: uuidv4(), text: "Bab 1 - Pendahuluan", checked: false },
  { id: uuidv4(), text: "Bab 2 - Tinjauan Pustaka", checked: false },
  { id: uuidv4(), text: "Bab 3 - Metodologi", checked: false },
  { id: uuidv4(), text: "Bab 4 - Hasil & Pembahasan", checked: false },
  { id: uuidv4(), text: "Bab 5 - Kesimpulan", checked: false },
];

export default function PenulisanPage() {
  const db = getFirestore(app);
  const checklistDoc = doc(db, "penulisan", "checklist");
  const [penulisanList, setPenulisanList] = useState<ChecklistItem[]>(defaultPenulisan);
  const [newPenulisan, setNewPenulisan] = useState("");
  const [editPenulisanId, setEditPenulisanId] = useState<string | null>(null);
  const [editPenulisanText, setEditPenulisanText] = useState("");

  const [tugasList, setTugasList] = useState<ChecklistItem[]>([]);
  const [newTugas, setNewTugas] = useState("");
  const [editTugasId, setEditTugasId] = useState<string | null>(null);
  const [editTugasText, setEditTugasText] = useState("");

  const [onedrive, setOnedrive] = useState("");
  const [drive, setDrive] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showCopyOneDrive, setShowCopyOneDrive] = useState(false);
  const [showCopyDrive, setShowCopyDrive] = useState(false);

  useEffect(() => {
    async function fetchChecklist() {
      const snap = await getDoc(checklistDoc);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.penulisanList)) setPenulisanList(data.penulisanList);
        if (Array.isArray(data.tugasList)) setTugasList(data.tugasList);
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
    await setDoc(checklistDoc, { penulisanList: updated, tugasList, onedrive, drive }, { merge: true });
  }
  async function handlePenulisanAdd() {
    if (newPenulisan.trim()) {
      const updated = [...penulisanList, { id: uuidv4(), text: newPenulisan, checked: false }];
      setPenulisanList(updated);
      setNewPenulisan("");
      await setDoc(checklistDoc, { penulisanList: updated, tugasList, onedrive, drive }, { merge: true });
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
      await setDoc(checklistDoc, { penulisanList: updated, tugasList, onedrive, drive }, { merge: true });
    }
  }
  async function handlePenulisanDelete(id: string) {
    const updated = penulisanList.filter(i => i.id !== id);
    setPenulisanList(updated);
    await setDoc(checklistDoc, { penulisanList: updated, tugasList, onedrive, drive }, { merge: true });
  }

  // Checklist Tugas Actions
  async function handleTugasCheck(idx: number) {
    const updated = [...tugasList];
    updated[idx].checked = !updated[idx].checked;
    setTugasList(updated);
    await setDoc(checklistDoc, { penulisanList, tugasList: updated, onedrive, drive }, { merge: true });
  }
  async function handleTugasAdd() {
    if (newTugas.trim()) {
      const updated = [...tugasList, { id: uuidv4(), text: newTugas, checked: false }];
      setTugasList(updated);
      setNewTugas("");
      await setDoc(checklistDoc, { penulisanList, tugasList: updated, onedrive, drive }, { merge: true });
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
      await setDoc(checklistDoc, { penulisanList, tugasList: updated, onedrive, drive }, { merge: true });
    }
  }
  async function handleTugasDelete(id: string) {
    const updated = tugasList.filter(i => i.id !== id);
    setTugasList(updated);
    await setDoc(checklistDoc, { penulisanList, tugasList: updated, onedrive, drive }, { merge: true });
  }

  // OneDrive & Drive
  async function handleOnedriveChange(val: string) {
    setOnedrive(val);
    await setDoc(checklistDoc, { penulisanList, tugasList, onedrive: val, drive }, { merge: true });
  }
  async function handleDriveChange(val: string) {
    setDrive(val);
    await setDoc(checklistDoc, { penulisanList, tugasList, onedrive, drive: val }, { merge: true });
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", marginTop: 30 }}>
      <h1 style={{
        fontSize: "2rem",
        marginBottom: "1em",
        color: theme === "dark" ? "#a5b4fc" : "#6366f1",
        fontWeight: 700,
        letterSpacing: "-1px"
      }}>
        Penulisan Tugas Akhir
      </h1>

      {/* --- LINK DOKUMEN --- */}
      <div style={{ ...cardStyle, marginBottom: 28 }}>
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
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.7em 1.2em",
                fontWeight: 500,
                cursor: "pointer"
              }}>
              Copy
            </button>
            {onedrive && (
              <a
                href={onedrive}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#a5b4fc",
                  color: "#23272f",
                  borderRadius: "8px",
                  padding: "0.7em 1.2em",
                  fontWeight: 500,
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
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.7em 1.2em",
                fontWeight: 500,
                cursor: "pointer"
              }}>
              Copy
            </button>
            {drive && (
              <a
                href={drive}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#a5b4fc",
                  color: "#23272f",
                  borderRadius: "8px",
                  padding: "0.7em 1.2em",
                  fontWeight: 500,
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
        <h2 style={{ marginBottom: 10 }}>Checklist Penulisan</h2>
        <ul style={{
          listStyle: "none",
          padding: 0,
          marginBottom: "1em",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1em",
        }}>
          {penulisanList.map((item, i) => (
            <li key={item.id} style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.7em",
              background: item.checked
                ? (theme === "dark" ? "linear-gradient(90deg,#353a47,#23272f)" : "#e0e7ff")
                : (theme === "dark" ? "#23272f" : "#fff"),
              borderRadius: "14px",
              padding: "1em",
              boxShadow: item.checked
                ? "0 8px 32px rgba(99,102,241,0.18)"
                : "0 4px 16px rgba(99,102,241,0.10)",
              border: item.checked
                ? "1.5px solid #6366f1"
                : "1px solid #353a47",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              transition: "box-shadow 0.2s, background 0.2s"
            }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handlePenulisanCheck(i)}
                style={{
                  marginRight: "1em",
                  accentColor: "#6366f1",
                  width: "1.2em",
                  height: "1.2em",
                }}
              />
              {editPenulisanId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editPenulisanText}
                    onChange={e => setEditPenulisanText(e.target.value)}
                    style={{
                      flex: 1,
                      marginRight: "0.5em",
                      padding: "0.5em",
                      borderRadius: "6px",
                      border: "1px solid #6366f1"
                    }}
                  />
                  <button onClick={handlePenulisanEditSave}
                    style={{
                      background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer", marginRight: "0.3em"
                    }}>Simpan</button>
                  <button onClick={() => setEditPenulisanId(null)}
                    style={{
                      background: "#e0e7ff", color: "#6366f1", border: "1px solid #6366f1", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer"
                    }}>Batal</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 500 }}>{item.text}</span>
                  <button onClick={() => startEditPenulisan(item)}
                    style={{
                      background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer", marginRight: "0.3em"
                    }}>Edit</button>
                  <button onClick={() => handlePenulisanDelete(item.id)}
                    style={{
                      background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer"
                    }}>Hapus</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "0.6em", marginTop: "0.5em" }}>
          <input
            type="text"
            value={newPenulisan}
            onChange={e => setNewPenulisan(e.target.value)}
            placeholder="Tambah item penulisan..."
            style={{
              flex: 1,
              padding: "0.7em",
              borderRadius: "8px",
              border: "1.5px solid #6366f1",
              fontSize: "1em"
            }}
          />
          <button
            onClick={handlePenulisanAdd}
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
            +
          </button>
        </div>
      </div>

      {/* Checklist Tugas */}
      <div style={cardStyle}>
        <h2 style={{ marginBottom: 10 }}>Checklist Tugas</h2>
        <ul style={{
          listStyle: "none",
          padding: 0,
          marginBottom: "1em",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1em",
        }}>
          {tugasList.map((item, i) => (
            <li key={item.id} style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.7em",
              background: item.checked
                ? (theme === "dark" ? "linear-gradient(90deg,#353a47,#23272f)" : "#e0e7ff")
                : (theme === "dark" ? "#23272f" : "#fff"),
              borderRadius: "14px",
              padding: "1em",
              boxShadow: item.checked
                ? "0 8px 32px rgba(99,102,241,0.18)"
                : "0 4px 16px rgba(99,102,241,0.10)",
              border: item.checked
                ? "1.5px solid #6366f1"
                : "1px solid #353a47",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              transition: "box-shadow 0.2s, background 0.2s"
            }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleTugasCheck(i)}
                style={{
                  marginRight: "1em",
                  accentColor: "#6366f1",
                  width: "1.2em",
                  height: "1.2em",
                }}
              />
              {editTugasId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editTugasText}
                    onChange={e => setEditTugasText(e.target.value)}
                    style={{
                      flex: 1,
                      marginRight: "0.5em",
                      padding: "0.5em",
                      borderRadius: "6px",
                      border: "1px solid #6366f1"
                    }}
                  />
                  <button onClick={handleTugasEditSave}
                    style={{
                      background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer", marginRight: "0.3em"
                    }}>Simpan</button>
                  <button onClick={() => setEditTugasId(null)}
                    style={{
                      background: "#e0e7ff", color: "#6366f1", border: "1px solid #6366f1", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer"
                    }}>Batal</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 500 }}>{item.text}</span>
                  <button onClick={() => startEditTugas(item)}
                    style={{
                      background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer", marginRight: "0.3em"
                    }}>Edit</button>
                  <button onClick={() => handleTugasDelete(item.id)}
                    style={{
                      background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3em 0.9em", cursor: "pointer"
                    }}>Hapus</button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "0.6em", marginTop: "0.5em" }}>
          <input
            type="text"
            value={newTugas}
            onChange={e => setNewTugas(e.target.value)}
            placeholder="Tambah tugas baru..."
            style={{
              flex: 1,
              padding: "0.7em",
              borderRadius: "8px",
              border: "1.5px solid #6366f1",
              fontSize: "1em"
            }}
          />
          <button
            onClick={handleTugasAdd}
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
            +
          </button>
        </div>
      </div>
    </div>
  );
}
