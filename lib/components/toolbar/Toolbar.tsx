'use client';

import React, { useEffect, useState } from 'react';
import { dispatch } from '@/lib/sync/dispatch';
import { useUIStore } from '@/lib/stores/uiStore';
import { useGraphStore } from '@/lib/stores/graphStore';
import { syncLayerStub } from '@/lib/sync/syncLayerStub';
import { NODE_TEMPLATES, NODE_TYPE_HEADER_COLOR } from '@/lib/constants';
import type { NodeType, SyncStatus } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar — top bar with node spawn buttons, run/clear, and sync status.
// ─────────────────────────────────────────────────────────────────────────────

const NODE_TYPES: NodeType[] = ['source', 'transform', 'filter', 'aggregate', 'sink'];

function spawnNode(type: NodeType) {
  const wrap = document.getElementById('canvas-wrap');
  const rect = wrap?.getBoundingClientRect() ?? { width: 800, height: 600 };
  const x = 60 + Math.random() * (rect.width - 280);
  const y = 40 + Math.random() * (rect.height - 180);
  const node = dispatch.addNode({ ...NODE_TEMPLATES[type] });
  useUIStore.getState().setPosition(node.id, { x, y });
}

export const Toolbar: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const isRunning = useUIStore((s) => s.isRunning);

  useEffect(() => {
    const unsub = syncLayerStub.onStatusChange(setSyncStatus);
    return unsub;
  }, []);

  const handleRun = () => {
    const { setRunning } = useUIStore.getState();
    setRunning(true);
    setTimeout(() => setRunning(false), 4000);
  };

  const handleClear = () => {
    dispatch.clearGraph();
    useUIStore.getState().clearSelected();
  };

  const dotColor: Record<SyncStatus, string> = {
    disconnected: 'var(--text-muted)',
    connecting:   'var(--amber)',
    connected:    'var(--green)',
    syncing:      'var(--amber)',
    error:        'var(--red)',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 16px', height: 48,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
        color: 'var(--text)', marginRight: 8,
      }}>
        FLOW<span style={{ color: 'var(--accent)' }}>GRAPH</span>
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.14)', margin: '0 4px' }} />

      {/* Node spawn buttons */}
      {NODE_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => spawnNode(type)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'var(--text-dim)', fontFamily: 'inherit', fontSize: 11,
            cursor: 'pointer', letterSpacing: '0.03em',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface2)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)';
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: NODE_TYPE_HEADER_COLOR[type], flexShrink: 0,
          }} />
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.14)', margin: '0 4px' }} />

      {/* Run */}
      <button
        onClick={handleRun}
        style={{
          padding: '5px 10px', borderRadius: 6,
          background: isRunning ? 'var(--accent-dim)' : 'transparent',
          border: `1px solid ${isRunning ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`,
          color: isRunning ? 'var(--accent)' : 'var(--text-dim)',
          fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
        }}
      >
        {isRunning ? '◼ Stop' : '▶ Run'}
      </button>

      {/* Clear */}
      <button
        onClick={handleClear}
        style={{
          padding: '5px 10px', borderRadius: 6,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.14)',
          color: 'var(--text-dim)', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
        }}
      >
        ⊘ Clear
      </button>

      {/* Sync status */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: dotColor[syncStatus],
          boxShadow: syncStatus === 'connected' ? '0 0 6px var(--green)' : undefined,
          transition: 'background 0.3s',
        }} />
        {syncStatus}
      </div>
    </div>
  );
};
