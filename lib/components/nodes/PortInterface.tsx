import { DATA_TYPE_COLOR, PORT_SIZE } from "@/lib/constants";
import { useUIStore } from "@/lib/stores/uiStore";
import { dispatch } from "@/lib/sync/dispatch";
import { DataType } from "@/lib/types";
import React, { useCallback } from "react";

interface PortInterfaceProps {
	label: string;
	dataType: DataType;
	isArray: boolean;
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

export const PortInterface: React.FC<PortInterfaceProps> = ({ label, dataType, isArray }) => {
	const color = DATA_TYPE_COLOR[dataType] ?? DATA_TYPE_COLOR.unknown;
	const isAny = dataType === "any";

	const isEncrypted = dataType === "encrypted";

	const borderRadius = isEncrypted ? 0 : isArray ? 2 : "50%";
	const transform = isArray && !isEncrypted ? "rotate(45deg)" : undefined;

	const indicatorStyle: React.CSSProperties = {
		width: PORT_SIZE,
		height: PORT_SIZE,
		flexShrink: 0,
		background: color,
		borderRadius,
		transform,
		border: `1px solid rgb(43, 43, 43)`,
		cursor: "crosshair",
		transition: "box-shadow 0.12s",
		zIndex: 10,
	};

	return (
		<div
			data-datatype={dataType}
			data-isarray={String(isArray)}
			style={indicatorStyle}
			title={`${label} (${dataType}${isArray ? "[]" : ""})`}
		/>
	);
};
