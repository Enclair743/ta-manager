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
  subBab?: ChecklistItem[];
};

const defaultPenulisan = [
  { id: uuidv4(), text: "Judul", checked: false },
  { id: uuidv4(), text: "Bab 1 - Pendahuluan", checked: false, subBab: [] },
  { id: uuidv4(), text: "Bab 2 - Tinjauan Pustaka", checked: false, subBab: [] },
  { id: uuidv4(), text: "Bab 3 - Metodologi", checked: false, subBab: [] },
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
// Ganti checklistDoc menjadi per user
function getChecklistDoc(uid: string) {
  return doc(db, "penulisan", uid);
}

function PenulisanPage() {
  const [penulisanList, setPenulisanList] = useState<ChecklistItem[]>(defaultPenulisan);
  const [newPenulisan, setNewPenulisan] = useState("");
  const [editPenulisanId, setEditPenulisanId] = useState<string | null>(null);
  const [editPenulisanText, setEditPenulisanText] = useState("");

  // Tambahkan state untuk tugasList
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
  const [showCopyOneDrive, setShowCopyOneDrive] = useState(false);
  const [showCopyDrive, setShowCopyDrive] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();
  const [docRef, setDocRef] = useState<any>(null);

  useEffect(() => {
    if (!loading && user) {
      setDocRef(getChecklistDoc(user.uid));
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchChecklist() {
      if (!docRef) return;
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as {
          penulisanList?: ChecklistItem[];
          tugasList?: ChecklistItem[];
          berkasList?: ChecklistItem[];
          onedrive?: string;
          drive?: string;
        };
        if (Array.isArray(data.penulisanList)) setPenulisanList(data.penulisanList);
        if (Array.isArray(data.tugasList)) setTugasList(data.tugasList); // fix error
        if (Array.isArray(data.berkasList)) setBerkasList(data.berkasList);
        if (typeof data.onedrive === "string") setOnedrive(data.onedrive);
        if (typeof data.drive === "string") setDrive(data.drive);
      }
    }
    fetchChecklist();
    if (typeof window !== "undefined") {
      setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
    }
  }, [docRef]);

  // Semua konstanta warna didefinisikan setelah deklarasi theme dan state
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

  // Checklist Penulisan Actions
  async function handlePenulisanCheck(idx: number) {
    const updated = [...penulisanList];
    updated[idx].checked = !updated[idx].checked;
    setPenulisanList(updated);
    if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }
  async function handlePenulisanAdd() {
    if (newPenulisan.trim()) {
      const updated = [...penulisanList, { id: uuidv4(), text: newPenulisan, checked: false }];
      setPenulisanList(updated);
      setNewPenulisan("");
      if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
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
      if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
    }
  }
  async function handlePenulisanDelete(id: string) {
    const updated = penulisanList.filter(i => i.id !== id);
    setPenulisanList(updated);
    if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }

  // Checklist Tugas Actions
  async function handleTugasCheck(idx: number) {
    const updated = [...tugasList];
    updated[idx].checked = !updated[idx].checked;
    setTugasList(updated);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
  }
  async function handleTugasAdd() {
    if (newTugas.trim()) {
      const updated = [...tugasList, { id: uuidv4(), text: newTugas, checked: false }];
      setTugasList(updated);
      setNewTugas("");
      if (docRef) await setDoc(docRef, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
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
      if (docRef) await setDoc(docRef, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
    }
  }
  async function handleTugasDelete(id: string) {
    const updated = tugasList.filter(i => i.id !== id);
    setTugasList(updated);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
  }

  // Checklist Berkas Actions
  async function handleBerkasCheck(idx: number) {
    const updated = [...berkasList];
    updated[idx].checked = !updated[idx].checked;
    setBerkasList(updated);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  }
  async function handleBerkasAdd() {
    if (newBerkas.trim()) {
      const updated = [...berkasList, { id: uuidv4(), text: newBerkas, checked: false }];
      setBerkasList(updated);
      setNewBerkas("");
      if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
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
      if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
    }
  }
  async function handleBerkasDelete(id: string) {
    const updated = berkasList.filter(i => i.id !== id);
    setBerkasList(updated);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
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
      if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
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
    if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  }

  // OneDrive & Drive
  async function handleOnedriveChange(val: string) {
    setOnedrive(val);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList, onedrive: val, drive }, { merge: true });
  }
  async function handleDriveChange(val: string) {
    setDrive(val);
    if (docRef) await setDoc(docRef, { penulisanList, tugasList, berkasList, onedrive, drive: val }, { merge: true });
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

  // State untuk popup input checklist
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalValue, setModalValue] = useState("");
  const [modalType, setModalType] = useState<"penulisan"|"tugas"|"berkas">("penulisan");

  // Fungsi untuk buka modal
  function openAddModal(type: "penulisan"|"tugas"|"berkas") {
    setModalType(type);
    setShowAddModal(true);
    setModalValue("");
  }
  // Fungsi simpan dari modal
  function handleModalSave() {
    if (!modalValue.trim()) return;
    if (modalType === "penulisan") {
      handlePenulisanAddModal(modalValue);
    } else if (modalType === "tugas") {
      handleTugasAddModal(modalValue);
    } else {
      handleBerkasAddModal(modalValue);
    }
    setShowAddModal(false);
    setModalValue("");
  }
  // Handler add dari modal
  function handlePenulisanAddModal(val: string) {
    const updated = [...penulisanList, { id: uuidv4(), text: val, checked: false }];
    setPenulisanList(updated);
    if (docRef) setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }
  function handleTugasAddModal(val: string) {
    const updated = [...tugasList, { id: uuidv4(), text: val, checked: false }];
    setTugasList(updated);
    if (docRef) setDoc(docRef, { penulisanList, tugasList: updated, berkasList, onedrive, drive }, { merge: true });
  }
  function handleBerkasAddModal(val: string) {
    const updated = [...berkasList, { id: uuidv4(), text: val, checked: false }];
    setBerkasList(updated);
    if (docRef) setDoc(docRef, { penulisanList, tugasList, berkasList: updated, onedrive, drive }, { merge: true });
  }

  // State untuk sub-bab
  const [subBabInput, setSubBabInput] = useState<{[key:string]:string}>({});
  const [showSubBabInput, setShowSubBabInput] = useState<{[key:string]:boolean}>({});
  // State untuk modal tambah sub-bab
  const [showAddSubBabModal, setShowAddSubBabModal] = useState(false);
  const [addSubBabValue, setAddSubBabValue] = useState("");
  const [addSubBabIdx, setAddSubBabIdx] = useState<number|null>(null);
  function handleSubBabInputChange(babId: string, value: string) {
    setSubBabInput(prev => ({ ...prev, [babId]: value }));
  }
  async function handleSubBabCheck(babIdx: number, subIdx: number) {
    const updated = [...penulisanList];
    if (!updated[babIdx].subBab) return;
    updated[babIdx].subBab![subIdx].checked = !updated[babIdx].subBab![subIdx].checked;
    setPenulisanList(updated);
    if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }
  async function handleAddSubBab(babIdx: number) {
    const bab = penulisanList[babIdx];
    const value = subBabInput[bab.id]?.trim();
    if (!value) return;
    const updated = [...penulisanList];
    if (!updated[babIdx].subBab) updated[babIdx].subBab = [];
    updated[babIdx].subBab!.push({ id: uuidv4(), text: value, checked: false });
    setPenulisanList(updated);
    setSubBabInput(prev => ({ ...prev, [bab.id]: "" }));
    if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
  }

  // State untuk modal edit bab dan sub-bab
  const [showEditBabModal, setShowEditBabModal] = useState(false);
  const [editBabIdx, setEditBabIdx] = useState<number|null>(null);
  const [editBabName, setEditBabName] = useState("");
  const [editSubBabList, setEditSubBabList] = useState<ChecklistItem[]>([]);
  const [editSubBabIdx, setEditSubBabIdx] = useState<number|null>(null);
  const [editSubBabName, setEditSubBabName] = useState("");

  // Style helpers
  const cardStyle = {
    background: theme === "dark"
      ? "rgba(36, 41, 54, 0.72)"
      : "rgba(255,255,255,0.82)",
    borderRadius: "18px",
    boxShadow: theme === "dark"
      ? "0 8px 32px rgba(99,102,241,0.18)"
      : "0 8px 32px rgba(99,102,241,0.10)",
    padding: "1.7em 2em",
    marginBottom: "2em",
    color: theme === "dark" ? "#f3f4f6" : "#222",
    border: theme === "dark" ? "1.5px solid #353a47" : "1.5px solid #e0e7ff",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
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
    setEditId: typeof setEditPenulisanId | typeof setEditBerkasId;
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
              background: item.checked
                ? (theme === "dark" ? "#23272f" : "#e0e7ff")
                : (theme === "dark" ? "#23272f" : "#fff"),
              borderRadius: "10px",
              padding: "0.7em 0.7em 0.5em 0.7em",
              boxShadow: item.checked
                ? "0 4px 16px rgba(99,102,241,0.12)"
                : "0 2px 8px rgba(99,102,241,0.04)",
              border: item.checked
                ? "1.2px solid #6366f1"
                : "1px solid #353a47",
              color: theme === "dark" ? "#f3f4f6" : "#222",
              marginBottom: "0.9em",
              transition: "box-shadow 0.2s, background 0.2s"
            }}>
              <div style={{ fontWeight: 500, fontSize: "0.98em", wordBreak: "break-word", marginBottom: "0.7em" }}>{item.text}</div>
              <div style={{ display: "flex", gap: "0.7em", width: "100%", marginBottom: "0.5em" }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onCheck(i)}
                  style={{ accentColor: "#6366f1", width: "1em", height: "1em" }}
                />
                <button onClick={() => {
                  setShowEditBabModal(true);
                  setEditBabIdx(i);
                  setEditBabName(item.text);
                  setEditSubBabList(item.subBab ? [...item.subBab] : []);
                  setEditSubBabIdx(null);
                  setEditSubBabName("");
                }} style={{ ...btn, padding: "0.4em 0.7em", fontSize: "0.95em" }}>Edit</button>
                <button onClick={() => onDelete(item.id)} style={{ ...btnRed, padding: "0.4em 0.7em", fontSize: "0.95em" }}>Hapus</button>
                <button type="button" onClick={() => {
                  setAddSubBabIdx(i);
                  setAddSubBabValue("");
                  setShowAddSubBabModal(true);
                  if (!item.subBab) {
                    const updated = [...penulisanList];
                    updated[i].subBab = [];
                    setPenulisanList(updated);
                  }
                }} style={{ ...btn, padding: "0.4em 0.7em", fontSize: "0.95em" }}>+</button>
              </div>
              {/* SubBab section */}
              {item.subBab && item.subBab.length > 0 && (
                <div style={{ marginLeft: "1.5em", marginTop: "0.7em", display: "flex", flexDirection: "column", gap: "0.6em" }}>
                  {item.subBab.map((sub, si) => (
                    <div key={sub.id} style={{
                      display: "flex",
                      alignItems: "center",
                      background: theme === "dark" ? "#23272f" : "#f3f4f6",
                      borderRadius: "8px",
                      boxShadow: theme === "dark"
                        ? "0 2px 8px rgba(99,102,241,0.10)"
                        : "0 2px 8px rgba(99,102,241,0.06)",
                      border: theme === "dark" ? "1px solid #353a47" : "1px solid #e0e7ff",
                      padding: "0.5em 1em",
                      minHeight: "38px",
                      gap: "0.7em"
                    }}>
                      <input
                        type="checkbox"
                        checked={sub.checked}
                        onChange={() => handleSubBabCheck(i, si)}
                        style={{ accentColor: colorAccent, width: "1.1em", height: "1.1em" }}
                      />
                      <span style={{ fontSize: "1em", fontWeight: 500, color: theme === "dark" ? colorAccentLight : colorAccent }}>{sub.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "0.5em", marginTop: "0.3em" }}>
          <button
            onClick={() => openAddModal(placeholder.includes("penulisan") ? "penulisan" : placeholder.includes("tugas") ? "tugas" : "berkas")}
            style={{ ...btn, padding: "0.5em 1em", fontWeight: 500, fontSize: "0.95em", width: "100%" }}
          >
            + Tambah
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={{ padding: "0 1.5em", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginTop: "2em", marginBottom: "4em" }}>
        <h1 style={{
          fontSize: "1.8em",
          fontWeight: 700,
          marginBottom: "0.4em",
          color: theme === "dark" ? "#f3f4f6" : "#111827",
          textAlign: "center"
        }}>Checklist Penulisan</h1>

        {/* Checklist Penulisan */}
        <div style={{ marginBottom: "3em" }}>
          <h2 style={{
            fontSize: "1.4em",
            fontWeight: 600,
            marginBottom: "1.2em",
            color: theme === "dark" ? "#e0e7ff" : "#111827",
            borderBottom: `2px solid ${colorAccent}`,
            display: "inline-block",
            paddingBottom: "0.3em"
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
            placeholder: "Tambah penulisan...",
            newValue: newPenulisan,
            setNewValue: setNewPenulisan,
            onAdd: handlePenulisanAdd,
          })}
        </div>

        {/* Checklist Tugas */}
        <div style={{ marginBottom: "3em" }}>
          <h2 style={{
            fontSize: "1.4em",
            fontWeight: 600,
            marginBottom: "1.2em",
            color: theme === "dark" ? "#e0e7ff" : "#111827",
            borderBottom: `2px solid ${colorAccent}`,
            display: "inline-block",
            paddingBottom: "0.3em"
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
            placeholder: "Tambah tugas...",
            newValue: newTugas,
            setNewValue: setNewTugas,
            onAdd: handleTugasAdd,
          })}
        </div>

        {/* Checklist Berkas */}
        <div>
          <h2 style={{
            fontSize: "1.4em",
            fontWeight: 600,
            marginBottom: "1.2em",
            color: theme === "dark" ? "#e0e7ff" : "#111827",
            borderBottom: `2px solid ${colorAccent}`,
            display: "inline-block",
            paddingBottom: "0.3em"
          }}>Checklist Berkas</h2>
          {renderChecklistList({
            list: berkasList,
            onCheck: handleBerkasCheck,
            onEdit: startEditBerkas,
            onDelete: handleBerkasDelete,
            editId: editBerkasId,
            editText: editBerkasText,
            setEditText: setEditBerkasText,
            onEditSave: handleBerkasEditSave,
            setEditId: setEditBerkasId,
            placeholder: "Tambah berkas...",
            newValue: newBerkas,
            setNewValue: setNewBerkas,
            onAdd: handleBerkasAdd,
          })}
        </div>

        {/* Modal edit bab & sub-bab */}
        {showEditBabModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: theme === "dark" ? "#23272f" : "#fff",
              borderRadius: "16px",
              padding: "2em 1.5em",
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
              color: theme === "dark" ? "#f3f4f6" : "#222"
            }}>
              <h3 style={{ marginBottom: "1em", fontWeight: 700, fontSize: "1.1em" }}>Edit Bab & Sub-Bab</h3>
              <input
                type="text"
                value={editBabName}
                onChange={e => setEditBabName(e.target.value)}
                placeholder="Nama bab..."
                style={{ width: "100%", padding: "0.7em", borderRadius: "8px", border: "1.5px solid #6366f1", fontSize: "1em", marginBottom: "1em" }}
              />
              <div style={{ marginBottom: "1em" }}>
                <div style={{ fontWeight: 500, marginBottom: "0.5em" }}>Sub-Bab:</div>
                {editSubBabList.map((sub, si) => (
                  <div key={sub.id} style={{ display: "flex", gap: "0.5em", marginBottom: "0.5em" }}>
                    {editSubBabIdx === si ? (
                      <>
                        <input
                          type="text"
                          value={editSubBabName}
                          onChange={e => setEditSubBabName(e.target.value)}
                          style={{ flex: 1, padding: "0.4em", borderRadius: "6px", border: "1px solid #6366f1" }}
                        />
                        <button onClick={() => {
                          const updatedList = [...editSubBabList];
                          updatedList[si].text = editSubBabName;
                          setEditSubBabList(updatedList);
                          setEditSubBabIdx(null);
                          setEditSubBabName("");
                        }} style={{ ...btn, padding: "0.3em 0.7em", fontSize: "0.95em" }}>Simpan</button>
                        <button onClick={() => { setEditSubBabIdx(null); setEditSubBabName(""); }} style={{ ...btnGray, padding: "0.3em 0.7em", fontSize: "0.95em" }}>Batal</button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1 }}>{sub.text}</span>
                        <button onClick={() => { setEditSubBabIdx(si); setEditSubBabName(sub.text); }} style={{ ...btn, padding: "0.3em 0.7em", fontSize: "0.95em" }}>Edit</button>
                        <button onClick={() => {
                          const updatedList = editSubBabList.filter((_, idx) => idx !== si);
                          setEditSubBabList(updatedList);
                        }} style={{ ...btnRed, padding: "0.3em 0.7em", fontSize: "0.95em" }}>Hapus</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.7em" }}>
                <button onClick={async () => {
                  if (editBabIdx === null) return;
                  const updated = [...penulisanList];
                  updated[editBabIdx].text = editBabName;
                  updated[editBabIdx].subBab = editSubBabList;
                  setPenulisanList(updated);
                  setShowEditBabModal(false);
                  setEditBabIdx(null);
                  setEditBabName("");
                  setEditSubBabList([]);
                  setEditSubBabIdx(null);
                  setEditSubBabName("");
                  if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
                }} style={{ ...btn, flex: 1 }}>Simpan</button>
                <button onClick={() => {
                  setShowEditBabModal(false);
                  setEditBabIdx(null);
                  setEditBabName("");
                  setEditSubBabList([]);
                  setEditSubBabIdx(null);
                  setEditSubBabName("");
                }} style={{ ...btnGray, flex: 1 }}>Batal</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal tambah sub-bab */}
        {showAddSubBabModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: theme === "dark" ? "#23272f" : "#fff",
              borderRadius: "16px",
              padding: "2em 1.5em",
              minWidth: 280,
              boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
              color: theme === "dark" ? "#f3f4f6" : "#222"
            }}>
              <h3 style={{ marginBottom: "1em", fontWeight: 700, fontSize: "1.1em" }}>Tambah Sub-Bab</h3>
              <input
                type="text"
                value={addSubBabValue}
                onChange={e => setAddSubBabValue(e.target.value)}
                placeholder="Nama sub-bab..."
                style={{ width: "100%", padding: "0.7em", borderRadius: "8px", border: "1.5px solid #6366f1", fontSize: "1em", marginBottom: "1em" }}
              />
              <div style={{ display: "flex", gap: "0.7em" }}>
                <button onClick={async () => {
                  if (!addSubBabValue.trim() || addSubBabIdx === null) return;
                  const updated = [...penulisanList];
                  updated[addSubBabIdx].subBab!.push({ id: uuidv4(), text: addSubBabValue.trim(), checked: false });
                  setPenulisanList(updated);
                  setShowAddSubBabModal(false);
                  setAddSubBabValue("");
                  setAddSubBabIdx(null);
                  if (docRef) await setDoc(docRef, { penulisanList: updated, tugasList, berkasList, onedrive, drive }, { merge: true });
                }} style={{ ...btn, flex: 1 }}>Simpan</button>
                <button onClick={() => {
                  setShowAddSubBabModal(false);
                  setAddSubBabValue("");
                  setAddSubBabIdx(null);
                }} style={{ ...btnGray, flex: 1 }}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PenulisanPage;
