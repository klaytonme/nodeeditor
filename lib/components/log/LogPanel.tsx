'use client';

import React, { useEffect, useRef } from 'react';
import { useLogStore } from '@/lib/stores/logStore';
import type { LogLevel } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// LogPanel — scrolling sync event log at the bottom of the screen.
// Shows every op dispatch, ACK, NACK, and WS lifecycle event.
// ─────────────────────────────────────────────────────────────────────────────

const levelColor: Record<LogLevel, string> = {
  op:   'var(--accent)',
  ack:  'var(--green)',
  err:  'var(--red)',
  ws:   'var(--amber)',
  info: 'var(--text-muted)',
};

function fmt(date: Date): string {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':') + '.' + String(date.getMilliseconds()).padStart(3, '0');
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
    <div style={{
      height: 120, flexShrink: 0,
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit', fontSize: 10,
    }}>
      <div style={{
        padding: '5px 14px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>
        sync log — stub mode · replace syncLayerStub with useGraphSync() for real ws
      </div>

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}
      >
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              padding: '2px 14px', lineHeight: 1.5,
            }}
          >
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: 9 }}>
              {fmt(entry.time)}
            </span>
            <span style={{ color: levelColor[entry.level] }}>
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
