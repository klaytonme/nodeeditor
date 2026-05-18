"use client";

import React, { useCallback, useState } from "react";
import { useGraphStore } from "@/lib/stores/graphStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { dispatch } from "@/lib/sync/dispatch";
import { CATEGORY_HEADER_COLOR, DATA_TYPE_COLOR } from "@/lib/constants";
import { DATA_TYPES, type DataType, type NodeDef, type PortDef } from "@/lib/types";
import { TypeKey } from "./TypeKey";
import { PortInterface } from "../nodes/PortInterface";

// ─────────────────────────────────────────────────────────────────────────────
// Inspector — typed input controls per port dataType.
// If a port is connected via an edge, its hardcoded value is shown as overridden.
// ─────────────────────────────────────────────────────────────────────────────

// ── Typed input controls ────────────────────────────────────────────────────

interface PortInputProps {
	port: PortDef;
	value: string;
	isOverridden: boolean;
	onChange: (value: string) => void;
}

const PortInput: React.FC<PortInputProps> = ({ port, value, isOverridden, onChange }) => {
	const baseInput =
		"w-full bg-white/5 border border-white/10 rounded text-[11px] text-white/80 outline-none font-mono px-2 py-1 transition-colors focus:border-blue-500/60";
	const overrideClass = "opacity-40 pointer-events-none select-none";

	if (isOverridden) {
		return <div className={`${baseInput} ${overrideClass} italic text-white/30`}>external input</div>;
	}

	switch (port.dataType) {
		case "bool":
			return (
				<button
					onClick={() => onChange(value === "true" ? "false" : "true")}
					className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value === "true" ? "bg-blue-500" : "bg-white/10"}`}>
					<span
						className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value === "true" ? "translate-x-4" : "translate-x-1"}`}
					/>
				</button>
			);

		case "int":
			return (
				<input
					type="number"
					step="1"
					className={baseInput}
					defaultValue={value}
					onBlur={(e) => onChange(String(Math.round(Number(e.target.value))))}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
					}}
				/>
			);

		case "float":
			return (
				<input
					type="number"
					step="any"
					className={baseInput}
					defaultValue={value}
					onBlur={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
					}}
				/>
			);

		case "date":
			return (
				<input
					type="datetime-local"
					className={baseInput}
					defaultValue={value}
					onBlur={(e) => onChange(e.target.value)}
				/>
			);

		case "obj":
			return (
				<textarea
					className={`${baseInput} resize-none leading-relaxed`}
					rows={3}
					defaultValue={value || "{}"}
					onBlur={(e) => onChange(e.target.value)}
					placeholder="{}"
					spellCheck={false}
				/>
			);

		case "pulse":
			return (
				<button
					className="w-full py-1 px-3 rounded text-[11px] font-medium bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer"
					onClick={() =>
						onChange(
							"last - " +
								new Date().getHours().toString().padStart(2, "0") +
								":" +
								new Date().getMinutes().toString().padStart(2, "0") +
								":" +
								new Date().getSeconds().toString().padStart(2, "0"),
						)
					}>
					▶ Test pull
				</button>
			);

		case "encrypted":
			return (
				<input
					type="password"
					className={baseInput}
					defaultValue={value}
					onBlur={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
					}}
					placeholder="••••••••"
				/>
			);

		case "str":
		default:
			return (
				<input
					type="text"
					className={baseInput}
					defaultValue={value}
					onBlur={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
					}}
				/>
			);
	}
};

// ── Parse Object field editor ─────────────────────────────────────────────────

interface ParseObjFieldEditorProps {
	nodeId: string;
	outputs: PortDef[];
}

