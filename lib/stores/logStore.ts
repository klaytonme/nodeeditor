'use client';

import { create } from 'zustand';
import type { LogEntry, LogLevel } from '@/lib/types';

/*---------------------------------- logStore.ts ---------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/stores/logStore.ts                                                 |
| Descr:  A simple store to keep track of all the incoming log messages. Messages  |
|   delivered by dispatch, pendingOps, useGraphSyncLayer, and the actual           |
|   syncLayer itself all call the log function. The LogPanel reads off the log     |
|   entries.                                                                       |
\*--------------------------------------------------------------------------------*/

// If the store reaches this many entries, it starts removing old ones
const MAX_ENTRIES = 100;

interface LogStore {
	entries: LogEntry[];
	log: (level: LogLevel, message: string) => void;
	clear: () => void;
}

// Unique log id (just counts up each log)
let _logCounter = 0;

export const useLogStore = create<LogStore>((set) => ({
	entries: [],

	log: (level, message) =>
		set((s) => {
			// create entry
			const entry: LogEntry = {
				id: String(_logCounter++),
				time: new Date(),
				level,
				message,
			};

			// append entry to entries
			const entries = [...s.entries, entry];

			// if over the entry amount, slice off the old one
			return { entries: entries.length > MAX_ENTRIES ? entries.slice(-MAX_ENTRIES) : entries };
		}),

	clear: () => set({ entries: [] }),
}));
