import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuMm9_M1MFh3MYZZtgXe-TLwgM9JrxCZo",
  authDomain: "tugas-akhir-4d34f.firebaseapp.com",
  projectId: "tugas-akhir-4d34f",
  storageBucket: "tugas-akhir-4d34f.appspot.com",
  messagingSenderId: "462715724181",
  appId: "1:462715724181:web:31ce2ce385699105c3969c",
  measurementId: "G-WJVJ2GVZWM"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);