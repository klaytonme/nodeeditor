'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useGraphStore } from '@/lib/stores/graphStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { usePortPositions } from '@/lib/hooks/usePortPositions';
import { Node } from '@/lib/components/nodes/Node';
import { EdgeLayer } from '@/lib/components/edges/EdgeLayer';

// ─────────────────────────────────────────────────────────────────────────────
// Canvas — the main editing surface.
//
// Responsibilities:
//   • Renders all Node components (DOM, absolutely positioned)
//   • Renders EdgeLayer (SVG, sits behind nodes)
//   • Owns the port position registry (usePortPositions)
//   • Forwards mouse events to uiStore (portDrag mouse tracking)
//   • Clears selection on background click
// ─────────────────────────────────────────────────────────────────────────────

export const Canvas: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const positions = useUIStore((s) => s.positions);
  const selected = useUIStore((s) => s.selected);
  const portDrag = useUIStore((s) => s.portDrag);

  const { registerPort, updateAll, getPortPos } = usePortPositions(wrapRef);

  // Recompute port positions after every render (node move / add / remove)
  useEffect(() => {
    updateAll();
  });

  // Track mouse for the in-progress edge
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!portDrag) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    useUIStore.getState().updatePortDrag({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    updateAll();
  }, [portDrag, updateAll]);

  // Cancel port drag on mouse up anywhere on canvas
  const handleMouseUp = useCallback(() => {
    if (portDrag) useUIStore.getState().endPortDrag();
  }, [portDrag]);

  // Clear selection on background click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === wrapRef.current) {
      useUIStore.getState().clearSelected();
    }
  }, []);

  // Compute which ports are connected (for the port filled indicator)
  const connectedPortsByNode: Record<string, Set<string>> = {};
  Object.values(edges).forEach((edge) => {
    if (!connectedPortsByNode[edge.src]) connectedPortsByNode[edge.src] = new Set();
    if (!connectedPortsByNode[edge.dst]) connectedPortsByNode[edge.dst] = new Set();
    connectedPortsByNode[edge.src].add(`output:${edge.srcPort}`);
    connectedPortsByNode[edge.dst].add(`input:${edge.dstPort}`);
  });

  return (
    <div
      ref={wrapRef}
	  className="h-full w-full"
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        cursor: portDrag ? 'crosshair' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* SVG edge layer — behind nodes */}
      <EdgeLayer getPortPos={getPortPos} />

      {/* Node DOM layer */}
      {Object.values(nodes).map((node) => (
        <Node
          key={node.id}
          node={node}
          position={positions[node.id] ?? { x: 80, y: 80 }}
          isSelected={selected?.kind === 'node' && selected.id === node.id}
          connectedPorts={connectedPortsByNode[node.id] ?? new Set()}
          registerPort={registerPort}
          onDragMove={updateAll}
		  getPortPos={getPortPos}
		  updateAll={updateAll}
        />
      ))}
    </div>
  );
};
