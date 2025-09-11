"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthCalendarProvider } from "../src/context/AuthCalendarContext";
import { AuthProvider } from "../src/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/penulisan", label: "Penulisan", icon: "📝" },
  { href: "/catatan", label: "Catatan", icon: "📒" },
  { href: "/referensi", label: "Referensi", icon: "🔗" },
  { href: "/kalender", label: "Kalender", icon: "📅" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

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

  // Close menu saat klik backdrop
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const navList = document.querySelector(".nav-list-mobile");
      const hamburger = document.querySelector(".hamburger");
      if (
        menuOpen &&
        navList &&
        !navList.contains(e.target as Node) &&
        hamburger &&
        !hamburger.contains(e.target as Node)
      ) {
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

  function handleNavClick() {
    setMenuOpen(false);
  }

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
            display: flex;
            align-items: center;
            gap: 0.7em;
            padding: 0.7em 1.2em;
            border-radius: 10px;
            font-size: 1.05em;
            text-decoration: none;
            transition: background 0.2s, color 0.2s, box-shadow 0.2s;
            font-weight: 500;
            position: relative;
          }
          .nav-link:hover, .nav-link.active {
            background: ${theme === "dark" ? "#23272f" : "#e0e7ff"};
            color: ${theme === "dark" ? "#a5b4fc" : "#6366f1"};
            box-shadow: 0 2px 8px rgba(99,102,241,0.12);
          }
          .nav-link .nav-icon {
            font-size: 1.19em;
            vertical-align: middle;
          }
          .theme-toggle-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            font-size: 1.35em;
            cursor: pointer;
            padding: 0.35em 1em;
            border-radius: 10px;
            transition: background 0.2s;
            max-width: 60px;
            min-width: 40px;
          }
          .theme-toggle-btn:hover {
            background: ${theme === "dark" ? "#23272f" : "#e0e7ff"};
            color: ${theme === "dark" ? "#a5b4fc" : "#6366f1"};
          }
          .nav-list-desktop {
            display: flex;
            gap: 1.35em;
            list-style: none;
            margin: 0;
            padding: 0;
            align-items: center;
            z-index: 1001;
          }
          .hamburger {
            display: none;
            background: none;
            border: none;
            font-size: 2em;
            color: inherit;
            cursor: pointer;
            z-index: 2002;
            margin-left: 1.5em;
            transition: color 0.2s;
            border-radius: 10px;
            padding: 0.25em 0.45em;
          }
          .hamburger:active {
            color: ${theme === "dark" ? "#a5b4fc" : "#6366f1"};
          }
          @media (max-width: 900px) {
            .nav-list-desktop {
              display: none !important;
            }
            .hamburger {
              display: block !important;
            }
          }
          @media (max-width: 600px) {
            .theme-toggle-btn {
              max-width: 44px;
              min-width: 36px;
              padding: 0.25em 0.5em;
              font-size: 1.25em;
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
              justifyContent: "flex-end" // Tidak ada judul, jadi kanan saja
            }}>
              <nav style={{ position: "relative", zIndex: 1001, flex: 1 }}>
                <ul className="nav-list-desktop">
                  {navItems.map(item => (
                    <li key={item.href}>
                      <Link href={item.href} className={`nav-link${pathname === item.href ? " active" : ""}`}>
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  className="hamburger"
                  aria-label="Buka menu"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" style={{verticalAlign: "middle"}}>
                    <rect y="5" width="24" height="2" rx="1" fill="currentColor"/>
                    <rect y="11" width="24" height="2" rx="1" fill="currentColor"/>
                    <rect y="17" width="24" height="2" rx="1" fill="currentColor"/>
                  </svg>
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
                    background: menuOpen ? "rgba(34,34,40,0.55)" : "transparent",
                    backdropFilter: menuOpen ? "blur(5px)" : "none",
                    zIndex: 9999,
                    transition: "background 0.3s",
                  }}
                >
                  <ul
                    className="nav-list-mobile"
                    style={{
                      position: "absolute",
                      top: "74px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "90vw",
                      maxWidth: "340px",
                      background: theme === "dark"
                        ? "rgba(35,39,47,0.98)" : "rgba(255,255,255,0.98)",
                      borderRadius: "22px",
                      boxShadow: "0 8px 32px rgba(99,102,241,0.19)",
                      padding: "1.3em 0.5em 1em 0.5em",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3em",
                      fontWeight: 500,
                      fontSize: "1.13em",
                      animation: menuOpen ? "slideDown 0.28s cubic-bezier(.42,1.14,.78,1.09)" : "none",
                    }}
                  >
                    {navItems.map(item => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`nav-link${pathname === item.href ? " active" : ""}`}
                          onClick={handleNavClick}
                        >
                          <span className="nav-icon">{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <style>{`
                    @keyframes slideDown {
                      from { opacity:0; transform:translateY(-36px) translateX(-50%);}
                      to   { opacity:1; transform:translateY(0) translateX(-50%);}
                    }
                  `}</style>
                </div>
              </nav>
              <button
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ marginLeft: "auto", zIndex: 2002 }}
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
