"use client";

import React, { useCallback } from "react";
import type { NodeDef, PortPosition } from "@/lib/types";
import { useUIStore } from "@/lib/stores/uiStore";
import { useNodeDrag } from "@/lib/hooks/useNodeDrag";
import { Port } from "./Port";
import { CATEGORY_HEADER_COLOR, NODE_WIDTH } from "@/lib/constants";

interface NodeProps {
	node: NodeDef;
	position: { x: number; y: number };
	isSelected: boolean;
	connectedPorts: Set<string>;
	registerPort: (nodeId: string, portName: string, side: "input" | "output", el: HTMLElement | null) => void;
	onDragMove: () => void;
	getPortPos: (nodeId: string, side: "input" | "output", portName: string) => PortPosition | null;
	updatePortPositions: () => void;
}

/*----------------------------------- Node.tsx -----------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/components/nodes/Node.tsx                                          |
| Descr:  The component for the actual node that appears on the Canvas. Instant-   |
|   ated by Canvas.tsx, instantiates Port.tsx.                                     |
\*--------------------------------------------------------------------------------*/

//  +-----------------+
//	| Label        n# |	 <- Colored by type
//	+-----------------+
//	|     Inputs      |
//	o label		value |	 <- input values can be hardcoded, or overridden with an
//	o label		value |		connection, in which case it reads /external/
//  |     Outputs     |
//	| label			  o
//	| label			  o
//	+-----------------+

const DIVIDER: React.CSSProperties = {
	height: 1,
	background: "rgba(255,255,255,0.07)",
	margin: "2px 0",
};

export const Node: React.FC<NodeProps> = ({
	node,
	position,
	isSelected,
	connectedPorts,
	registerPort,
	onDragMove,
	getPortPos,
	updatePortPositions,
}) => {
	const { onMouseDown } = useNodeDrag(node.id, onDragMove);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if ((e.target as HTMLElement).closest("[data-port]")) return;
			useUIStore.getState().setSelected({ kind: "node", id: node.id });
		},
		[node.id],
	);

	const headerColor = CATEGORY_HEADER_COLOR[node.category];

	return (
		<div
			data-nodeid={node.id}
			onClick={handleClick}
			className="absolute rounded-[10px] select-none overflow-visible"
			style={{
				left: position.x,
				top: position.y,
				width: NODE_WIDTH,
				background: "rgb(49, 49, 49)",
				border: `1px solid ${isSelected ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
				boxShadow: isSelected
					? "0 0 0 1px rgba(59,130,246,0.3), 0 4px 24px rgba(0,0,0,0.6)"
					: "0 4px 8px rgba(0,0,0,0.3)",
				transition: "border-color 0.15s, box-shadow 0.15s",
				fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
			}}>
			{/* Title bar */}
			<div
				onMouseDown={onMouseDown}
				className="flex items-center justify-between py-0 px-2.5 h-7 rounded-t-[10px] cursor-move"
				style={{ background: headerColor }}>
				<span className="flex-1 text-white text-[12px] font-bold select-none overflow-hidden text-ellipsis whitespace-nowrap">
					{node.label}
				</span>
				<span className="text-[9px] ml-2 shrink-0" style={{ color: "rgba(255,255,255,0.5)" }}>
					{node.id}
				</span>
			</div>

			{/* Input rows */}
			{node.inputs.length > 0 && (
				<div className="pt-1 pb-0.5">
					{node.inputs.map((port) => {
						const isConnected = connectedPorts.has(`input:${port.name}`);
						const value = node.inputValues?.[port.name] ?? port.defaultValue ?? "";
						return (
							<div key={port.name} className="w-full">
								<Port
									nodeId={node.id}
									portName={port.name}
									label={port.label}
									dataType={port.dataType}
									isArray={port.isArray}
									side="input"
									isConnected={isConnected}
									portRef={(el) => registerPort(node.id, port.name, "input", el)}
									onDragMove={onDragMove}
									getPortPos={getPortPos}
									updatePortPositions={updatePortPositions}
									value={isConnected ? undefined : value}
									isOverridden={isConnected}
								/>
							</div>
						);
					})}
				</div>
			)}

			{node.inputs.length > 0 && node.outputs.length > 0 && <div style={DIVIDER} />}

			{/* Output rows */}
			{node.outputs.length > 0 && (
				<div style={{ paddingTop: 2, paddingBottom: 4 }}>
					{node.outputs.map((port) => (
						<div key={port.name} className="w-full">
							<Port
								nodeId={node.id}
								portName={port.name}
								label={port.label}
								dataType={port.dataType}
								isArray={port.isArray}
								side="output"
								isConnected={connectedPorts.has(`output:${port.name}`)}
								portRef={(el) => registerPort(node.id, port.name, "output", el)}
								onDragMove={onDragMove}
								getPortPos={getPortPos}
								updatePortPositions={updatePortPositions}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