const ParseObjFieldEditor: React.FC<ParseObjFieldEditorProps> = ({ nodeId, outputs }) => {
	const [newName, setNewName] = useState("");
	const [newType, setNewType] = useState<DataType>("any");

	const userFields = outputs.filter((p) => p.userDefined);
	const builtinPorts = outputs.filter((p) => !p.userDefined);

	const addField = () => {
		const name = newName.trim();
		if (!name) return;
		// Prevent duplicates
		if (outputs.some((p) => p.name === name)) return;
		const newPort: PortDef = {
			name,
			label: name,
			dataType: newType,
			isArray: false,
			userDefined: true,
		};
		dispatch.updateOutputs(nodeId, [...outputs, newPort]);
		setNewName("");
		setNewType("any");
	};

	const removeField = (portName: string) => {
		dispatch.updateOutputs(
			nodeId,
			outputs.filter((p) => p.name !== portName),
		);
	};

	const baseInput =
		"bg-white/5 border border-white/10 rounded text-[11px] text-white/80 outline-none px-2 py-1 transition-colors focus:border-blue-500/60";

	return (
		<div className="flex flex-col gap-2">
			{/* Built-in ports — read-only */}
			{builtinPorts.map((port) => {
				const color = DATA_TYPE_COLOR[port.dataType];
				return (
					<div key={port.name} className="flex items-center gap-2 py-0.5">
						<PortInterface label={""} dataType={port.dataType} isArray={false} />
						<span className="text-[10px] text-white/50 flex-1">{port.label}</span>
						<span className="text-[9px] font-bold" style={{ color }}>
							{port.dataType}
							{port.isArray ? "[]" : ""}
						</span>
						<div className="w-4" /> {/* spacer where delete btn would be */}
					</div>
				);
			})}

			{/* User-defined / listened fields */}
			{userFields.length > 0 && (
				<div className="flex flex-col gap-1 mt-1 pt-1 border-t border-white/5">
					{userFields.map((port) => {
						const color = DATA_TYPE_COLOR[port.dataType];
						return (
							<div key={port.name} className="flex items-center gap-2 py-0.5 group">
								<PortInterface label={""} dataType={port.dataType} isArray={false} />
								<span className="text-[10px] text-white/70 flex-1 font-mono">{port.name}</span>
								{port.listenedField && (
									<span className="text-[8px] text-white/20 italic">listened</span>
								)}
								<span className="text-[9px] font-bold" style={{ color }}>
									{port.dataType}
								</span>
								<button
									className="w-4 h-4 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
									onClick={() => removeField(port.name)}
									title="Remove field">
									×
								</button>
							</div>
						);
					})}
				</div>
			)}

			{/* Add field row */}
			<div className="flex gap-1.5 mt-2 pt-2 border-t border-white/5">
				<input
					className={`${baseInput} flex-1 min-w-0`}
					placeholder="field name"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") addField();
					}}
					spellCheck={false}
				/>
				<select
					className={`${baseInput} w-16 cursor-pointer`}
					value={newType}
					onChange={(e) => setNewType(e.target.value as DataType)}>
					{DATA_TYPES.filter((t) => t !== "unknown").map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
				<button
					className="px-2 py-1 rounded text-[11px] bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
					onClick={addField}
					disabled={!newName.trim()}>
					+
				</button>
			</div>
		</div>
	);
};

// ── Section label ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="text-[9px] tracking-widest uppercase text-white/30 mb-2 mt-4 first:mt-0">{children}</div>
);

// ── Main Inspector ───────────────────────────────────────────────────────────

