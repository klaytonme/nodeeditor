'use client';

import { useLogStore } from '@/lib/stores/logStore';
import { OP_TIMEOUT_MS } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// pendingOps — tracks in-flight ops by txId.
//
// Each op that goes to the backend registers here with:
//   • A rollback function (undoes the optimistic state change)
//   • A timeout (auto-rolls-back if no ACK arrives in OP_TIMEOUT_MS)
//
// On ACK:  confirm(txId) → clears the timer, op is committed
// On NACK: rollback(txId) → clears the timer, calls rollbackFn
// On timeout: rollbackFn is called automatically
// ─────────────────────────────────────────────────────────────────────────────

interface PendingOp {
  rollbackFn: () => void;
  timer: ReturnType<typeof setTimeout>;
}

const ops = new Map<string, PendingOp>();

export const pendingOps = {
  register(txId: string, rollbackFn: () => void) {
    const timer = setTimeout(() => {
      const { log } = useLogStore.getState();
      log('err', `TX ${txId} timed out — rolling back`);
      rollbackFn();
      ops.delete(txId);
    }, OP_TIMEOUT_MS);

    ops.set(txId, { rollbackFn, timer });
  },

  confirm(txId: string) {
    const op = ops.get(txId);
    if (op) {
      clearTimeout(op.timer);
      ops.delete(txId);
    }
  },

  rollback(txId: string) {
    const op = ops.get(txId);
    if (op) {
      clearTimeout(op.timer);
      op.rollbackFn();
      ops.delete(txId);
    }
  },

  size() {
    return ops.size;
  },
};
