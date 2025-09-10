"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthCalendarProvider } from "../src/context/AuthCalendarContext";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Untuk close menu saat klik di luar menu (backdrop)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const navList = document.querySelector(".nav-list-mobile");
      if (menuOpen && navList && !navList.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

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
          .nav-list-desktop {
            display: flex;
            gap: 2em;
            list-style: none;
            margin: 0;
            padding: 0;
            align-items: center;
            font-weight: 600;
            font-size: 1.15em;
            color: inherit;
            transition: all 0.2s;
            z-index: 1001;
          }
          .hamburger {
            display: none;
            background: none;
            border: none;
            font-size: 2em;
            color: inherit;
            cursor: pointer;
            z-index: 1002;
          }
          /* Mobile Styles */
          @media (max-width: 900px) {
            .nav-list-desktop {
              display: none !important;
            }
            .hamburger {
              display: block !important;
              position: relative;
              z-index: 1002;
              margin-left: 1.5em;
            }
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
              <nav style={{ position: "relative", zIndex: 1001, flex: 1 }}>
                <ul className="nav-list-desktop">
                  <li><Link href="/dashboard" className="nav-link" onClick={handleNavClick}>Dashboard</Link></li>
                  <li><Link href="/penulisan" className="nav-link" onClick={handleNavClick}>Penulisan</Link></li>
                  <li><Link href="/catatan" className="nav-link" onClick={handleNavClick}>Catatan</Link></li>
                  <li><Link href="/referensi" className="nav-link" onClick={handleNavClick}>Referensi</Link></li>
                  <li><Link href="/kalender" className="nav-link" onClick={handleNavClick}>Kalender</Link></li>
                </ul>
                <button
                  className="hamburger"
                  aria-label="Buka menu"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  &#9776;
                </button>
                {/* Mobile Menu */}
                <div
                  style={{
                    display: menuOpen ? "block" : "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: 2000,
                  }}
                >
                  <ul
                    className="nav-list-mobile"
                    style={{
                      position: "absolute",
                      top: "64px",
                      left: "8px",
                      right: "8px",
                      background: theme === "dark" ? "#18181b" : "#fff",
                      borderRadius: "14px",
                      boxShadow: "0 8px 32px rgba(99,102,241,0.18)",
                      padding: "1em 0.5em",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25em",
                      fontWeight: 600,
                      fontSize: "1.15em",
                    }}
                  >
                    <li><Link href="/dashboard" className="nav-link" onClick={handleNavClick}>Dashboard</Link></li>
                    <li><Link href="/penulisan" className="nav-link" onClick={handleNavClick}>Penulisan</Link></li>
                    <li><Link href="/catatan" className="nav-link" onClick={handleNavClick}>Catatan</Link></li>
                    <li><Link href="/referensi" className="nav-link" onClick={handleNavClick}>Referensi</Link></li>
                    <li><Link href="/kalender" className="nav-link" onClick={handleNavClick}>Kalender</Link></li>
                  </ul>
                </div>
              </nav>
              <button
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ marginLeft: "auto", zIndex: 1002 }}
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>
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
