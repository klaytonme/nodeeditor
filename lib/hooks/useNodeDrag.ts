'use client';

import { useRef, useCallback } from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import type { XYPosition } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// useNodeDrag — attaches mouse drag behaviour to a node element.
//
// Positions are stored in uiStore (not graphStore) for immediate updates.
// Position ops are sent to the backend separately with debouncing — see
// dispatch.updatePosition() which you can add when ready.
//
// Usage:
//   const { onMouseDown } = useNodeDrag(nodeId, onDragMove);
//   <div onMouseDown={onMouseDown} />
//
// onDragMove is called on every move — use it to trigger edge re-rendering.
// ─────────────────────────────────────────────────────────────────────────────

export function useNodeDrag(
	nodeId: string,
	onDragMove?: () => void
) {
	const dragStart = useRef<{ mouse: XYPosition; nodePos: XYPosition } | null>(null);

	const onMouseDown = useCallback(
		(e: React.MouseEvent) => {
			// Don't start drag if clicking a port
			if ((e.target as HTMLElement).closest('[data-port]')) return;
			e.preventDefault();
			e.stopPropagation();

			const { setPosition, positions } = useUIStore.getState();
			const nodePos = positions[nodeId] ?? { x: 0, y: 0 };
			dragStart.current = {
				mouse: { x: e.clientX, y: e.clientY },
				nodePos,
			};

			const onMove = (ev: MouseEvent) => {
				if (!dragStart.current) return;
				const dx = ev.clientX - dragStart.current.mouse.x;
				const dy = ev.clientY - dragStart.current.mouse.y;
				const newPos = {
					x: dragStart.current.nodePos.x + dx,
					y: dragStart.current.nodePos.y + dy,
				};
				setPosition(nodeId, newPos);
				onDragMove?.();
			};

			const onUp = () => {
				dragStart.current = null;
				window.removeEventListener('mousemove', onMove);
				window.removeEventListener('mouseup', onUp);
				// TODO: dispatch.updatePosition(nodeId, positions[nodeId])
				// with POSITION_DEBOUNCE_MS debounce when backend is ready
			};

			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
		},
		[nodeId, onDragMove]
	);

	return { onMouseDown };
}
