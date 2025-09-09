import { createContext, useContext, useState } from "react";

// Context untuk menyimpan user dan accessToken kalender
export interface AuthCalendarContextType {
  user: any;
  setUser: (user: any) => void;
  calendarToken: string | null;
  setCalendarToken: (token: string | null) => void;
}

export const AuthCalendarContext = createContext<AuthCalendarContextType | null>(null);

export function AuthCalendarProvider({ children }) {
  const [user, setUser] = useState<any>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);

  return (
    <AuthCalendarContext.Provider value={{ user, setUser, calendarToken, setCalendarToken }}>
      {children}
    </AuthCalendarContext.Provider>
  );
}

// Hook untuk mengakses context
export const useAuthCalendar = () => useContext(AuthCalendarContext);
