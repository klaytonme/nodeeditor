'use client';

import React, { useEffect } from 'react';
import { Toolbar } from '@/lib/components/toolbar/Toolbar';
import { Canvas } from '@/lib/components/canvas/Canvas';
import { Inspector } from '@/lib/components/inspector/Inspector';
import { LogPanel } from '@/lib/components/log/LogPanel';
import { seedGraph } from '@/lib/constants/seedGraph';

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
  useEffect(() => {
    seedGraph();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div id="canvas-wrap" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas />
        </div>
        <Inspector />
      </div>
      <LogPanel />
    </div>
  );
}
