'use client';

import React, { useCallback } from 'react';
import type { NodeDef, PortPosition } from '@/lib/types';
import { useUIStore } from '@/lib/stores/uiStore';
import { useNodeDrag } from '@/lib/hooks/useNodeDrag';
import { Port } from './Port';
import { NODE_TYPE_HEADER_COLOR, NODE_WIDTH, PORT_SIZE } from '@/lib/constants';

interface NodeProps {
  node: NodeDef;
  position: { x: number; y: number };
  isSelected: boolean;
  connectedPorts: Set<string>; // `${side}:${portName}`
  registerPort: (nodeId: string, portName: string, side: 'input' | 'output', el: HTMLElement | null) => void;
  onDragMove: () => void;
	getPortPos: (nodeId: string, side: 'input' | 'output', portName: string) => PortPosition | null;
	updateAll: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node — row-based layout matching Cloudstream original:
//
//   ┌─────────────────────────┐
//   │  [coloured title bar]   │  ← draggable header
//   ├─────────────────────────┤
//   ● input field    value    │  ← input rows (port left, label, type badge)
//   ● input field    value    │
//   ├─────────────────────────┤
//   │ output field   value    ●  ← output rows (label, type badge, port right)
//   │ output field   value    ●
//   └─────────────────────────┘
//
// Ports sit at the very edge of each row and are registered with usePortPositions
// so edges can find their exact DOM coordinates.
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  padding: '4px 10px 2px',
};

const DIVIDER: React.CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.07)',
  margin: '2px 0',
};

export const Node: React.FC<NodeProps> = ({
  node,
  position,
  isSelected,
  connectedPorts,
  registerPort,
  onDragMove,
  getPortPos,
  updateAll
}) => {
  const { onMouseDown } = useNodeDrag(node.id, onDragMove);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-port]')) return;
      useUIStore.getState().setSelected({ kind: 'node', id: node.id });
    },
    [node.id]
  );

  const headerColor = NODE_TYPE_HEADER_COLOR[node.type];

  return (
    <div
      data-nodeid={node.id}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: NODE_WIDTH,
        background: 'rgb(49, 49, 49)',
        borderRight: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0)'}`,
		borderBottom: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0)'}`,
		borderLeft: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
		borderTop: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 10,
        boxShadow: isSelected
          ? '0 0 0 1px var(--accent-glow), 0 4px 24px rgba(0,0,0,0.6)'
          : '0 4px 8px rgba(0,0,0,0.3)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        userSelect: 'none',
        overflow: 'visible',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* ── Title bar ── */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          height: 26,
          background: headerColor,
          borderRadius: '9px 9px 0 0',
          cursor: 'move',
        }}
      >
        <span style={{
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          userSelect: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {node.label}
        </span>
        <span style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.5)',
          marginLeft: 8,
          flexShrink: 0,
        }}>
          {node.id}
        </span>
      </div>

      {/* ── Input rows ── */}
      {node.inputs.length > 0 && (
        <div style={{ paddingTop: 4, paddingBottom: 2 }}>
          {node.inputs.map((port) => (
            <div
              key={port.name}
              className="w-full h-full"
            >
              <Port
                nodeId={node.id}
                portName={port.name}
                label={port.label}
                dataType={port.dataType}
                isArray={port.isArray}
                side="input"
                isConnected={connectedPorts.has(`input:${port.name}`)}
                portRef={(el) => registerPort(node.id, port.name, 'input', el)}
                onDragMove={onDragMove}
				getPortPos={getPortPos}
				updatePortPositions={updateAll}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Divider between inputs and outputs ── */}
      {node.inputs.length > 0 && node.outputs.length > 0 && (
        <div style={DIVIDER} />
      )}

      {/* ── Output rows ── */}
      {node.outputs.length > 0 && (
        <div style={{ paddingTop: 2, paddingBottom: 4 }}>
          {node.outputs.map((port) => (
            <div
              key={port.name}
              className="w-full h-full"
            >
              <Port
                nodeId={node.id}
                portName={port.name}
                label={port.label}
                dataType={port.dataType}
                isArray={port.isArray}
                side="output"
                isConnected={connectedPorts.has(`output:${port.name}`)}
                portRef={(el) => registerPort(node.id, port.name, 'output', el)}
                onDragMove={onDragMove}
				getPortPos={getPortPos}
				updatePortPositions={updateAll}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};