'use client';

import { useRef, useCallback } from 'react';
import type { PortPosition } from '@/lib/types';

/*------------------------------ usePortPositions.ts -----------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/hooks/usePortPositions.ts                                          |
| Descr:  This adds all the port-handling hooks. We need to keep track of the      |
|   position of every port, update them when the nodes move, and return then when  |
|   they are needed to connect edges. registerport passed by Canvas to Node which  |
|   calls when creating inputs/outputs; usePortPos passed by Canvas to EdgeLayer   |
|   which calls the function when creating Edges. update-all is passed to several  |
|   places to update port positions when the nodes are created or move. A plain    |
|   ref is used here instead of reactive components so that hundreds of updates    |
|   aren't triggered on every edit.                                                |
\*--------------------------------------------------------------------------------*/

// Ports get an id of the form "nodeId:side:portName"
type PortKey = string;

const makeKey = (nodeId: string, side: 'input' | 'output', portName: string): PortKey =>
	`${nodeId}:${side}:${portName}`;

export function usePortPositions(canvasRef: React.RefObject<HTMLElement | null>) {
	// Map of portKey to live DOM element
	const portEls = useRef<Map<PortKey, HTMLElement>>(new Map());
	// Map of portKey to last computed position (relative to canvas)
	const portPositions = useRef<Map<PortKey, PortPosition>>(new Map());

	// Add a port to the refs - handles delete when called with no HTMLElement
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

	// update the position for ever port registered in the refs
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

	// return the last updated position of the port by id
	const getPortPos = useCallback(
		(nodeId: string, side: 'input' | 'output', portName: string): PortPosition | null =>
			portPositions.current.get(makeKey(nodeId, side, portName)) ?? null,
		[]
	);

	return { registerPort, updateAll, getPortPos };
}
