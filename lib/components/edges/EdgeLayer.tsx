'use client';

import React from 'react';
import { useGraphStore } from '@/lib/stores/graphStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { dispatch } from '@/lib/sync/dispatch';
import { Edge } from './Edge';
import { bezierPath } from './edgePath';
import type { PortPosition } from '@/lib/types';

interface EdgeLayerProps {
  getPortPos: (nodeId: string, side: 'input' | 'output', portName: string) => PortPosition | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EdgeLayer — the full-canvas SVG that renders all edges.
//
// Sits behind the node DOM layer (pointer-events: none on the SVG itself,
// re-enabled per path so edges are still clickable).
//
// Also renders the pending edge being dragged from a port.
// ─────────────────────────────────────────────────────────────────────────────

export const EdgeLayer: React.FC<EdgeLayerProps> = ({ getPortPos }) => {
  const edges = useGraphStore((s) => s.edges);
  const selected = useUIStore((s) => s.selected);
  const portDrag = useUIStore((s) => s.portConnect);
  const isRunning = useUIStore((s) => s.isRunning);

  const handleEdgeClick = (edgeId: string) => {
    useUIStore.getState().setSelected({ kind: 'edge', id: edgeId });
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker id="arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.18)" />
        </marker>
        <marker id="arrow-active" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="var(--accent)" />
        </marker>
        <style>{`
          @keyframes flowAnim {
            to { stroke-dashoffset: -12; }
          }
        `}</style>
      </defs>

      {/* Committed edges */}
      {Object.values(edges).map((edge) => (
        <Edge
          key={edge.id}
          edge={edge}
          srcPos={getPortPos(edge.src, 'output', edge.srcPort)}
          dstPos={getPortPos(edge.dst, 'input', edge.dstPort)}
          isSelected={selected?.kind === 'edge' && selected.id === edge.id}
          isRunning={isRunning}
          onClick={handleEdgeClick}
        />
      ))}

      {/* Pending edge (drag-in-progress) */}
      {portDrag && (() => {
        const srcPos = getPortPos(portDrag.srcNodeId, 'output', portDrag.srcPort);
        if (!srcPos) return null;
        const d = bezierPath(
          srcPos.x, srcPos.y,
          portDrag.currentMouse.x, portDrag.currentMouse.y
        );
        return (
          <path
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            style={{ pointerEvents: 'none' }}
          />
        );
      })()}
    </svg>
  );
};
