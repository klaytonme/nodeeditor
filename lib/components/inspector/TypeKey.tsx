import { DATA_TYPES, DataType } from "@/lib/types";
import React from "react";
import { PortInterface } from "../nodes/PortInterface";
import { DATA_TYPE_META } from "@/lib/constants";

/*--------------------------------------- TypeKey.tsx --------------------------------------*\
| Author: Clayton Wiley                                                                      |
| Copy:   Copyright © 2026                                                                   |
| Path:   ./lib/components/inspector/TypeKey.tsx                                             |
| Descr:  In an effort to include *some* amount of usability, this type legend should        |
|   hopefully make it a little easier to interpret the graph. It implements the same port    |
|   dot generator as the actual graph making that the single source of truth for styling.    |
|   No conflicts here!                                                                       |
\*------------------------------------------------------------------------------------------*/

export const TypeKey: React.FC = () => {
	return (
		<div style={{ marginTop: 16 }}>
			<div className="text-[11px] tracking-wider uppercase mb-2">Type Legend</div>
			{DATA_TYPES.map((type) => {
				const { label, color } = DATA_TYPE_META[type];
				return (
					<div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
						<PortInterface label={""} dataType={type} isArray={false}></PortInterface>
						<span style={{ fontSize: 12, color: "var(--text-dim)", flex: 1 }}>{label}</span>
						<span style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: "0.04em" }}>{type}</span>
					</div>
				);
			})}
			<div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
				<PortInterface label={""} dataType={"any"} isArray={true}></PortInterface>
				<span style={{ fontSize: 11, color: "var(--text-dim)" }}>array (any type)</span>
			</div>
		</div>
	);
};
