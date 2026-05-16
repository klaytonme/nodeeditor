'use client';

import React, { useCallback } from 'react';
import { useGraphStore } from '@/lib/stores/graphStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { dispatch } from '@/lib/sync/dispatch';
import { NODE_TYPE_COLOR, DATA_TYPE_COLOR } from '@/lib/constants';
import type { DataType } from '@/lib/types';

const DATA_TYPES: { type: DataType; label: string; shape: 'circle' | 'diamond' | 'square' }[] = [
  { type: 'str',       label: 'string',    shape: 'circle'  },
  { type: 'int',       label: 'integer',   shape: 'circle'  },
  { type: 'float',     label: 'float',     shape: 'circle'  },
  { type: 'date',      label: 'date',      shape: 'circle'  },
  { type: 'obj',       label: 'object',    shape: 'circle'  },
  { type: 'bool',      label: 'boolean',   shape: 'circle'  },
  { type: 'pulse',     label: 'pulse',     shape: 'circle'  },
  { type: 'encrypted', label: 'encrypted', shape: 'square'  },
];

function PortLegend() {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
        port types
      </div>
      {DATA_TYPES.map(({ type, label, shape }) => {
        const color = DATA_TYPE_COLOR[type];
        const isSquare = shape === 'square';
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{
              width: 9, height: 9, flexShrink: 0,
              background: color,
              borderRadius: isSquare ? 1 : '50%',
              border: '1px solid rgba(0,0,0,0.4)',
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-dim)', flex: 1 }}>{label}</span>
            <span style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: '0.04em' }}>{type}</span>
          </div>
        );
      })}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <div style={{ width: 9, height: 9, background: 'var(--text-muted)', transform: 'rotate(45deg)', borderRadius: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>array (any type)</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inspector — right panel that shows config for the selected node or edge.
//
// Config edits are sent through dispatch.updateConfig() so they go through
// the full optimistic-update + ACK/rollback pipeline.
// ─────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 5,
  padding: '5px 8px',
  fontFamily: 'inherit',
  fontSize: 11,
  color: 'var(--text)',
  outline: 'none',
};

export const Inspector: React.FC = () => {
  const selected = useUIStore((s) => s.selected);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  const handleConfigChange = useCallback(
    (nodeId: string, key: string, value: string) => {
      dispatch.updateConfig(nodeId, { [key]: value });
    },
    []
  );

  const handleLabelChange = useCallback(
    (nodeId: string, value: string) => {
      dispatch.updateLabel(nodeId, value);
    },
    []
  );

  const handleDeleteNode = useCallback((id: string) => {
    dispatch.removeNode(id);
    useUIStore.getState().clearSelected();
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    dispatch.removeEdge(id);
    useUIStore.getState().clearSelected();
  }, []);

  const renderEmpty = () => (
    <>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.7 }}>
        Select a node or edge to inspect it.
        <br /><br />
        Drag from an output port to an input port to connect nodes.
      </p>
      <PortLegend />
    </>
  );

  const renderNodeInspector = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return renderEmpty();
    const color = NODE_TYPE_COLOR[node.type];

    return (
      <>
        {/* Type badge */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>type</div>
          <span style={{
            display: 'inline-block', padding: '2px 8px',
            borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
          }}>
            {node.type}
          </span>
        </div>

        {/* ID (read-only) */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>id</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{node.id}</div>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>label</div>
          <input
            style={inputStyle}
            defaultValue={node.label}
            onBlur={(e) => handleLabelChange(nodeId, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </div>

        {/* Config fields */}
        <div style={{ marginBottom: 6, ...labelStyle }}>config</div>
        {Object.entries(node.config).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={labelStyle}>{key}</div>
            <input
              style={inputStyle}
              defaultValue={value}
              onBlur={(e) => handleConfigChange(nodeId, key, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            />
          </div>
        ))}

        {/* Delete */}
        <button
          style={{
            width: '100%', marginTop: 8, padding: '6px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 6, color: 'var(--red)',
            fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
          }}
          onClick={() => handleDeleteNode(nodeId)}
        >
          Remove node
        </button>
      </>
    );
  };

  const renderEdgeInspector = (edgeId: string) => {
    const edge = edges[edgeId];
    if (!edge) return renderEmpty();

    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>edge id</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{edge.id}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>source</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{edge.src} → {edge.srcPort}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>destination</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{edge.dst} → {edge.dstPort}</div>
        </div>
        <button
          style={{
            width: '100%', marginTop: 8, padding: '6px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 6, color: 'var(--red)',
            fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
          }}
          onClick={() => handleDeleteEdge(edgeId)}
        >
          Remove edge
        </button>
      </>
    );
  };

  return (
    <div style={{
      width: 350, flexShrink: 0,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      fontSize: 12,
    }}>
      <div style={{
        padding: '12px 14px 10px',
        fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
      }}>
        Inspector
      </div>
      <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
        {!selected && renderEmpty()}
        {selected?.kind === 'node' && renderNodeInspector(selected.id)}
        {selected?.kind === 'edge' && renderEdgeInspector(selected.id)}
      </div>
    </div>
  );
};