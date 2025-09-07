"use client";
import { useState } from "react";
const checklistData = [
  "Judul",
  "Bab 1 - Pendahuluan",
  "Bab 2 - Tinjauan Pustaka",
  "Bab 3 - Metodologi",
  "Bab 4 - Hasil & Pembahasan",
  "Bab 5 - Kesimpulan",
];

export default function Penulisan() {
  const [checked, setChecked] = useState(Array(checklistData.length).fill(false));
  const [onedrive, setOnedrive] = useState("");

  return (
    <div>
      <h1>Penulisan Tugas Akhir</h1>
      <h2>Checklist Penulisan</h2>
      <ul>
        {checklistData.map((item, i) => (
          <li key={i}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => {
                const newChecked = [...checked];
                newChecked[i] = !newChecked[i];
                setChecked(newChecked);
              }}
            />{" "}
            {item}
          </li>
        ))}
      </ul>
      <h2>Link OneDrive Dokumen TA</h2>
      <input
        type="text"
        placeholder="Paste link OneDrive TA"
        value={onedrive}
        onChange={e => setOnedrive(e.target.value)}
        style={{ width: "100%", marginBottom: "8px" }}
      />
      {onedrive && (
        <p>
          <a href={onedrive} target="_blank" rel="noopener noreferrer">
            Buka dokumen OneDrive
          </a>
        </p>
      )}
    </div>
  );
}