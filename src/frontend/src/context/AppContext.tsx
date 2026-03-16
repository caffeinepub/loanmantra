import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  heroVariant: "A" | "B" | "C";
  lendersInitialized: boolean;
  setLendersInitialized: (v: boolean) => void;
  // Quick loan form state passed between pages
  quickPhone: string;
  setQuickPhone: (v: string) => void;
  quickAmount: string;
  setQuickAmount: (v: string) => void;
  quickCibil: number;
  setQuickCibil: (v: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("lm_dark");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [heroVariant] = useState<"A" | "B" | "C">(() => {
    const v = ["A", "B", "C"] as const;
    return v[Math.floor(Math.random() * 3)];
  });
  const [lendersInitialized, setLendersInitialized] = useState(false);
  const [quickPhone, setQuickPhone] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCibil, setQuickCibil] = useState(700);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("lm_dark", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        heroVariant,
        lendersInitialized,
        setLendersInitialized,
        quickPhone,
        setQuickPhone,
        quickAmount,
        setQuickAmount,
        quickCibil,
        setQuickCibil,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
