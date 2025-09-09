"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthCalendar } from "../src/context/AuthCalendarContext";

export default function Home() {
  const { user } = useAuthCalendar() || {};
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return null;
}
