'use client';

import { useRef, useCallback } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import type { XYPosition } from '@/lib/types';


/*-------------------------------- useNodeDrag.ts --------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/hooks/useNodeDrag.ts                                               |
| Descr:  This creates a hook which is attached to nodes in the Canvas on mouse    |
|   down. It creates and attaches 1. mouse move listener which updates the         |
|   frontend UI store to change the position of the node while it is being         |
|   dragged and update the edges (update-all passed as onDragMove) and 2. mouse    |
|   up behavior to remove these hooks and (eventually) disbatch the final          |
|   position to be stored on the backend (non-functional, just so the UI can be    |
|   reloaded).                                                                     |
\*--------------------------------------------------------------------------------*/


// Positions are stored in uiStore (not graphStore) for immediate updates.
// Position ops are sent to the backend separately with debouncing in
// dispatch.updatePosition() which can be added in the future

// Usage: (in Node.tsx)
//   const { onMouseDown } = useNodeDrag(nodeId, onDragMove);
//   <div onMouseDown={onMouseDown} />

export function useNodeDrag(
	nodeId: string,
	onDragMove?: () => void // Update-all is passed to regenerate edges on node drag 
) {
	// create a reference
	const dragStart = useRef<{ mouse: XYPosition; nodePos: XYPosition } | null>(null);

	const onMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Don't start drag if clicking a port
			if ((e.target as HTMLElement).closest('[data-port]')) return;
			e.preventDefault();
			e.stopPropagation();

			// Update ref with initial mouse position
			const { setPosition, positions } = useUIStore.getState();
			const nodePos = positions[nodeId] ?? { x: 0, y: 0 };
			dragStart.current = {
				mouse: { x: e.clientX, y: e.clientY },
				nodePos,
			};

			// Define mouse move handler
			const onMove = (ev: MouseEvent) => {
				if (!dragStart.current) return;
				// take position
				const dx = ev.clientX - dragStart.current.mouse.x;
				const dy = ev.clientY - dragStart.current.mouse.y;
				const newPos = {
					x: dragStart.current.nodePos.x + dx,
					y: dragStart.current.nodePos.y + dy,
				};
				// call UIStore set position and the passed drag move function (which is update-all for the edges)
				setPosition(nodeId, newPos);
				onDragMove?.();
			};

			// define mouse up handler
			const onUp = () => {
				dragStart.current = null; 							// end the drag
				window.removeEventListener('mousemove', onMove);	// remove this and the mouse move handler
				window.removeEventListener('mouseup', onUp);
				onDragMove?.();										// call one last update-all

				// TODO: In order store the new positions into the backend so it persists across logs, call
				// dispatch.updatePosition(nodeId, positions[nodeId])
				// with POSITION_DEBOUNCE_MS debounce when backend is ready
			};

			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
		},
		[nodeId, onDragMove]
	);

	return { onMouseDown };
}
