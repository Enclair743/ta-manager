"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
          <header style={{
            padding: "1rem 2rem",
            borderBottom: theme === "dark" ? "1px solid #23272f" : "1px solid #ddd",
            background: theme === "dark" ? "#18181b" : "#fff",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: theme === "dark" ? "0 2px 8px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center"
          }}>
            <nav style={{
              display: "flex",
              gap: "1.5rem",
              fontWeight: 500,
              fontSize: "1.1em"
            }}>
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/penulisan", label: "Penulisan" },
                { href: "/catatan", label: "Catatan" },
                { href: "/referensi", label: "Referensi" },
                { href: "/kalender", label: "Kalender" }
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                marginLeft: "auto"
              }}
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
          </header>
          <main style={mainStyle}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