export const Inspector: React.FC = () => {
	const selected = useUIStore((s) => s.selected);
	const nodes = useGraphStore((s) => s.nodes);
	const edges = useGraphStore((s) => s.edges);

	// Set of `nodeId:portName` input ports that are connected via an edge
	const connectedInputs = new Set(Object.values(edges).map((e) => `${e.dst}:${e.dstPort}`));

	const handleInputChange = useCallback((nodeId: string, port: string, value: string) => {
		dispatch.updateInputValue(nodeId, port, value);
	}, []);

	const handleLabelChange = useCallback((nodeId: string, value: string) => {
		dispatch.updateLabel(nodeId, value);
	}, []);

	const handleDeleteNode = useCallback((id: string) => {
		dispatch.removeNode(id);
		useUIStore.getState().clearSelected();
	}, []);

	const handleDeleteEdge = useCallback((id: string) => {
		dispatch.removeEdge(id);
		useUIStore.getState().clearSelected();
	}, []);

	const renderEmpty = () => (
		<div className="flex flex-col h-full">
			<p className="text-[11px] text-white/30 leading-relaxed">
				Select a node or edge to inspect it.
				<br />
				<br />
				Drag or click from an output port to an input port to connect nodes.
			</p>
			<div className="flex-1"></div>
			<TypeKey></TypeKey>
		</div>
	);

	const renderNodeInspector = (nodeId: string) => {
		const node = nodes[nodeId];
		if (!node) return renderEmpty();

		const headerColor = CATEGORY_HEADER_COLOR[node.category];

		return (
			<div className="flex flex-col gap-0">
				{/* Node type header */}
				<div
					className="flex items-center justify-between px-3 py-2 rounded-md mb-4 text-white"
					style={{ background: headerColor }}>
					<span className="text-[11px] font-semibold">{node.label}</span>
					<span className="text-[9px] opacity-50">{node.id}</span>
				</div>

				{/* Label */}
				<SectionLabel>Label</SectionLabel>
				<input
					className="w-full bg-white/5 border border-white/10 rounded text-[11px] text-white/80 outline-none px-2 py-1 mb-3 focus:border-blue-500/60 transition-colors"
					defaultValue={node.label}
					onBlur={(e) => handleLabelChange(nodeId, e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") (e.target as HTMLInputElement).blur();
					}}
				/>

				{/* Input port values */}
				{node.inputs.length > 0 && (
					<>
						<SectionLabel>Inputs</SectionLabel>
						<div className="flex flex-col gap-3 mb-2">
							{node.inputs.map((port) => {
								const key = `${nodeId}:${port.name}`;
								const isOverridden = connectedInputs.has(key);
								const value = node.inputValues?.[port.name] ?? port.defaultValue ?? "";
								const typeColor = DATA_TYPE_COLOR[port.dataType];

								return (
									<div key={port.name}>
										<div className="flex items-center gap-1.5 mb-1">
											{/* Type dot */}
											<div
												className="w-1.5 h-1.5 rounded-full shrink-0"
												style={{ background: typeColor }}
											/>
											<span className="text-[10px] text-white/60 flex-1">{port.label}</span>
											<span
												className="text-[9px] font-bold tracking-wide"
												style={{ color: typeColor }}>
												{port.dataType}
												{port.isArray ? "[]" : ""}
											</span>
											{isOverridden && (
												<span className="text-[8px] text-white/25 ml-1 italic">overridden</span>
											)}
										</div>
										<PortInput
											port={port}
											value={value}
											isOverridden={isOverridden}
											onChange={(v) => handleInputChange(nodeId, port.name, v)}
										/>
									</div>
								);
							})}
						</div>
					</>
				)}

				{/* Output port info (read-only) */}
				<SectionLabel>Outputs</SectionLabel>
				{node.kind === "parse_obj" ? (
					<ParseObjFieldEditor nodeId={nodeId} outputs={node.outputs} />
				) : (
					<div className="flex flex-col gap-1 mb-3">
						{node.outputs.map((port) => {
							const typeColor = DATA_TYPE_COLOR[port.dataType];
							return (
								<div key={port.name} className="flex items-center gap-1.5 py-0.5">
									<div
										className="w-1.5 h-1.5 rounded-full shrink-0"
										style={{ background: typeColor }}
									/>
									<span className="text-[10px] text-white/50 flex-1">{port.label}</span>
									<span className="text-[9px] font-bold" style={{ color: typeColor }}>
										{port.dataType}
										{port.isArray ? "[]" : ""}
									</span>
								</div>
							);
						})}
					</div>
				)}

				{/* Delete */}
				<button
					className="w-full mt-2 py-1.5 rounded text-[11px] bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
					onClick={() => handleDeleteNode(nodeId)}>
					Remove node
				</button>
			</div>
		);
	};

	const renderEdgeInspector = (edgeId: string) => {
		const edge = edges[edgeId];
		if (!edge) return renderEmpty();
		const srcNode = nodes[edge.src];
		const dstNode = nodes[edge.dst];
		const srcPort = srcNode?.outputs.find((p) => p.name === edge.srcPort);
		const dstPort = dstNode?.inputs.find((p) => p.name === edge.dstPort);
		const typeColor = srcPort ? DATA_TYPE_COLOR[srcPort.dataType] : "var(--text-muted)";

		return (
			<div className="flex flex-col gap-3">
				<SectionLabel>Edge</SectionLabel>

				<div className="flex flex-col gap-2 text-[11px]">
					<div className="flex justify-between items-center">
						<span className="text-white/30">id</span>
						<span className="text-white/50 font-mono">{edge.id}</span>
					</div>

					{/* Type pill */}
					{srcPort && (
						<div className="flex justify-between items-center">
							<span className="text-white/30">type</span>
							<span
								className="text-[9px] font-bold px-2 py-0.5 rounded"
								style={{ color: typeColor, background: `${typeColor}18` }}>
								{srcPort.dataType}
								{srcPort.isArray ? "[]" : ""}
							</span>
						</div>
					)}

					{/* Source */}
					<div className="bg-white/5 rounded p-2 border border-white/5">
						<div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">source</div>
						<div className="text-white/60">{srcNode?.label ?? edge.src}</div>
						<div className="text-[10px] text-white/30">→ {edge.srcPort}</div>
					</div>

					{/* Destination */}
					<div className="bg-white/5 rounded p-2 border border-white/5">
						<div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">destination</div>
						<div className="text-white/60">{dstNode?.label ?? edge.dst}</div>
						<div className="text-[10px] text-white/30">→ {edge.dstPort}</div>
					</div>
				</div>

				<button
					className="w-full mt-1 py-1.5 rounded text-[11px] bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
					onClick={() => handleDeleteEdge(edgeId)}>
					Remove edge
				</button>
			</div>
		);
	};

	return (
		<div
			className="w-75 shrink-0 flex flex-col text-xs border-l border-white/5"
			style={{ background: "var(--surface)" }}>
			<div className="px-3 py-2.5 text-[9px] tracking-widest uppercase text-white/25 border-b border-white/5">
				Inspector
			</div>
			<div className="p-3 flex-1 overflow-y-auto">
				{!selected && renderEmpty()}
				{selected?.kind === "node" && renderNodeInspector(selected.id)}
				{selected?.kind === "edge" && renderEdgeInspector(selected.id)}
			</div>
		</div>
	);
};
