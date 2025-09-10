"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthCalendarProvider } from "../src/context/AuthCalendarContext";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  // Tutup menu saat klik link
  function handleNavClick() {
    setMenuOpen(false);
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "light" || saved === "dark") setTheme(saved as any);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // Style dinamis untuk body dan main
  const bodyStyle = {
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: theme === "dark"
      ? "linear-gradient(120deg, #18181b 0%, #23272f 100%)"
      : "linear-gradient(120deg, #e0e7ff 0%, #f4f6fa 100%)",
    color: theme === "dark" ? "#e5e7eb" : "#222"
  };

  const mainStyle = {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
    background: theme === "dark" ? "#23272f" : "#fff",
    borderRadius: "16px",
    boxShadow: theme === "dark"
      ? "0 8px 32px rgba(0,0,0,0.32)"
      : "0 8px 32px rgba(0,0,0,0.08)",
    marginTop: "2rem",
    minHeight: "70vh",
    color: "inherit"
  };

  return (
    <html lang="id">
      <head>
        {/* Google Identity Services script for OAuth */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          .nav-link {
            color: inherit;
            padding: 0.3em 0.8em;
            border-radius: 6px;
            transition: background 0.2s, color 0.2s;
            text-decoration: none;
          }
          .nav-link:hover {
            background: ${theme === "dark" ? "#23272f" : "#e0e7ff"};
          }
          .theme-toggle-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            font-size: 1.2em;
            cursor: pointer;
            padding: 0.3em 0.8em;
            border-radius: 6px;
            transition: background 0.2s;
          }
          .theme-toggle-btn:hover {
            background: ${theme === "dark" ? "#23272f" : "#e0e7ff"};
            color: ${theme === "dark" ? "#a5b4fc" : "#6366f1"};
          }
        `}</style>
      </head>
      <body data-theme={theme} style={bodyStyle}>
        <AuthProvider>
          <AuthCalendarProvider>
            <header style={{
              padding: "1rem 2rem",
              borderBottom: theme === "dark" ? "1px solid #23272f" : "1px solid #ddd",
              background: theme === "dark" ? "#18181b" : "#fff",
              position: "relative",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: 700, fontSize: "1.2em", color: theme === "dark" ? "#fff" : "#000" }}>
                TA Manager
              </div>
              <nav style={{ position: "relative", zIndex: 1001 }}>
                <button
                  className="hamburger"
                  style={{
                    display: "none",
                    background: "none",
                    border: "none",
                    fontSize: "2em",
                    color: theme === "dark" ? "#fff" : "#000",
                    cursor: "pointer",
                    zIndex: 1002,
                  }}
                  aria-label="Buka menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  &#9776;
                </button>
                <ul
                  className="nav-list"
                  style={{
                    display: "flex",
                    gap: "2.5em",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "1.15em",
                    color: theme === "dark" ? "#fff" : "#000",
                    transition: "all 0.2s",
                    zIndex: 1001,
                  }}
                >
                  <li><Link href="/dashboard" className="nav-link" onClick={handleNavClick}>Dashboard</Link></li>
                  <li><Link href="/penulisan" className="nav-link" onClick={handleNavClick}>Penulisan</Link></li>
                  <li><Link href="/catatan" className="nav-link" onClick={handleNavClick}>Catatan</Link></li>
                  <li><Link href="/referensi" className="nav-link" onClick={handleNavClick}>Referensi</Link></li>
                  <li><Link href="/kalender" className="nav-link" onClick={handleNavClick}>Kalender</Link></li>
                </ul>
              </nav>
              <button
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ marginLeft: "auto", zIndex: 1002 }}
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>
              <style>{`
                @media (max-width: 900px) {
                  .nav-list {
                    display: ${menuOpen ? "flex" : "none"};
                    flex-direction: column;
                    position: absolute;
                    top: 56px;
                    left: 0;
                    right: 0;
                    background: #18181b;
                    padding: 1em 0.5em;
                    gap: 0.5em;
                    z-index: 1001;
                    font-size: 1.1em;
                    border-radius: 0 0 12px 12px;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.18);
                  }
                  .nav-link {
                    width: 100%;
                    text-align: left;
                    padding: 0.7em 1em;
                  }
                  .hamburger {
                    display: block !important;
                    position: relative;
                    z-index: 1002;
                  }
                }
              `}</style>
            </header>
            <main style={mainStyle}>
              {children}
            </main>
          </AuthCalendarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
