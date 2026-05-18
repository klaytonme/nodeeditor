"use client";

import React, { useCallback } from "react";
import { useUIStore } from "@/lib/stores/uiStore";
import { DATA_TYPE_COLOR, PORT_SIZE } from "@/lib/constants";
import type { DataType, PortPosition } from "@/lib/types";
import { dispatch } from "@/lib/sync/dispatch";
import { PortInterface } from "./PortInterface";

interface PortProps {
	nodeId: string;
	portName: string;
	label: string;
	dataType: DataType;
	isArray: boolean;
	side: "input" | "output";
	isConnected: boolean;
	portRef: (el: HTMLElement | null) => void;
	onDragMove?: () => void;
	getPortPos: (nodeId: string, side: "input" | "output", portName: string) => PortPosition | null;
	updatePortPositions: () => void;
	value?: string;
	isOverridden?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Port — a typed connection point rendered inline within a node row.
//
// Visual encoding (matching Cloudstream original):
//   Colour  → data type  (str=teal, int=orange, float=red, date=lavender, obj=blue…)
//   Shape   → scalar vs array:
//               circle         = scalar
//               rotated square = array
//               square (no rotate, no radius) = encrypted
//
// Inputs:  port indicator on the LEFT edge of the row
// Outputs: port indicator on the RIGHT edge of the row
// ─────────────────────────────────────────────────────────────────────────────

export const Port: React.FC<PortProps> = ({
	nodeId,
	portName,
	label,
	dataType,
	isArray,
	side,
	isConnected,
	portRef,
	onDragMove,
	getPortPos,
	updatePortPositions,
	value,
	isOverridden,
}) => {
	const portConnect = useUIStore((s) => s.portConnect);

	const isInput = side === "input";

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (side !== "output") return;
			e.stopPropagation();
			e.preventDefault();
			updatePortPositions();
			const pos = getPortPos(nodeId, "output", portName);
			useUIStore.getState().startPortConnect(nodeId, portName, pos ?? { x: 0, y: 0 });
		},
		[nodeId, portName, side, getPortPos, updatePortPositions],
	);

	const handleMouseUp = useCallback(
		(e: React.MouseEvent) => {
			if (side !== "input") return;
			const { portConnect: portDrag, endPortConnect: endPortDrag } = useUIStore.getState();
			if (!portDrag) return;
			e.stopPropagation();
			if (portDrag.srcNodeId !== nodeId) {
				dispatch.addEdge(portDrag.srcNodeId, portDrag.srcPort, nodeId, portName);
			}
			endPortDrag();
			onDragMove?.();
		},
		[nodeId, portName, side, onDragMove],
	);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			const { portConnect, startPortConnect, endPortConnect } = useUIStore.getState();

			if (!isInput) {
				// If already pending from this port, cancel it
				if (portConnect) {
					endPortConnect();
				} else {
					// Start a new pending click-to-connect
					const pos = getPortPos(nodeId, "output", portName);
					startPortConnect(nodeId, portName, pos ?? { x: 0, y: 0 });
					console.log("started");
				}
				return;
			} else if (portConnect) {
				// Complete the connection
				if (portConnect.srcNodeId !== nodeId) {
					dispatch.addEdge(portConnect.srcNodeId, portConnect.srcPort, nodeId, portName);
				}
				endPortConnect();
				onDragMove?.();
			}
		},
		[nodeId, portName, side, onDragMove],
	);

	return (
		<div className="flex items-center justify-between flex-row gap-3 h-6 relative px-1">
			{/* Port indicator — sits at the outer edge */}
			<div
				ref={portRef}
				data-port={portName}
				data-node={nodeId}
				data-side={side}
				className="inline-flex absolute justify-center align-middle"
				style={{
					right: isInput ? "" : -PORT_SIZE / 2 + "px",
					left: isInput ? -PORT_SIZE / 2 + "px" : "",
				}}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onClick={handleClick}
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLElement).style.boxShadow = "0 0 5px 2px #48abe0";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLElement).style.boxShadow = "";
				}}>
				<PortInterface label={label} dataType={dataType} isArray={isArray}></PortInterface>
			</div>

			{/* Label */}
			<span
				className="shrink-0 text-[11px] select-none overflow-hidden text-ellipsis whitespace-nowrap pl-2"
				style={{
					color: "rgba(255,255,255,0.75)",
				}}>
				{label}
			</span>

			{/* Value */}
			{isInput && isConnected ? (
				<span
					className="text-[11px] justify-end text-right italic select-none overflow-hidden text-ellipsis whitespace-nowrap pr-2"
					style={{
						color: "rgba(255,255,255,0.5)",
					}}>
					external
				</span>
			) : (
				<span
					className="text-[11px] justify-end text-right select-none overflow-hidden text-ellipsis whitespace-nowrap pr-2"
					style={{
						color: "rgba(255,255,255,0.75)",
					}}>
					{value}
				</span>
			)}
		</div>
	);
};
