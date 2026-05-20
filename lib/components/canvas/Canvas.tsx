"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { useGraphStore } from "@/lib/stores/graphStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { usePortPositions } from "@/lib/hooks/usePortPositions";
import { Node } from "@/lib/components/nodes/Node";
import { EdgeLayer } from "@/lib/components/edges/EdgeLayer";
import { dispatch } from "@/lib/sync/dispatch";

/*+----------------------------- Canvas.tsx -----------------------------
  | Author: Clayton Wiley
  | Copy:   Copyright © 2026
  | Path:   ./lib/components/canvas/
  | Descr:  The canvas is responsible for rendering all Node components
  |    (DOM, absolutely positioned), rendering EdgeLayer (SVG, sits
  |    behind nodes), and forwarding mouse events to uiStore.
/*+--------------------------------------------------------------------*/

export const Canvas: React.FC = () => {
	const wrapRef = useRef<HTMLDivElement>(null);
	const nodes = useGraphStore((s) => s.nodes);
	const edges = useGraphStore((s) => s.edges);
	const version = useGraphStore((s) => s.version);
	const positions = useUIStore((s) => s.positions);
	const selected = useUIStore((s) => s.selected);
	const portDrag = useUIStore((s) => s.portConnect);
	const portConnect = useUIStore((s) => s.portConnect);

	const { registerPort, updateAll, getPortPos } = usePortPositions(wrapRef);
	const [tick, setTick] = useState(0);

	// Subsequent renders (node move, add/remove) — keep positions fresh
	// TODO: find a way to run this more efficiently
	useEffect(() => {
		updateAll();
	});

	useEffect(() => {
		// The the edge node drawing is faster than the site load -> reupdate using animation frame
		const frame = requestAnimationFrame(() => {
			updateAll();
			setTick((t) => t + 1); // force EdgeLayer re-render with fresh positions
		});
		return () => cancelAnimationFrame(frame);
	}, [version, positions]);

	const canvasFocused = useRef(false);

	// Keyboard events for stuff like deselection, deletion, etc
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!wrapRef.current?.contains(document.activeElement)) return;
			// Prevent if the user is typing in an input/textarea so you don't delete nodes while typing :)
			const tag = (e.target as HTMLElement).tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;

			const { selected, clearSelected, endPortConnect } = useUIStore.getState();

			// Deselect
			if (e.key === "Escape") {
				clearSelected();
				endPortConnect();
			}

			// Delete
			if (e.key === "Delete" || e.key === "Backspace") {
				if (!selected) return;
				if (selected.kind === "node") dispatch.removeNode(selected.id);
				if (selected.kind === "edge") dispatch.removeEdge(selected.id);
				clearSelected();
			}
		};

		// Add and remove every render? Seems wrong, but I found it on stack exchange and it works
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Track mouse for edge drawing
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!portDrag && !portConnect) return;
			const rect = wrapRef.current!.getBoundingClientRect();
			useUIStore.getState().updatePortConnect({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
			updateAll();
		},
		[portDrag, updateAll],
	);

	// Cancel port drag on mouse up anywhere on canvas
	const handleMouseUp = useCallback(() => {
		if (portDrag) useUIStore.getState().endPortConnect();
	}, [portDrag]);

	// Clear selection on background click
	const handleCanvasClick = useCallback((e: React.MouseEvent) => {
		if (e.target === wrapRef.current) {
			useUIStore.getState().clearSelected();
			useUIStore.getState().endPortConnect();
		}
	}, []);

	// Compute which ports are connected - I can't remember why I added this, but I'm scared to remove it
	const connectedPortsByNode: Record<string, Set<string>> = {};
	Object.values(edges).forEach((edge) => {
		if (!connectedPortsByNode[edge.src]) connectedPortsByNode[edge.src] = new Set();
		if (!connectedPortsByNode[edge.dst]) connectedPortsByNode[edge.dst] = new Set();
		connectedPortsByNode[edge.src].add(`output:${edge.srcPort}`);
		connectedPortsByNode[edge.dst].add(`input:${edge.dstPort}`);
	});

	return (
		<div
			ref={wrapRef}
			tabIndex={-1} // makes it focusable without appearing in tab order
			onMouseDown={() => wrapRef.current?.focus()} // grab focus on any click inside
			onFocus={() => {
				canvasFocused.current = true;
			}}
			onBlur={() => {
				canvasFocused.current = false;
			}}
			className="h-full w-full flex-1 relative overflow-hidden"
			style={{
				backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
				backgroundSize: "24px 24px",
				cursor: portDrag || portConnect ? "crosshair" : "default",
			}}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onClick={handleCanvasClick}>
			{/* SVG edge layer */}
			<EdgeLayer getPortPos={getPortPos} />

			{/* Node DOM layer */}
			{Object.values(nodes).map((node) => (
				<Node
					key={node.id}
					node={node}
					position={positions[node.id] ?? { x: 80, y: 80 }}
					isSelected={selected?.kind === "node" && selected.id === node.id}
					connectedPorts={connectedPortsByNode[node.id] ?? new Set()}
					registerPort={registerPort}
					onDragMove={updateAll}
					getPortPos={getPortPos}
					updatePortPositions={updateAll}
				/>
			))}
		</div>
	);
};
