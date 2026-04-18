import React, { createContext, useCallback, useContext, useState } from "react";

export type ShizukuStatus = "not_installed" | "not_running" | "running" | "authorized";

interface ShizukuContextType {
  status: ShizukuStatus;
  setStatus: (s: ShizukuStatus) => void;
  isAuthorized: boolean;
  requestPermission: () => Promise<boolean>;
}

const ShizukuContext = createContext<ShizukuContextType | undefined>(undefined);

export function ShizukuProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ShizukuStatus>("not_running");
  const isAuthorized = status === "authorized";

  const requestPermission = useCallback(async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("authorized");
    return true;
  }, []);

  return (
    <ShizukuContext.Provider value={{ status, setStatus, isAuthorized, requestPermission }}>
      {children}
    </ShizukuContext.Provider>
  );
}

export function useShizuku() {
  const ctx = useContext(ShizukuContext);
  if (!ctx) throw new Error("useShizuku must be used inside ShizukuProvider");
  return ctx;
}
