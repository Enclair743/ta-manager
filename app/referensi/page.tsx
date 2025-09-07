"use client";
import { useState } from "react";
import Cite from "citation-js";

export default function Referensi() {
  const [refs, setRefs] = useState<{title: string; url: string;}[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function formatAPA(url: string, title: string) {
    try {
      const cite = new Cite({ title, URL: url });
      return cite.format('bibliography', { format: 'text', template: 'apa' });
    } catch {
      return `${title} - ${url}`;
    }
  }

  return (
    <div>
      <h1>Referensi</h1>
      <form onSubmit={e => {
        e.preventDefault();
        setRefs([...refs, { title, url }]);
        setTitle(""); setUrl("");
      }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul Referensi" required style={{ marginRight: "8px" }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL Referensi" required style={{ marginRight: "8px" }} />
        <button type="submit">Tambah Referensi</button>
      </form>
      <ul style={{ marginTop: "1rem" }}>
        {refs.map((r, i) => (
          <li key={i}>{formatAPA(r.url, r.title)}</li>
        ))}
      </ul>
    </div>
  );
}