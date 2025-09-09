import { createContext, useContext, useState } from "react";

// Context untuk menyimpan user dan accessToken kalender
export const AuthCalendarContext = createContext(null);

export function AuthCalendarProvider({ children }) {
  const [user, setUser] = useState(null);
  const [calendarToken, setCalendarToken] = useState(null);

  return (
    <AuthCalendarContext.Provider value={{ user, setUser, calendarToken, setCalendarToken }}>
      {children}
    </AuthCalendarContext.Provider>
  );
}

// Hook untuk mengakses context
export const useAuthCalendar = () => useContext(AuthCalendarContext);
