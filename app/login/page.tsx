"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../src/firebase/firebaseConfig";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5em" }}>
      <h2>Login dengan Google</h2>
      <button
        onClick={handleLogin}
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
    </div>
  );
}
