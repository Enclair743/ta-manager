"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useAuthCalendar } from "../../src/context/AuthCalendarContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const authCalendar = useAuthCalendar();
  if (!authCalendar) return null;
  const { user, setUser, calendarToken, setCalendarToken } = authCalendar;
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login aplikasi dan kalender, langsung ke dashboard
    if (user && calendarToken) {
      router.push("/dashboard");
    }
  }, [user, calendarToken, router]);

  const handleUnifiedLogin = async () => {
    // Step 1: Login Firebase (Aplikasi)
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Simpan data user hasil login Firebase ke context
    setUser(result.user);

    // Step 2: Login Google Calendar OAuth (GIS)
    if (window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: "656328403825-6ntm1l1mjnqn589rnqj77m1svf6sq3oq.apps.googleusercontent.com", // Ganti dengan client_id GIS kamu!
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
        callback: (resp) => {
          if (resp.access_token) setCalendarToken(resp.access_token);
        }
      });
      tokenClient.requestAccessToken();
    } else {
      alert("Google Identity Services belum siap, coba reload halaman.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5em" }}>
      <h2>Login & Sinkron Kalender</h2>
      <button
        onClick={handleUnifiedLogin}
        style={{
          background: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "1em 2em",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "1.1em"
        }}
      >
        Login Google
      </button>
      {(user && !calendarToken) && <p>Menunggu otorisasi kalender...</p>}
      {(user && calendarToken) && <p>Login lengkap! Kalender sudah tersinkron.</p>}
    </div>
  );
}
