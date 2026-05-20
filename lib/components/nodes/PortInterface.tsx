import { DATA_TYPE_COLOR, PORT_SIZE } from "@/lib/constants";
import { DataType } from "@/lib/types";
import React from "react";

interface PortInterfaceProps {
	label: string;
	dataType: DataType;
	isArray: boolean;
}

/*------------------------------- PortInterface.tsx ------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/components/nodes/PortInterface.tsx                                 |
| Descr:  Just the colorful dot! Maintains single source of truth on styling for   |
|   these interfaces, allowing it's instantiation in multiple places (Node.tsx     |
|   and TypeKey.tsx). Pulls color data from constants/index.ts.                    |
\*--------------------------------------------------------------------------------*/

export const PortInterface: React.FC<PortInterfaceProps> = ({ label, dataType, isArray }) => {
	const color = DATA_TYPE_COLOR[dataType] ?? DATA_TYPE_COLOR.unknown;

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
