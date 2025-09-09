import { createContext, useContext, useState, ReactNode } from "react";

// Definisikan tipe data context
interface AuthCalendarContextType {
  user: any;
  setUser: (user: any) => void;
  calendarToken: string | null;
  setCalendarToken: (token: string | null) => void;
}

// Inisialisasi context dengan default value yang sesuai tipe
export const AuthCalendarContext = createContext<AuthCalendarContextType>({
  user: null,
  setUser: () => {},
  calendarToken: null,
  setCalendarToken: () => {},
});

export function AuthCalendarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);

  return (
    <AuthCalendarContext.Provider value={{ user, setUser, calendarToken, setCalendarToken }}>
      {children}
    </AuthCalendarContext.Provider>
  );
}

export const useAuthCalendar = () => useContext(AuthCalendarContext);
