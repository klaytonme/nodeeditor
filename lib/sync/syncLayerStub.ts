'use client';

import type { GraphOp, SyncLayer, SyncStatus } from '@/lib/types';
import { useLogStore } from '@/lib/stores/logStore';
import { pendingOps } from './pendingOps';

// ─────────────────────────────────────────────────────────────────────────────
// syncLayerStub — simulates the backend handshake.
//
// Drop-in replacement for useGraphSync (the real WebSocket hook).
// Satisfies the SyncLayer interface exactly:
//   • sendOp(op) → returns txId, fires simulated ACK/NACK after latency
//   • status      → reactive SyncStatus string
//
// To connect a real backend:
//   1. Delete this file (or keep it for offline/test mode)
//   2. Implement useGraphSync (see sync/useGraphSync.ts)
//   3. In dispatch.ts, swap `syncLayerStub` for the hook's return value
// ─────────────────────────────────────────────────────────────────────────────

const SIMULATED_LATENCY_MS = 120;
const SIMULATED_FAILURE_RATE = 0.04; // 4%

let _txCounter = 0;
const makeTxId = () => `tx-${(++_txCounter).toString(36).padStart(4, '0')}`;

let _status: SyncStatus = 'disconnected';
const statusListeners: Array<(s: SyncStatus) => void> = [];

function setStatus(s: SyncStatus) {
  _status = s;
  statusListeners.forEach((fn) => fn(s));
}

// Simulate connecting on init
setTimeout(() => {
  setStatus('connected');
  const { log } = useLogStore.getState();
  log('ws', 'WS stub active — ops simulated with ~120ms latency');
  log('info', 'Replace syncLayerStub with useGraphSync() to connect a real backend');
}, 400);

export const syncLayerStub: SyncLayer & {
  onStatusChange: (fn: (s: SyncStatus) => void) => () => void;
} = {
  get status() {
    return _status;
  },

  sendOp(op: GraphOp): string {
    const txId = makeTxId();
    const { log } = useLogStore.getState();
    log('op', `→ OP ${op.type} [${txId}]`);
    setStatus('syncing');

    const delay = SIMULATED_LATENCY_MS + Math.random() * 80;
    setTimeout(() => {
      const shouldFail = Math.random() < SIMULATED_FAILURE_RATE;
      if (shouldFail) {
        log('err', `✗ NACK ${txId} — backend rejected`);
        pendingOps.rollback(txId);
      } else {
        log('ack', `✓ ACK ${txId}`);
        pendingOps.confirm(txId);
      }
      setStatus('connected');
    }, delay);

    return txId;
  },

  onStatusChange(fn) {
    statusListeners.push(fn);
    return () => {
      const i = statusListeners.indexOf(fn);
      if (i !== -1) statusListeners.splice(i, 1);
    };
  },
};
