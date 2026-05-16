'use client';

import { useRef, useCallback } from 'react';
import type { PortPosition } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// usePortPositions — a ref-based registry mapping port DOM positions.
//
// Why not useState/Zustand?
//   Port positions update on every node drag (mousemove). Putting them in
//   reactive state would cause hundreds of re-renders per second. Instead,
//   we keep them in a plain ref and read them imperatively during edge rendering.
//
// Usage:
//   const { registerPort, getPortPos, updateAll } = usePortPositions(canvasRef);
//
//   // In each port element:
//   <div ref={(el) => registerPort(nodeId, portName, side, el)} ... />
//
//   // When redrawing edges (on drag):
//   updateAll();
//   const pos = getPortPos(nodeId, 'output', 'data');
// ─────────────────────────────────────────────────────────────────────────────

type PortKey = string; // `${nodeId}:${side}:${portName}`

const makeKey = (nodeId: string, side: 'input' | 'output', portName: string): PortKey =>
	`${nodeId}:${side}:${portName}`;

export function usePortPositions(canvasRef: React.RefObject<HTMLElement | null>) {
	// Map of portKey → live DOM element
	const portEls = useRef<Map<PortKey, HTMLElement>>(new Map());
	// Map of portKey → last computed position (relative to canvas)
	const portPositions = useRef<Map<PortKey, PortPosition>>(new Map());

	const registerPort = useCallback(
		(
			nodeId: string,
			portName: string,
			side: 'input' | 'output',
			el: HTMLElement | null
		) => {
			const key = makeKey(nodeId, side, portName);
			if (el) {
				portEls.current.set(key, el);
			} else {
				portEls.current.delete(key);
				portPositions.current.delete(key);
			}
		},
		[]
	);

	/** Recompute all port positions from current DOM layout */
	const updateAll = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const canvasRect = canvas.getBoundingClientRect();

		portEls.current.forEach((el, key) => {
			const r = el.getBoundingClientRect();
			const [nodeId, side] = key.split(':') as [string, 'input' | 'output', string];
			portPositions.current.set(key, {
				x: r.left - canvasRect.left + r.width / 2,
				y: r.top - canvasRect.top + r.height / 2,
				side,
			});
		});
	}, [canvasRef]);

	const getPortPos = useCallback(
		(nodeId: string, side: 'input' | 'output', portName: string): PortPosition | null =>
			portPositions.current.get(makeKey(nodeId, side, portName)) ?? null,
		[]
	);

	return { registerPort, updateAll, getPortPos };
}
