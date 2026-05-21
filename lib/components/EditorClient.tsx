"use client";

import React, { useEffect, useState } from "react";
import { Toolbar } from "@/lib/components/toolbar/Toolbar";
import { Canvas } from "@/lib/components/canvas/Canvas";
import { Inspector } from "@/lib/components/inspector/Inspector";
import { LogPanel } from "@/lib/components/log/LogPanel";
import { seedGraph } from "@/lib/constants/seedGraph";
import { InfoPanel } from "./info/InfoPanel";

/*------------------------------- EditorClient.tsx -------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/components/EditorClient.tsx                                        |
| Descr:  Top level entity. Contains Toolbar, Inspector, Canvas, Log, and Info     |
|   panel. Along with the info panel, it includes the logic to show and hide the   |
|   panel, the handlers for which are passed to the toolbar. This represents the   |
|   edge of the 'use client' boundary.                                             |
\*--------------------------------------------------------------------------------*/

// For future Clayton: connect a real backend by add this here:
//   const sync = useGraphSync('graph-001');
//   useEffect(() => { dispatch.setSyncLayer(sync); }, [sync]);
//
// to connect the dispatcher and the sync layer once the sync layer loads

export function EditorClient() {
	// Info visibility
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

	// Page components
	return (
		<>
			<div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
				<Toolbar showInfo={() => setInfoVisibility(true)} />
				<div className="flex flex-1 overflow-hidden">
					<div id="canvas-wrap" className="flex-1 relative overflow-hidden">
						<Canvas />
					</div>
					<Inspector />
				</div>
				<LogPanel />
			</div>

			{/* Info, including the background blur and clickaway logic. Passes hide logic to the Info Panel */}
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
