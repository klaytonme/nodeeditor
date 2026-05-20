"use client";

import React from "react";
import type { EdgeDef } from "@/lib/types";
import { bezierPath } from "./edgePath";
import type { PortPosition } from "@/lib/types";

interface EdgeProps {
	edge: EdgeDef;
	srcPos: PortPosition | null;
	dstPos: PortPosition | null;
	isSelected: boolean;
	isRunning: boolean;
	onClick: (edgeId: string) => void;
}

/*------------------------------ Edge.tsx ------------------------------*\
| Author: Clayton Wiley                                                  |
| Copy:   Copyright © 2026                                               |
| Path:   ./lib/components/edges/Edge.tsx                                |
| Descr:  This component uses the g html element to group three svgs:    |
|   a base path, a wider clickable path (invisible), and an              |
|   animated flow path. Together, they makeup a single edge on           |
|   the canvas. The relevant onclick, and render conditions are          |
|   passed in as is the path.                                            |
\*----------------------------------------------------------------------*/

export const Edge: React.FC<EdgeProps> = ({ edge, srcPos, dstPos, isSelected, isRunning, onClick }) => {
	if (!srcPos || !dstPos) return null;

	const d = bezierPath(srcPos.x, srcPos.y, dstPos.x, dstPos.y);

	// Group element g
	return (
		<g data-eid={edge.id} style={{ cursor: "pointer" }} onClick={() => onClick(edge.id)}>
			{/* 1. Invisible wide hit area so clicking edges isn't fiddly */}
			<path d={d} fill="none" stroke="transparent" strokeWidth={12} style={{ pointerEvents: "auto" }} />

			{/* 2. Visible base line */}
			<path
				d={d}
				fill="none"
				stroke={isSelected ? "var(--accent)" : "rgba(255,255,255,0.18)"}
				strokeWidth={isSelected ? 2 : 1.5}
				markerEnd={isSelected ? "url(#arrow-active)" : "url(#arrow)"}
				style={{ transition: "stroke 0.15s" }}
			/>

			{/* 3. Flow animation overlay */}
			{isRunning && (
				<path
					d={d}
					fill="none"
					stroke="var(--accent)"
					strokeWidth={1.5}
					strokeDasharray="4 8"
					style={{
						animation: "flowAnim 1.2s linear infinite",
						pointerEvents: "none",
					}}
				/>
			)}
		</g>
	);
};
