import React, { createContext, useCallback, useContext, useState } from "react";

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "info";
  content: string;
}

interface TerminalContextType {
  lines: TerminalLine[];
  addLine: (content: string, type?: TerminalLine["type"]) => void;
  clearTerminal: () => void;
  executeCommand: (cmd: string) => Promise<void>;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

let lineIdCounter = 0;

const WELCOME_LINES: TerminalLine[] = [
  { id: "w0", type: "info", content: "Nord Terminal v1.0.0 — Shizuku Shell" },
  { id: "w1", type: "info", content: "Type 'help' to see available commands." },
  { id: "w2", type: "info", content: "─────────────────────────────────────" },
];

const BUILTIN_COMMANDS: Record<string, (args: string[]) => string[]> = {
  help: () => [
    "Available commands:",
    "  help         Show this help message",
    "  clear        Clear terminal",
    "  ls           List files (simulated via Shizuku)",
    "  ps           Show running processes (simulated)",
    "  whoami       Show current user",
    "  uname        Show system information",
    "  date         Show current date/time",
    "  echo [text]  Echo text to terminal",
    "  ping [host]  Ping a host (simulated)",
    "  sh [cmd]     Run shell command via Shizuku (simulated)",
  ],
  whoami: () => ["shell"],
  uname: () => ["Linux android 5.10.0-android13 #1 SMP PREEMPT"],
  date: () => [new Date().toString()],
  ls: () => [
    "total 48",
    "drwxr-xr-x  2 root root 4096 data/",
    "drwxr-xr-x  5 root root 4096 system/",
    "drwxr-xr-x  3 root root 4096 sdcard/",
    "-rw-r--r--  1 root root  512 build.prop",
  ],
  ps: () => [
    "PID   USER       VSZ   RSS  CMD",
    "1     root      2048  1024 /init",
    "423   system    8192  4096 /system/bin/servicemanager",
    "512   shell     4096  2048 /system/bin/adbd",
    "1024  shell     6144  3072 /system/bin/sh",
  ],
};

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);

  const addLine = useCallback((content: string, type: TerminalLine["type"] = "output") => {
    const line: TerminalLine = {
      id: `tl-${Date.now()}-${lineIdCounter++}`,
      type,
      content,
    };
    setLines((prev) => [...prev, line]);
  }, []);

  const clearTerminal = useCallback(() => {
    setLines([]);
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setLines((prev) => [
      ...prev,
      { id: `tl-in-${Date.now()}-${lineIdCounter++}`, type: "input", content: `$ ${trimmed}` },
    ]);

    await new Promise((r) => setTimeout(r, 80));

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === "clear") {
      setLines([]);
      return;
    }

    if (command === "echo") {
      setLines((prev) => [
        ...prev,
        { id: `tl-out-${Date.now()}-${lineIdCounter++}`, type: "output", content: args.join(" ") },
      ]);
      return;
    }

    if (command === "ping") {
      const host = args[0] ?? "8.8.8.8";
      const pingLines = [
        `PING ${host}: 56 data bytes`,
        `64 bytes from ${host}: icmp_seq=0 ttl=53 time=12.3 ms`,
        `64 bytes from ${host}: icmp_seq=1 ttl=53 time=11.8 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=53 time=13.1 ms`,
        `--- ${host} ping statistics ---`,
        `3 packets transmitted, 3 received, 0% packet loss`,
      ];
      for (const l of pingLines) {
        setLines((prev) => [
          ...prev,
          { id: `tl-out-${Date.now()}-${lineIdCounter++}`, type: "output", content: l },
        ]);
        await new Promise((r) => setTimeout(r, 300));
      }
      return;
    }

    if (command === "sh") {
      const subCmd = args.join(" ");
      setLines((prev) => [
        ...prev,
        {
          id: `tl-out-${Date.now()}-${lineIdCounter++}`,
          type: "info",
          content: `[Shizuku] Executing: ${subCmd}`,
        },
        {
          id: `tl-out2-${Date.now()}-${lineIdCounter++}`,
          type: "output",
          content: `Executed via Shizuku IPC: ${subCmd}`,
        },
      ]);
      return;
    }

    if (BUILTIN_COMMANDS[command]) {
      const output = BUILTIN_COMMANDS[command](args);
      setLines((prev) => [
        ...prev,
        ...output.map((line) => ({
          id: `tl-out-${Date.now()}-${lineIdCounter++}`,
          type: "output" as const,
          content: line,
        })),
      ]);
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        id: `tl-err-${Date.now()}-${lineIdCounter++}`,
        type: "error",
        content: `sh: ${command}: command not found`,
      },
    ]);
  }, []);

  return (
    <TerminalContext.Provider value={{ lines, addLine, clearTerminal, executeCommand }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used inside TerminalProvider");
  return ctx;
}
