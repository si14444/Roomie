import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  user: any;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setAuthenticated, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
