import React, { createContext, useCallback, useContext, useRef, useState } from "react";

export type LogLevel = "log" | "info" | "warn" | "error" | "success" | "system";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  tag?: string;
}

interface ConsoleContextType {
  logs: LogEntry[];
  addLog: (message: string, level?: LogLevel, tag?: string) => void;
  clearLogs: () => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

let logIdCounter = 0;

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-0",
      timestamp: new Date(),
      level: "system",
      message: "Nord Terminal initialized",
      tag: "SYSTEM",
    },
    {
      id: "init-1",
      timestamp: new Date(),
      level: "info",
      message: "Shizuku service not detected. Go to the Shizuku tab to set up.",
      tag: "SHIZUKU",
    },
  ]);

  const addLog = useCallback((message: string, level: LogLevel = "log", tag?: string) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${logIdCounter++}`,
      timestamp: new Date(),
      level,
      message,
      tag,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <ConsoleContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be used inside ConsoleProvider");
  return ctx;
}
