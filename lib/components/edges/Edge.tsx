'use client';

import React from 'react';
import type { EdgeDef } from '@/lib/types';
import { bezierPath } from './edgePath';
import type { PortPosition } from '@/lib/types';

interface EdgeProps {
  edge: EdgeDef;
  srcPos: PortPosition | null;
  dstPos: PortPosition | null;
  isSelected: boolean;
  isRunning: boolean;
  onClick: (edgeId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge — renders a single connection between two ports as an SVG path.
//
// Two paths are stacked:
//   1. base  — the static line (hover/selected highlight)
//   2. flow  — animated dashes shown when graph is "running"
//
// Positions are passed in from the parent EdgeLayer which owns the
// port position registry (usePortPositions). This keeps the Edge itself
// stateless and fast to re-render.
// ─────────────────────────────────────────────────────────────────────────────

export const Edge: React.FC<EdgeProps> = ({
  edge,
  srcPos,
  dstPos,
  isSelected,
  isRunning,
  onClick,
}) => {
  if (!srcPos || !dstPos) return null;

  const d = bezierPath(srcPos.x, srcPos.y, dstPos.x, dstPos.y);

  return (
    <g
      data-eid={edge.id}
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(edge.id)}
    >
      {/* Invisible wide hit area so clicking edges isn't fiddly */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} style={{pointerEvents: "auto"}} />

      {/* Visible base line */}
      <path
        d={d}
        fill="none"
        stroke={isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}
        strokeWidth={isSelected ? 2 : 1.5}
        markerEnd={isSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
        style={{ transition: 'stroke 0.15s' }}
      />

      {/* Flow animation overlay */}
      {isRunning && (
        <path
          d={d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="4 8"
          style={{
            animation: 'flowAnim 1.2s linear infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </g>
  );
};
