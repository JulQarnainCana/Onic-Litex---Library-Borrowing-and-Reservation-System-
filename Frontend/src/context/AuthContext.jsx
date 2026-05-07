/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, useCallback } from "react";

const AuthContext = createContext(null);
const THEME_KEY = "litex-theme";

function readStoredUser() {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) return null;
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");

  const setThemePersist = useCallback((next) => {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const login = useCallback((token, nextUser) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateProfile = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      sessionStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      theme,
      setTheme: setThemePersist,
      login,
      logout,
      updateProfile,
      isAdmin: user?.role === "admin",
    }),
    [user, theme, setThemePersist, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
