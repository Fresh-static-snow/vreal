import { useState, useMemo, createContext, useContext, ReactNode } from "react";
import { router } from "@/router";
import { routes } from "@/routes";
import { LocalStorageKeys } from "@/types/localStorage";
import { api } from "@/api";

export interface IAuthContext {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  user: any;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)
  );

  const login = (newToken: string) => {
    localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, newToken);
    setToken(newToken);
    router.navigate({ to: routes.root });
  };

  const logout = async () => {
    try {
      await api.post("/auth/signout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setToken(null);
      localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
      router.navigate({ to: routes.login });
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      token,
      login,
      logout,
      setToken,
      setUser,
      user
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth hook must be used within an AuthProvider!");
  }
  return context;
}
