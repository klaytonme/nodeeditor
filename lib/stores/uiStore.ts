'use client';

import { create } from 'zustand';
import type { XYPosition, SelectionTarget } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// uiStore — ephemeral, local-only state.
//
// Rules:
//   • Nothing here is ever sent to the backend
//   • Positions are stored here and synced to backend separately (debounced)
//   • Selection, drag state, viewport all live here
// ─────────────────────────────────────────────────────────────────────────────

interface PortDragState {
	srcNodeId: string;
	srcPort: string;
	currentMouse: XYPosition;
}

interface UIStore {
	// Node positions
	positions: Record<string, XYPosition>;
	setPosition: (id: string, pos: XYPosition) => void;
	removePosition: (id: string) => void;

	// Selection
	selected: SelectionTarget;
	setSelected: (target: SelectionTarget) => void;
	clearSelected: () => void;

	// Viewport (pan/zoom)
	viewport: { x: number; y: number; zoom: number };
	setViewport: (v: { x: number; y: number; zoom: number }) => void;

	// Port drag (in-progress edge being drawn)
	portDrag: PortDragState | null;
	startPortDrag: (srcNodeId: string, srcPort: string, mouse: XYPosition) => void;
	updatePortDrag: (mouse: XYPosition) => void;
	endPortDrag: () => void;

	// Run animation state
	isRunning: boolean;
	setRunning: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	positions: {},
	setPosition: (id, pos) =>
		set((s) => ({ positions: { ...s.positions, [id]: pos } })),
	removePosition: (id) =>
		set((s) => {
			const positions = { ...s.positions };
			delete positions[id];
			return { positions };
		}),

	selected: null,
	setSelected: (target) => set({ selected: target }),
	clearSelected: () => set({ selected: null }),

	viewport: { x: 0, y: 0, zoom: 1 },
	setViewport: (v) => set({ viewport: v }),

	portDrag: null,
	startPortDrag: (srcNodeId, srcPort, mouse) =>
		set({ portDrag: { srcNodeId, srcPort, currentMouse: mouse } }),
	updatePortDrag: (mouse) =>
		set((s) =>
			s.portDrag ? { portDrag: { ...s.portDrag, currentMouse: mouse } } : s
		),
	endPortDrag: () => set({ portDrag: null }),

	isRunning: false,
	setRunning: (v) => set({ isRunning: v }),
}));
