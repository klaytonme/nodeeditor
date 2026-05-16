'use client';

import { create } from 'zustand';
import type { LogEntry, LogLevel } from '@/lib/types';

const MAX_ENTRIES = 100;

interface LogStore {
  entries: LogEntry[];
  log: (level: LogLevel, message: string) => void;
  clear: () => void;
}

let _logCounter = 0;

export const useLogStore = create<LogStore>((set) => ({
  entries: [],

  log: (level, message) =>
    set((s) => {
      const entry: LogEntry = {
        id: String(_logCounter++),
        time: new Date(),
        level,
        message,
      };
      const entries = [...s.entries, entry];
      return { entries: entries.length > MAX_ENTRIES ? entries.slice(-MAX_ENTRIES) : entries };
    }),

  clear: () => set({ entries: [] }),
}));
