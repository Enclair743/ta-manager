"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useAuthCalendar } from "../../src/context/AuthCalendarContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const authCalendar = useAuthCalendar();
  if (!authCalendar) return null;
  const { user, setUser, calendarToken, setCalendarToken } = authCalendar;
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Jika sudah login aplikasi dan kalender, langsung ke dashboard
    if (user && calendarToken) {
      router.push("/dashboard");
    }
    // Jika sudah login aplikasi tapi belum dapat token kalender, set timeout error
    if (user && !calendarToken) {
      setErrorMessage("");
      const timer = setTimeout(() => {
        setErrorMessage("Gagal mendapatkan akses kalender. Silakan coba login ulang atau cek koneksi Google OAuth Anda.");
      }, 10000); // 10 detik
      return () => clearTimeout(timer);
    }
  }, [user, calendarToken, router]);

  const handleUnifiedLogin = async () => {
    console.log("[Login] Mulai login Firebase...");
    // Step 1: Login Firebase (Aplikasi)
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);

    // Step 2: Login Google Calendar OAuth (GIS)
    if (window.google?.accounts?.oauth2) {
      console.log("[Login] GIS tersedia, mulai request access token...");
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: "656328403825-6ntm1l1mjnqn589rnqj77m1svf6sq3oq.apps.googleusercontent.com",
          scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
          callback: (resp) => {
            console.log("[Login] Callback GIS response:", resp);
            if (resp.access_token) {
              setCalendarToken(resp.access_token);
              console.log("[Login] Access token diterima dan disimpan.");
            } else {
              console.error("[Login] Tidak ada access_token di response GIS.", resp);
              alert("Gagal mendapatkan access token dari Google Identity Services. Silakan cek konfigurasi client_id dan izin OAuth di Google Cloud Console.");
            }
          }
        });
        tokenClient.requestAccessToken();
        console.log("[Login] requestAccessToken dipanggil.");
      } catch (err) {
        console.error("[Login] Error saat inisialisasi GIS:", err);
        alert("Terjadi error saat inisialisasi Google Identity Services. Silakan cek console dan konfigurasi client_id.");
      }
    } else {
      console.error("[Login] GIS belum siap di window.");
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
      {errorMessage && <p style={{ color: "#ef4444", marginTop: "1em" }}>{errorMessage}</p>}
    </div>
  );
}
