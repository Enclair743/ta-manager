"use client";
import { useState } from "react";

export default function Catatan() {
  const [notes, setNotes] = useState<string[]>([]);
  const [input, setInput] = useState("");

  return (
    <div>
      <h1>Catatan Asistensi</h1>
      <form onSubmit={e => {
        e.preventDefault();
        if (input.trim()) {
          setNotes([...notes, input]);
          setInput("");
        }
      }}>
        <input
          type="text"
          placeholder="Catatan baru"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button type="submit">Tambah Catatan</button>
      </form>
      <ul style={{ marginTop: "1rem" }}>
        {notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  );
}