import { DATA_TYPES, DataType } from "@/lib/types";
import React from "react";
import { PortInterface } from "../nodes/PortInterface";
import { DATA_TYPE_META } from "@/lib/constants";

export const TypeKey: React.FC = () => {
	return (
		<div style={{ marginTop: 16 }}>
			<div
				style={{
					fontSize: 9,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					color: "var(--text-muted)",
					marginBottom: 8,
				}}>
				Type Legend
			</div>
			{DATA_TYPES.map((type) => {
				const { label, color } = DATA_TYPE_META[type];
				return (
					<div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
						<PortInterface label={""} dataType={type} isArray={false}></PortInterface>
						{/* <div
							style={{
								width: 9,
								height: 9,
								flexShrink: 0,
								background: color,
								borderRadius: isSquare ? 1 : "50%",
								border: "1px solid rgba(0,0,0,0.4)",
							}}
						/> */}
						<span style={{ fontSize: 11, color: "var(--text-dim)", flex: 1 }}>{label}</span>
						<span style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: "0.04em" }}>{type}</span>
					</div>
				);
			})}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginTop: 8,
					paddingTop: 8,
					borderTop: "1px solid var(--border)",
				}}>
				<PortInterface label={""} dataType={"any"} isArray={true}></PortInterface>
				<span style={{ fontSize: 11, color: "var(--text-dim)" }}>array (any type)</span>
			</div>
		</div>
	);
};
