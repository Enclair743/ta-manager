import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Context untuk menyimpan user dan accessToken kalender
export interface AuthCalendarContextType {
  user: any;
  setUser: Dispatch<SetStateAction<any>>;
  calendarToken: string | null;
  setCalendarToken: Dispatch<SetStateAction<string | null>>;
}

export const AuthCalendarContext = createContext<AuthCalendarContextType | undefined>(undefined);

export function AuthCalendarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);

  return (
    <AuthCalendarContext.Provider value={{ user, setUser, calendarToken, setCalendarToken }}>
      {children}
    </AuthCalendarContext.Provider>
  );
}

export const useAuthCalendar = () => {
  const context = useContext(AuthCalendarContext);
  if (!context) {
    throw new Error("useAuthCalendar must be used within an AuthCalendarProvider");
  }
  return context;
};