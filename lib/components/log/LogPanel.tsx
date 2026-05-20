"use client";

import React, { useEffect, useRef } from "react";
import { useLogStore } from "@/lib/stores/logStore";
import type { LogLevel } from "@/lib/types";

/*--------------------------------- LogPanel.tsx ---------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/components/log/LogPanel.tsx                                        |
| Descr:  Just a lil scrolling log panel! Implements 4 levels of log (ack, nack,   |
|   warn, info), keeps itself scrolled down, and updates from the log store.       |
\*--------------------------------------------------------------------------------*/

const levelColor: Record<LogLevel, string> = {
	op: "var(--accent)",
	ack: "var(--green)",
	err: "var(--red)",
	ws: "var(--amber)",
	info: "var(--text-muted)",
};

function fmt(date: Date): string {
	return (
		[
			String(date.getHours()).padStart(2, "0"),
			String(date.getMinutes()).padStart(2, "0"),
			String(date.getSeconds()).padStart(2, "0"),
		].join(":") +
		"." +
		String(date.getMilliseconds()).padStart(3, "0")
	);
}

export const LogPanel: React.FC = () => {
	const entries = useLogStore((s) => s.entries);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom on new entries
	useEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [entries.length]);

	return (
		<div
			className="flex flex-col h-32 text-[10px]"
			style={{
				background: "var(--bg)",
				borderTop: "1px solid var(--border)",
			}}>
			<div
				className="py-1.5 px-3.5 text-[9px] tracking-widest uppercase"
				style={{
					background: "var(--surface)",
					borderBottom: "1px solid var(--border)",
					color: "var(--text-muted)",
				}}>
				sync log — stub mode · replace syncLayerStub with useGraphSync() for real ws
			</div>

			<div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
				{entries.map((entry) => (
					<div key={entry.id} className="flex items-baseline gap-2.5 py-0.5 px-3.5 leading-3.5">
						<span style={{ color: "var(--text-muted)", flexShrink: 0, fontSize: 9 }}>
							{fmt(entry.time)}
						</span>
						<span style={{ color: levelColor[entry.level] }}>{entry.message}</span>
					</div>
				))}
			</div>
		</div>
	);
};
