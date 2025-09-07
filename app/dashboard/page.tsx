"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bodyTheme = document.body.getAttribute("data-theme");
      setTheme(bodyTheme === "light" ? "light" : "dark");
    }
  }, []);

  const cardBg = theme === "dark"
    ? "linear-gradient(120deg, #23272f 0%, #2d3340 100%)"
    : "linear-gradient(120deg, #fff 0%, #e0e7ff 100%)";
  const cardText = theme === "dark" ? "#f3f4f6" : "#222";
  const cardShadow = theme === "dark"
    ? "0 4px 16px rgba(0,0,0,0.32)"
    : "0 4px 16px rgba(0,0,0,0.07)";

  return (
    <div>
      <h1 style={{
        fontSize: "2.2rem",
        marginBottom: "0.5em",
        fontWeight: 700,
        letterSpacing: "-1px",
        color: theme === "dark" ? "#f3f4f6" : "#222"
      }}>Dashboard Tugas Akhir</h1>
      <p style={{
        color: theme === "dark" ? "#a1a1aa" : "#555",
        marginBottom: "2em",
        fontSize: "1.1em"
      }}>
        Selamat datang! Gunakan aplikasi ini untuk mengelola progress, referensi, dan timeline tugas akhir kamu.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2rem",
        marginBottom: "2em"
      }}>
        {[
          { href: "/penulisan", label: "📝 Penulisan" },
          { href: "/catatan", label: "📒 Catatan" },
          { href: "/referensi", label: "📚 Referensi" },
          { href: "/kalender", label: "📅 Kalender" }
        ].map(card => (
          <a
            key={card.href}
            href={card.href}
            style={{
              display: "block",
              padding: "2em 1.2em",
              background: cardBg,
              borderRadius: "14px",
              boxShadow: cardShadow,
              textAlign: "center",
              textDecoration: "none",
              color: cardText,
              fontWeight: 700,
              fontSize: "1.15em",
              transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = theme === "dark"
                ? "0 8px 32px rgba(99,102,241,0.18)"
                : "0 8px 32px rgba(0,112,243,0.12)";
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
              e.currentTarget.style.background = theme === "dark"
                ? "#353a47"
                : "#e0e7ff";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = cardShadow;
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = cardBg;
            }}
          >
            {card.label}
          </a>
        ))}
      </div>
    </div>
  );
}
