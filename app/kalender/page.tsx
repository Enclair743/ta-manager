"use client";
export default function Kalender() {
  return (
    <div>
      <h1>Kalender & Timeline</h1>
      <p>
        <a href="https://calendar.google.com/" target="_blank" rel="noopener noreferrer">
          Buka Google Kalender
        </a>
      </p>
      <iframe
        src="https://calendar.google.com/calendar/embed?src=YOUR_EMAIL%40gmail.com"
        style={{ border: 0, width: "100%", height: "600px" }}
        frameBorder="0"
      ></iframe>
      <p style={{ fontSize: "0.9em", color: "#888" }}>
        Ganti <b>YOUR_EMAIL%40gmail.com</b> dengan email Google kamu (pakai %40 untuk @).
      </p>
    </div>
  );
}