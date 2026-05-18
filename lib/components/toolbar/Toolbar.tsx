"use client";

import React, { useEffect, useRef, useState } from "react";
import { dispatch } from "@/lib/sync/dispatch";
import { useUIStore } from "@/lib/stores/uiStore";
import { syncLayerStub } from "@/lib/sync/syncLayerStub";
import { NODE_LIBRARY, TOOLBAR_MENUS, CATEGORY_COLOR } from "@/lib/constants";
import type { NodeKind, NodeCategory, SyncStatus } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar — three category dropdowns + run/clear + sync status
// ─────────────────────────────────────────────────────────────────────────────

function spawnNode(kind: NodeKind, categoryOverride?: NodeCategory) {
	const wrap = document.getElementById("canvas-wrap");
	const rect = wrap?.getBoundingClientRect() ?? { width: 800, height: 600 };
	const x = 60 + Math.random() * (rect.width - 280);
	const y = 40 + Math.random() * (rect.height - 200);
	const template = NODE_LIBRARY[kind];
	const node = dispatch.addNode({
		...template,
		...(categoryOverride ? { category: categoryOverride } : {}),
	});
	useUIStore.getState().setPosition(node.id, { x, y });
}

// ── Dropdown menu ─────────────────────────────────────────────────────────────

interface DropdownProps {
	label: string;
	color: string;
	items: { kind: NodeKind; label: string; categoryOverride?: NodeCategory }[];
	onSelect: (kind: NodeKind, categoryOverride?: NodeCategory) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, color, items, onSelect }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpen(false);
		};
		window.addEventListener("mousedown", handler);
		return () => window.removeEventListener("mousedown", handler);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] border transition-all cursor-pointer ${
					open
						? "bg-white/8 border-white/20 text-white"
						: "bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 hover:border-white/15"
				}`}
				onClick={() => setOpen((v) => !v)}>
				<span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
				{label}
				<span className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
			</button>

			{open && (
				<div
					className="absolute top-full left-0 mt-1.5 z-50 min-w-60 rounded-lg border border-white/10 overflow-hidden shadow-2xl"
					style={{ background: "rgb(22, 24, 28)" }}>
					{items.map((item) => {
						const template = NODE_LIBRARY[item.kind];
						const cat = item.categoryOverride ?? template.category;
						const catColor = CATEGORY_COLOR[cat];
						return (
							<button
								key={`${item.kind}-${cat}`}
								className="w-full flex items-center gap-3 px-3 py-2 text-left text-[11px] text-white/60 hover:bg-white/6 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0"
								onClick={() => {
									onSelect(item.kind, item.categoryOverride);
									setOpen(false);
								}}>
								<span className="w-2 h-2 rounded-sm shrink-0" style={{ background: catColor }} />
								<span className="flex-1">{item.label}</span>
								<span className="text-[9px] text-white/20">
									{template.inputs.length}in · {template.outputs.length}out
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

// ── Toolbar ───────────────────────────────────────────────────────────────────

export const Toolbar: React.FC = () => {
	const [syncStatus, setSyncStatus] = useState<SyncStatus>("disconnected");
	const isRunning = useUIStore((s) => s.isRunning);

	useEffect(() => {
		const unsub = syncLayerStub.onStatusChange(setSyncStatus);
		return unsub;
	}, []);

	const handleRun = () => {
		useUIStore.getState().setRunning(true);
		setTimeout(() => useUIStore.getState().setRunning(false), 4000);
	};

	const handleClear = () => {
		dispatch.clearGraph();
		useUIStore.getState().clearSelected();
	};

	const syncDotColor: Record<SyncStatus, string> = {
		disconnected: "#6b7280",
		connecting: "#f59e0b",
		connected: "#22c55e",
		syncing: "#f59e0b",
		error: "#ef4444",
	};

	return (
		<div
			className="flex items-center gap-2 px-4 h-12 border-b border-white/5 shrink-0 z-50"
			style={{ background: "var(--surface)" }}>
			{/* Logo */}
			<span className="text-[13px] font-bold tracking-widest text-white mr-2">
				FLOW<span className="text-blue-400">GRAPH</span>
			</span>

			<div className="w-px h-5 bg-white/10 mx-1" />

			{/* Category dropdowns */}
			{TOOLBAR_MENUS.map((menu) => (
				<Dropdown
					key={menu.label}
					label={menu.label}
					color={menu.color}
					items={menu.items}
					onSelect={spawnNode}
				/>
			))}

			<div className="w-px h-5 bg-white/10 mx-1" />

			{/* Run */}
			<button
				onClick={handleRun}
				className={`px-3 py-1.5 rounded-md text-[11px] border transition-all cursor-pointer ${
					isRunning
						? "bg-blue-500/15 border-blue-500/40 text-blue-400"
						: "bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80"
				}`}>
				{isRunning ? "◼ Stop" : "▶ Run"}
			</button>

			{/* Clear */}
			<button
				onClick={handleClear}
				className="px-3 py-1.5 rounded-md text-[11px] border border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80 transition-all cursor-pointer">
				⊘ Clear
			</button>

			{/* Sync status */}
			<div className="ml-auto flex items-center gap-2 text-[11px] text-white/30">
				<div
					className="w-1.5 h-1.5 rounded-full transition-all"
					style={{
						background: syncDotColor[syncStatus],
						boxShadow: syncStatus === "connected" ? "0 0 6px #22c55e" : undefined,
					}}
				/>
				{syncStatus}
			</div>
		</div>
	);
};
