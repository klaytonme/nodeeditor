"use client";

import React, { useEffect, useState } from "react";
import { Toolbar } from "@/lib/components/toolbar/Toolbar";
import { Canvas } from "@/lib/components/canvas/Canvas";
import { Inspector } from "@/lib/components/inspector/Inspector";
import { LogPanel } from "@/lib/components/log/LogPanel";
import { seedGraph } from "@/lib/constants/seedGraph";
import { InfoPanel } from "./info/InfoPanel";

// ─────────────────────────────────────────────────────────────────────────────
// EditorClient — the top-level 'use client' boundary.
//
// app/page.tsx is a Server Component that renders this.
// All browser-dependent code (stores, drag, WebSocket) lives below this boundary.
//
// To connect a real backend, add this here:
//   const sync = useGraphSync('graph-001');
//   useEffect(() => { dispatch.setSyncLayer(sync); }, [sync]);
// ─────────────────────────────────────────────────────────────────────────────

export function EditorClient() {
	const [infoShown, setInfoVisibility] = useState(true);

	useEffect(() => {
		seedGraph();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (infoShown && e.key === "Escape") setInfoVisibility(false);
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown); // cleanup
	}, [infoShown]);

	return (
		<>
			<div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
				<Toolbar showInfo={() => setInfoVisibility(true)} />
				<div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
					<div id="canvas-wrap" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
						<Canvas />
					</div>
					<Inspector />
				</div>
				<LogPanel />
			</div>
			{infoShown && (
				<div
					className="flex absolute w-full h-full bg-white/10 z-60 backdrop-blur-lg align-middle justify-center items-center"
					onClick={() => setInfoVisibility(false)}>
					<div className="flex px-6 md:px-20 w-[90%]">
						<div className="flex w-full" onClick={(e) => e.stopPropagation()}>
							<InfoPanel hideInfo={() => setInfoVisibility(false)}></InfoPanel>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
