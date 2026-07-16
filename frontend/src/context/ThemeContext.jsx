import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "hunters-ledger-theme"; // stores "light" | "dark" | "system"

function resolveTheme(preference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [resolved, setResolved] = useState(() => resolveTheme(localStorage.getItem(STORAGE_KEY) || "system"));

  useEffect(() => {
    const applied = resolveTheme(preference);
    setResolved(applied);
    document.documentElement.setAttribute("data-theme", applied);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const applied = resolveTheme("system");
      setResolved(applied);
      document.documentElement.setAttribute("data-theme", applied);
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [preference]);

  const cycleTheme = useCallback(() => {
    setPreference((prev) => (prev === "system" ? "light" : prev === "light" ? "dark" : "system"));
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
